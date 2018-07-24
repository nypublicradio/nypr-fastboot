const aws = require('aws-sdk');

function makeKey(revision, build) {
  let key;
  if (revision && build) {
    key = `${build}/index.html:${revision}`;
  } else if (revision) {
    key = `index.html:${revision}`;
  } else if (build) {
    key = `${build}/index.html`;
  }
  return key;
}

module.exports = function ({ bucket }) {
  const s3 = new aws.S3();

  return async function previewMiddleware({ query }, res, next) {
    console.log('query:', query);
    let { v:revision, build } = query;

    if (revision || build) {
      let key = makeKey(revision, build);
      console.log('key:', key);
      try {
        let { Body } = await s3.getObject({
          Bucket: bucket,
          Key: key,
        }).promise();

        return res.send(Body.toString());
      } catch(e) {
        next();
      }
    } else {
      next();
    }
  }
}
