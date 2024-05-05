const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const RSSParser = require('rss-parser');
const axios = require('axios');
const JSZip = require('jszip');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sanitize = require('sanitize-filename');
const aws_things = require('./aws_things');
const uploadFileToS3 = aws_things.uploadFileToS3;
const downloadFileFromS3 = aws_things.downloadFileFromS3;
const viewsFileName = aws_things.viewsFileName;
const podcastDownloadedMetadata = aws_things.podcastDownloadedMetadata;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;
const downloadsFolder = path.join(__dirname, 'downloads');

// Ensure the downloads folder exists
if (!fs.existsSync(downloadsFolder)) {
  fs.mkdirSync(downloadsFolder);
}

app.use(cors());
app.use(express.static('public'));
app.use('/downloads', express.static(downloadsFolder)); // Serve files from the downloads folder

const parser = new RSSParser();
let currentDownloads = {};
io.on('connection', (socket) => {
  let podcastTitle = undefined;
  let episodesNumber = undefined;
  let currentViews = undefined;
  let currentDate = new Date().toISOString();;

  console.log('A user connected');
  // update the download counter
  downloadFileFromS3(viewsFileName).then((views) => {
    io.emit('downloadsCounterUpdate', parseInt(views.toString()));
  }).catch((error) => {
    console.error('Error updating download count:', error);
  });

  socket.on('download', async (rssUrl) => {
    currentDownloads[socket.id] = true; // Flag to keep track of active download

    if (!rssUrl) {
      socket.emit('error', 'RSS URL is required');
      return;
    }

    console.log(`Downloading podcast from ${rssUrl}`);

    try {
      const feed = await parser.parseURL(rssUrl);
      podcastTitle = sanitize(feed.title || 'podcast'); 
      episodesNumber = feed.items.length;
      const filename = `${podcastTitle}.zip`;
      const filepath = path.join(downloadsFolder, filename);

      socket.emit('episode_count', episodesNumber);
      console.log(`Total episodes: ${episodesNumber}`);

      const zip = new JSZip();
      
      


      for (let i = 0; i < episodesNumber; i++) {
        if (!currentDownloads[socket.id]) break; // Stop if cancellation flag is set

        const item = feed.items[i];
        console.log(`Downloading... (${i + 1} of ${episodesNumber})`);
        const response = await axios.get(item.enclosure.url, { responseType: 'arraybuffer' });
        zip.file(sanitize(podcastTitle) + '.mp3', response.data);
        if (!currentDownloads[socket.id]) break; // need to check again after the download
        socket.emit('progress', {
          episode: podcastTitle,
          progress: `${i + 1} of ${episodesNumber}`
        });
      }

      if (currentDownloads[socket.id]) {
        console.log('Download completed');
        await zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
          .pipe(fs.createWriteStream(filepath))
          .on('finish', () => {
            console.log('Zip file has been written.');
            socket.emit('completed', `/downloads/${filename}`);
          });
      }
    } catch (error) {
      socket.emit('error', 'Error processing your request');
    } finally {
      delete currentDownloads[socket.id]; // Clean up after download completes or cancels
    }
  });

  socket.on('cancel_download', () => {
    console.log('Cancelling download');
    currentDownloads[socket.id] = false; // Set flag to false to cancel download
  });

  socket.on('zip_downloaded', async () => {
    try {
      const views = await downloadFileFromS3(viewsFileName) || '0';
      currentViews = parseInt(views.toString());
      currentViews += 1;
      await uploadFileToS3(currentViews.toString(), viewsFileName);
      io.emit('downloadsCounterUpdate', currentViews);

      // update the podcast downloaded metadata
      const metadata = await downloadFileFromS3(podcastDownloadedMetadata) || '';
      // metadata is a csv file with the following format:
      // podcast_title,episodes_number,current_downloads,current_date
      const metadataString = metadata.toString();
      const newMetadata = `${podcastTitle},${episodesNumber},${currentViews},${currentDate}\n`;
      await uploadFileToS3(metadataString + newMetadata, podcastDownloadedMetadata);

    } catch (error) {
      console.error('Error updating download count:', error);
    }
  });

});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
