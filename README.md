# Podcast Downloader

Welcome to the Podcast Downloader application! This tool allows you to download all episodes from a given podcast RSS feed directly into a single zip file. Whether you're a podcast enthusiast or just getting started, this app makes it easy to take your favorite episodes offline for on-the-go listening.

## Features

- **Download Full Podcast Series:** Input the RSS feed URL of your desired podcast and download all episodes as MP3 files zipped together.
- **Progress Tracking:** Real-time updates on the download progress of each episode.
- **Cancel Anytime:** Option to cancel the download process if needed.

## Application URL

Access the live application here: [Podcast Downloader](https://podcast-downloader-03f5e4ae4399.herokuapp.com/)

## How It Works

1. **Enter the RSS Feed URL:** Simply paste the RSS feed URL of the podcast you wish to download in the provided field.
2. **Start the Download:** Click the "Download Episodes" button to start the download process.
3. **Download Your Podcasts:** Once the download is complete, a link will appear allowing you to download the zip file containing all the podcast episodes.

## Installation

To run this application locally, you will need Node.js and npm installed on your machine. Follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/shlomobamberger/podcast-downloader.git
   cd podcast-downloader
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Technologies Used

- **Node.js** - Server-side JavaScript runtime.
- **Express** - Web application framework for Node.js.
- **Socket.IO** - Enables real-time, bidirectional and event-based communication.
- **Axios** - Promise-based HTTP client for the browser and node.js.
- **JSZip** - A library to create, read, and edit .zip files with JavaScript.

## Contributions

Contributions are always welcome! 

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
ree to adjust the content as needed to better fit your project's specifics or personal style. This README provides a basic structure that communicates the essential information about the application while inviting contributions and use.