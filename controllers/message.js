const AWSXRay = require('aws-xray-sdk'),
      AWS = AWSXRay.captureAWS(require('aws-sdk')),
      sqs = AWSXRay.captureAWSClient(new AWS.SQS({apiVersion: '2012-11-05', region: 'eu-west-1'}));

module.exports = {
    sendMessage: function(name, message, email, queue) {
        let params = {
        MessageBody: message,
        QueueUrl: queue,
        DelaySeconds: 0,
        MessageAttributes: {
            'name': {
            DataType: 'String',
            StringValue: name
            },
            'email': {
            DataType: 'String',
            StringValue: email
            },
            'message': {
            DataType: 'String',
            StringValue: message
            }
        }
        };
        sqs.sendMessage(params, (err, data) => {
        if (err) console.log(err, err.stack);
        else     console.log(data);
        });
    }
};


