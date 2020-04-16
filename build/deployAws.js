let AWS = require('aws-sdk');
const fs = require('fs');
const path    = require('path');
// const pjson = require('../package.json');
const settings = require('./settings');
// const svgsToFonts = require('./svgsToFonts');
var mime = require('mime-types')
const folder = `${path.resolve(__dirname, '../').split(path.sep).pop()}`;


const AWS_CREDENTIALS = new AWS.SharedIniFileCredentials({
  profile: 'personal'
});
let BUCKET_NAME = 'womens-rights-properties';
const API_VERSION = '2006-03-01';

AWS.config.credentials = AWS_CREDENTIALS;

// Create a promise on S3 service object
const ICON_BUCKET_PROMISE = new AWS.S3({
  apiVersion: API_VERSION
});

/**
 * Given a file path and its data, add it to our
 * csm_fonts bucket under the cs-icons bucket.
 * @param {String} path the file path
 * @param {String} data the file data
 * @return {Promise} returns null or a AWS.S3 managed upload promise
 */
// see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
const uploadFileToAWS = (path, data, contentType = '') => {
  if (data) {
    if(contentType) {
      const managedUpload = ICON_BUCKET_PROMISE
      .upload({
        Bucket: BUCKET_NAME,
        Key: path,
        Body: data,
        ACL: 'public-read',
        Metadata: {},
        ContentType: contentType
      });

    return managedUpload
      .promise()
      .then((test) => {
        console.log(test);
      }, (error) => {
        console.log(error);
      });
    } else {
      console.error(`Did not upload ${path} since it does not have a valid content-type`);
    }
  }
  return null;
};

/**
 * Given the desired aws bucket path and the system folder path. Loop
 * through all files in a given folder and then add them to the csm_fonts
 * bucket under the cs-icons folder
 * @param {String} AWSFolderPath the folder path we want to create in the bucket
 * @param {String} systemFolderPath the system folder path
 * @return {Promise} The file system readdir promise
 */
const readFilesUploadAWS = (AWSFolderPath = null, systemFolderPath = null) => fs.readdir(systemFolderPath, (err, files) => {
  if (err) {
    console.warn('NOT NECESSARILY AN ERROR, but ... Could not list the directory.', err);
  } else {
    files.forEach((file) => {
      const filePath = `${systemFolderPath}/${file}`;
      const fileInfo = fs.lstatSync(filePath);
      if(!settings.ignore.includes(file)) {
        if(!fileInfo.isDirectory()) {
          fs.readFile(filePath, (err, data) => {
            if (err) {
              console.log('error', err);
            }
            let folderPath = '';
            if(AWSFolderPath.length) {
              folderPath = `${AWSFolderPath}/`;
            }
            
            const regex = new RegExp("^.+\/" + folder + "\/", "g");
            // get path from syspath and upload the same structure to aws
            if(systemFolderPath.search(regex,'') !== -1) {
              folderPath = `${systemFolderPath.replace(regex,'')}/`;
            }
            uploadFileToAWS(`${folderPath}${file}`, data, mime.lookup(file));
          });
        } else {
          readFilesUploadAWS(AWSFolderPath, filePath);
        }
      }
    });
  }
});

/**
 * go through each location our icons are in and create a new icon font family
 * @returns {void}
 */
const uploadFiles = (env = null) => {
  if(env) {
    switch(env) {
      case 'qa':
          BUCKET_NAME = settings.domains.qa;
        break;
      case 'live':
          BUCKET_NAME = settings.domains.live;
        break;
    }
    const root = path.resolve(__dirname, '../');
  
    try {
      // sass processor
      Promise.all([
        readFilesUploadAWS('', `${root}`),
      ]).then(() => {
        // if (settings.iconFolderPaths.length) {
        //   uploadFiles(settings.iconFolderPaths.pop());
        // }
      });
    } catch (error) {
      console.log(error);
    }
  }
};

// uploadFiles(settings.iconFolderPaths.pop());
module.exports = {
  AWS_CREDENTIALS,
  BUCKET_NAME,
  API_VERSION,
  ICON_BUCKET_PROMISE,
  uploadFileToAWS,
  readFilesUploadAWS,
  uploadFiles
};
