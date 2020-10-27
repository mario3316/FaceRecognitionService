// Face Recognition System Example
// awsiot-faceRecogSys.js

var awsIot = require('aws-iot-device-sdk');

var faceRecogSys = awsIot.device({
    keyPath: "./credentials/recogsys/373ac03c10-private.pem.key",
    certPath: "./credentials/recogsys/373ac03c10-certificate.pem.crt",
    caPath: "./credentials/recogsys/AmazonRootCA1.pem",
    clientId: "faceRecogSys",
    host: "a2gh9z2729p3ck-ats.iot.ap-northeast-2.amazonaws.com"
});

// Device is an instance returned by mqtt.Client(), see mqtt.js for full documentation.
// Device is an instance returned by mqtt.Client(), see mqtt.js for full documentation.
faceRecogSys.on('connect', function () {
    console.log('Face Recognition System connected');
    faceRecogSys.subscribe('faceRecog/request', function () {
        console.log('subscribing to the topic faceRecog/request !');
    });

    var registeredImage = ['heungboo', 'nolboo', 'ggachi', 'seodong', 'pyeongang'];
    faceRecogSys.on('message', function (topic, message) {
        console.log('Request:', message.toString());
        if (topic != 'faceRecog/request') return;
        var req = JSON.parse(message.toString());
        var id = registeredImage.indexOf(req.image);
        if (id != -1) {
            faceRecogSys.publish(req.notify, JSON.stringify({ 'image': req.image, 'command': 'unlock' }));
        } else {
            faceRecogSys.publish(req.notify, JSON.stringify({ 'image': req.image, 'command': 'reject' }));
        }
    })
});


