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

socket.on('completed', (base64Data) => {
    document.getElementById('status').innerText = "Download complete!";
    document.getElementById('cancelButton').style.display = 'none'; // Hide cancel button

    console.log(`Received zip file size: ${base64Data.length} characters`);
    const link = document.createElement('a');
    link.href = `data:application/zip;base64,${base64Data}`;
    link.download = 'podcasts.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    document.getElementById('status').innerText = "Download complete!";
});
