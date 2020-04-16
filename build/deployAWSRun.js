var parseArgs = require('minimist')
const deployAWS = require('./deployAws');
const settings = require('./settings');

var args = parseArgs(process.argv);
if(typeof args.e !== undefined) {
  deployAWS.uploadFiles(args.e);
}
