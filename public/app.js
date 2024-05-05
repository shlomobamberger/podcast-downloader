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
    document.getElementById('downloadButton').style.display = 'inline-block'; // Show download button
}

socket.on('progress', (data) => {
    document.getElementById('status').innerText = `Downloading: ${data.episode} (${data.progress})`;
    document.getElementById('downloadButton').style.display = 'none'; // Hide download button
});

socket.on('error', (message) => {
    document.getElementById('status').innerText = `Error: ${message}`;
    document.getElementById('cancelButton').style.display = 'none'; // Hide cancel button
});

socket.on('completed', (downloadUrl) => {
    const status = document.getElementById('status');
    status.innerText = "Download complete! Click the link below to download your podcast as a zip file.";

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.innerText = "Download Podcasts";
    link.className = "download-link"; // Ensure this class is styled appropriately
    link.style.display = "block";  // Ensure the link appears on a new line

    // once actual dowload button is clicked, we will update the server about the download
    link.addEventListener('click', () => {
        socket.emit('zip_downloaded');
        // hide the link after it is clicked
        link.style.display = 'none';
        // show again the download button
        document.getElementById('downloadButton').style.display = 'inline-block';
    });

    status.appendChild(link); // Append the link to the status container
    document.getElementById('cancelButton').style.display = 'none'; // Hide cancel button
});

socket.on('downloadsCounterUpdate', (downloadsCounterUpdate) => {
    document.getElementById('downloadsCounter').innerText = downloadsCounterUpdate;
});


