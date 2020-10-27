const awsIot = require("aws-iot-device-sdk");

const doorLock = awsIot.device({
  keyPath: "./credentials/c2a901852c-private.pem.key",
  certPath: "./credentials/c2a901852c-certificate.pem.crt",
  caPath: "./credentials/AmazonRootCA.pem",
  clientId: "doorLock",
  host: "ai4oovsp79d43-ats.iot.us-east-1.amazonaws.com",
});

doorLock.on("connect", function () {
  console.log("Door Lock connected");
  doorLock.subscribe("FaceRecog/notify/door1", function () {
    console.log("subscribing to the topic FaceRecog/notify/door1 !");
  });

  doorLock.on("message", function (topic, message) {
    if (topic == "FaceRecog/notify/door1") {
      var noti = JSON.parse(message.toString());
      console.log(noti);
      if (noti.command == "unlock") console.log(noti.name, ": unlock door1");
      else console.log(noti.name, ": unauthenticated person");
    }
  });
});
