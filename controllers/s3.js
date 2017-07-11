const AWSXRay = require('aws-xray-sdk'),
      AWS = AWSXRay.captureAWS(require('aws-sdk')),
      s3 = AWSXRay.captureAWSClient(new AWS.S3({apiVersion: '2006-03-01', region: 'eu-west-1'})),
      multer = require('multer'),
      multerS3 = require('multer-s3');


let upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'fb-example-upload',
        key: function (req, file, cb) {
            console.log(file);
            cb(null, file.originalname);
        }
    })
});

module.exports = upload




