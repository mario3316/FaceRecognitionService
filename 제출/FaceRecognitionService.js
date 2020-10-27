const AWS = require("aws-sdk");
const keys = require("./credentials/credential-keys.js");

AWS.config.update({ region: "us-east-1" });
const iotdata = new AWS.IotData({
  endpoint: "ai4oovsp79d43-ats.iot.us-east-1.amazonaws.com",
  accessKeyId: keys.credential.accessKeyId,
  secretAccessKey: keys.credential.secretAccessKey,
});

const client = new AWS.Rekognition({
  accessKeyId: keys.credential.accessKeyId,
  secretAccessKey: keys.credential.secretAccessKey,
});

exports.handler = async function (event, context) {
  const visitor = { bucket: event.bucket, name: event.name };
  const DB = ["jennie.jpg", "jisoo.jpg", "lisa.jpg", "rose.jpg"];

  const FaceCompare = async (index) => {
    const params = {
      SourceImage: {
        S3Object: {
          Bucket: "facerecog-image-db",
          Name: DB[index],
        },
      },
      TargetImage: {
        S3Object: {
          Bucket: visitor.bucket,
          Name: visitor.name,
        },
      },
      SimilarityThreshold: 70,
    };

    const result = await client
      .compareFaces(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else {
          return data.FaceMatches;
        }
      })
      .promise();

    return result;
  };

  const facematch = [];

  for (var i = 0; i < 4; i++) {
    facematch[i] = await FaceCompare(i);
    if (facematch[i].FaceMatches != "") {
      const params = {
        topic: "FaceRecog/notify/door1",
        payload: JSON.stringify({ name: event.name, command: "unlock" }),
        qos: 0,
      };

      const res = await iotdata.publish(params).promise();
      return { statusCode: 200, result: res };
    }
  }

  const params = {
    topic: "FaceRecog/notify/door1",
    payload: JSON.stringify({ name: event.name, command: "reject" }),
    qos: 0,
  };

  const res = await iotdata.publish(params).promise();
  return { statusCode: 200, result: res };
};
