let AWS = require('aws-sdk');
var parseArgs = require('minimist')
const settings = require('./settings');

var cloudfront = new AWS.CloudFront();
var params = {
  DistributionId: 'STRING_VALUE', /* required */
  InvalidationBatch: { /* required */
    CallerReference: 'STRING_VALUE', /* required */
    Paths: { /* required */
      Quantity: 'NUMBER_VALUE', /* required */
      Items: [
        'STRING_VALUE',
        /* more items */
      ]
    }
  }
};


var args = parseArgs(process.argv);
if(typeof args.e !== undefined) {
  var params = {
    DistributionId: null, /* required */
    InvalidationBatch: { /* required */
      CallerReference: `${settings.invalidation.CALLER_REFERENCE}`, /* required */
      Paths: { /* required */
        Quantity: 0, /* required */
        Items: [
        ]
      }
    }
  };
  var CDN_DOMAIN = null;
  if (args.e == 'live') {
    params.DistributionId = settings.invalidation.LIVE_ID;
    params.InvalidationBatch.Paths.Items = String.prototype.split.call(settings.invalidation.ITEMS, ',');
    params.InvalidationBatch.Paths.Quantity = params.InvalidationBatch.Paths.Items.length;
    CDN_DOMAIN = settings.domains.CDN_LIVE;
  }
  else if (args.e == 'qa') {
    params.DistributionId = settings.invalidation.QA_ID;
    params.InvalidationBatch.Paths.Items = String.prototype.split.call(settings.invalidation.ITEMS, ',');
    params.InvalidationBatch.Paths.Quantity = params.InvalidationBatch.Paths.Items.length;
    CDN_DOMAIN = settings.domains.CDN_QA;
  }
  if(args.e && params.DistributionId) {
    cloudfront.createInvalidation(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else {
        console.log(`Invalidation on ${args.e} enviroment (${params.DistributionId}) Successful. Checkout ${CDN_DOMAIN}.`);
        console.log(data);
      };
    });
  }
}
