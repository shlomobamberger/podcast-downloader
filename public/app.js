const socket = io();

function downloadPodcast() {
    const rssUrl = document.getElementById('rssInput').value;
    if (!rssUrl) {
        alert("Please enter an RSS URL");
        return;
    }

    document.getElementById('status').innerText = "Connecting to server...";
    socket.emit('download', rssUrl);
    document.getElementById('cancelButton').style.display = 'inline-block'; // Show cancel button
}

function cancelDownload() {
    socket.emit('cancel_download');
    document.getElementById('status').innerText = "Download cancelled";
    document.getElementById('cancelButton').style.display = 'none'; // Hide cancel button
}

socket.on('progress', (data) => {
    document.getElementById('status').innerText = `Downloading: ${data.episode} (${data.progress})`;
});

socket.on('error', (message) => {
    document.getElementById('status').innerText = `Error: ${message}`;
    document.getElementById('cancelButton').style.display = 'none'; // Hide cancel button
});

socket.on('completed', (downloadUrl, title) => {
    document.getElementById('status').innerText = "Download complete! Click the link below to download your podcasts.";
    document.getElementById('cancelButton').style.display = 'none'; // Hide cancel button

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.innerText = "Download Podcasts";
    link.className = "download-link"; // Add a class for styling
    document.body.appendChild(link);
});

