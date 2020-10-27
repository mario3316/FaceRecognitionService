const test = require("./index.js");

console.log(
  test.handler({
    bucket: "facerecog-image-visitor",
    name: "sana.jpg",
  })
);
