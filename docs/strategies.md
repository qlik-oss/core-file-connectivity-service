# Strategies

All examples are preconfigured to use an existing OAuth 2.0 application with its own clientId and clientSecret.

## Dropbox

Fetch data files from Dropbox is supported using OAuth 2.0 authentication flow. 
The only requirement is that the file path is specified relative to the root of the Dropbox.

#### Run example:

- Move files in [data/](/data) to the root of your Dropbox (https://www.dropbox.com/home)
- Start QIX Engine
- Run: node examples/dropbox.js
- Follow the instructions in the console


## Google Drive

Download files from Googel Drive using OAuth 2.0 authentication flow. 
The only requirement is that the file name is specified .

#### Run example:

- Move files in [data/](/data) to the root of you Google Drive (https://drive.google.com/drive/my-drive)
- Start QIX Engine
- Run: node examples/googledrive.js
- Follow the instructions in the console

## OneDrive

Download files from OneDrive using OAuth 2.0 authentication flow. 
The only requirement is that the file name is specified .

#### Run example:

- Move files in [data/](/data) to the a root of Onedrive (https://onedrive.live.com/).
- Start QIX Engine
- Run: node examples/onedrive.js
- Follow the instructions in the console

## S3

### Setup Amazon S3 bucket
If you don't have a bucket click "Create Bucket" and follow the wizard. 
The name you choose for your `bucket` needs to be added to the [/examples/s3.js](/examples/s3.js). 
To get the `accessKeyId` and `secretAccessKey` goto [https://console.aws.amazon.com/iam/home#/users](https://console.aws.amazon.com/iam/home#/users) 
and create a new user. Give the user a name and select 'Access Type': 'Programmatic access' and click next. 
Create a group or reuse an existing that has AmazonS3ReadOnlyAccess policies selected and select the new group and click next. 
Now you should see a preview of a user that belongs to a group that has AmazonS3ReadOnlyAccess rights. 
If everything looks correct click 'Create user'. On the next page you can get `accessKeyId` and `secretAccessKey`. 
Make sure to specify the right `region` where the bucket exists.

#### Run example:

- Move files in [data/](/data) to the a bucket in s3 (https://console.aws.amazon.com/s3/home).
- Enter your accessKeyId, secretAccessKey, bucket, region in [/examples/s3.js](/examples/s3.js)
- Start QIX Engine
- Run: node examples/s3.js
- Follow the instructions in the console


    
    
    
