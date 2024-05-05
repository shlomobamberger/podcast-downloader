const socket = io();

function showDownloadButton() {
    document.getElementById('downloadButton').style.display = 'inline-block';
    document.getElementById('cancelButton').style.display = 'none';
}

function hideDownloadButton() {
    document.getElementById('cancelButton').style.display = 'inline-block';
    document.getElementById('downloadButton').style.display = 'none';
}

function downloadPodcast() {
    const rssUrl = document.getElementById('rssInput').value;
    if (!rssUrl) {
        document.getElementById('status').innerText = "Please enter a valid RSS feed URL";
        return;
    }
    hideDownloadButton();
    document.getElementById('status').innerText = "Connecting to server...";
    socket.emit('download', rssUrl);
}

function cancelDownload() {
    socket.emit('cancel_download');
    document.getElementById('status').innerText = "Download cancelled";
    showDownloadButton();
}

socket.on('progress', (data) => {
    document.getElementById('status').innerText = `Downloading: ${data.episode} (${data.progress})`;
});

socket.on('error', (message) => {
    document.getElementById('status').innerText = `Error: ${message}`;
    showDownloadButton();
});

socket.on('completed', (downloadUrl) => {
    const status = document.getElementById('status');
    status.innerText = "Download complete! Click the link below to download your podcast as a zip file.";

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.innerText = "Download Podcasts";
    link.className = "download-link"; 
    link.style.display = "block"; 

    link.addEventListener('click', () => {
        socket.emit('zip_downloaded');
        link.style.display = 'none';
        status.innerText = '';
        showDownloadButton();
    });

    status.appendChild(link); 
});

socket.on('downloadsCounterUpdate', (downloadsCounterUpdate) => {
    document.getElementById('downloadsCounter').innerText = downloadsCounterUpdate;
});


