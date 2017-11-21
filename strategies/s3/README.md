## S3 Stream

### Setup Amazon S3 bucket
If you don't have a bucket click "Create Bucket" and follow the wizard. The name you choose for your `bucket` needs to be added to the [/examples/s3.js](/examples/s3.js). To get the `accessKeyId` and `secretAccessKey` goto [https://console.aws.amazon.com/iam/home#/users](https://console.aws.amazon.com/iam/home#/users) abd create a new user. Give the user a name and select 'Access Type': 'Programmatic access' and click next. Create a group or reuse an existing that has AmazonS3ReadOnlyAccess policies selected and select the new group and click next. Now you should see a preview of a user that belongs to a group that has AmazonS3ReadOnlyAccess rights. If everything looks correct click 'Create user'. On the next page you can get `accessKeyId` and `secretAccessKey`. Make sure to specify the right `region` where the bucket exists.

#### Run example:

- Move files in [data/](/data) to the a bucket in s3 (https://console.aws.amazon.com/s3/home).
- Enter your accessKeyId, secretAccessKey, bucket, region in [/examples/s3.js](/examples/s3.js)
- npm install in [/src/streams/s3](/src/streams/s3)
- start Qlik Sense Desktop
- node examples/s3.js 
