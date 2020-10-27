const awsIot = require("aws-iot-device-sdk");
const AWS = require("aws-sdk");
const fs = require("fs");
const keys = require("./credentials/credential-keys.js");
const readline = require("readline");

AWS.config.region = "us-east-1";
AWS.config.apiVersions = {
  s3: "2006-03-01",
};

const s3 = new AWS.S3({
  accessKeyId: keys.credential.accessKeyId,
  secretAccessKey: keys.credential.secretAccessKey,
});

const doorCamera = awsIot.device({
  keyPath: "./credentials/c2a901852c-private.pem.key",
  certPath: "./credentials/c2a901852c-certificate.pem.crt",
  caPath: "./credentials/AmazonRootCA.pem",
  clientId: "doorCamera",
  host: "ai4oovsp79d43-ats.iot.us-east-1.amazonaws.com",
});

function createObject(params) {
  return new Promise(function (resolve, reject) {
    s3.upload(params, function (err, data) {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

const upload = async function (image_name) {
  try {
    const my_object = {
      Bucket: "facerecog-image-visitor",
      Key: image_name,
      Body: fs.createReadStream("./image/" + image_name),
    };
    const result = await createObject(my_object);
    console.log(result);
  } catch (err) {
    console.log(err);
  }
};

doorCamera.on("connect", function () {
  console.log("Door Camera connected");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", function (line) {
    upload(line);
    console.log("Uploaded image to S3");
    const message = {
      notify: "FaceRecog/notify/door1",
      bucket: "facerecog-image-visitor",
      name: line,
    };
    doorCamera.publish("FaceRecog/request", JSON.stringify(message));
    console.log("Published to FaceRecog/request" + JSON.stringify(message));
  }).on("close", function () {
    process.exit();
  });
});
