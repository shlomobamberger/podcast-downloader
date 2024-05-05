const AWS = require('aws-sdk');
require('dotenv').config();


// Load credentials from environment variables
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const bucketName = process.env.S3_BUCKET_NAME;
const viewsFileName = process.env.VIEWS_FILE_NAME;
const podcastDownloadedMetadata = process.env.PODCAST_DOWNLOADED_METADATA_FILE_NAME;

async function uploadFileToS3(fileContent, fileName) {
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent
    };
  
    try {
      const data = await s3.upload(params).promise();
        console.log("File uploaded successfully to S3:", data.Location);
      return data.Location;
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw error;
    }
  }


  async function downloadFileFromS3(fileName) {
    const params = {
      Bucket: bucketName,
      Key: fileName
    };
  
    try {
      const data = await s3.getObject(params).promise();
      console.log("File downloaded successfully from S3:", fileName);
      return data.Body;
    } catch (error) {
      console.error("Error downloading file from S3:", error);
        if (error.code === 'NoSuchKey') {
            if (fileName === viewsFileName) {
                // Initialize the views counter if it doesn't exist
                await uploadFileToS3('0', viewsFileName);
                return '0';
            }
            if (fileName === podcastDownloadedMetadata) {
                // Initialize the podcast downloaded metadata if it doesn't exist
                await uploadFileToS3('podcastTitle,episodesNumber,currentViews,currentDate\n', podcastDownloadedMetadata);
                return '';
            }
        }
    }

  }

    module.exports = {
        uploadFileToS3,
        downloadFileFromS3,
        viewsFileName,
        podcastDownloadedMetadata
    };
  