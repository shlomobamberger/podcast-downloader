const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const RSSParser = require('rss-parser');
const axios = require('axios');
const JSZip = require('jszip');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

const parser = new RSSParser();
let currentDownloads = {};
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('download', async (rssUrl) => {
    currentDownloads[socket.id] = true; // Flag to keep track of active download

    if (!rssUrl) {
      socket.emit('error', 'RSS URL is required');
      return;
    }

    console.log(`Downloading podcast from ${rssUrl}`);

    try {
      const feed = await parser.parseURL(rssUrl);
      socket.emit('episode_count', feed.items.length);
      console.log(`Total episodes: ${feed.items.length}`);

      const zip = new JSZip();

      for (let i = 0; i < feed.items.length; i++) {
        if (!currentDownloads[socket.id]) break; // Stop if cancellation flag is set

       // TODO: remove on production
        if (i > 0) {
            break;
        }

        const item = feed.items[i];
        // console.log(`Downloading: ${item.title} (${i + 1} of ${feed.items.length})`);
        console.log(`Downloading... (${i + 1} of ${feed.items.length})`);
        const response = await axios.get(item.enclosure.url, { responseType: 'arraybuffer' });
        zip.file(item.title + '.mp3', response.data);
        socket.emit('progress', {
          episode: item.title,
          progress: `${i + 1} of ${feed.items.length}`
        });
      }

      if (currentDownloads[socket.id]) {
        console.log('Download completed');
        const content = await zip.generateAsync({ type: 'nodebuffer' });
        console.log('zip generated')
        socket.emit('completed', content.toString('base64'));
      }
    

    } catch (error) {
        socket.emit('error', 'Error processing your request');
    } finally {
        delete currentDownloads[socket.id]; // Clean up after download completes or cancels
    }
    });
    
    socket.on('cancel_download', () => {
        currentDownloads[socket.id] = false; // Set flag to false to cancel download
    });

});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
