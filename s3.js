const { GetObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client } = require('@aws-sdk/client-s3');
  const getSignedUrl =require( "@aws-sdk/s3-request-presigner");
  const crypto = require('crypto');
  const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

  const BUCKET = process.env.BUCKET_NAME
  const region = process.env.BUCKET_REGION
  const accessKeyId = process.env.ACCESS_KEY
  const secretAccessKey = process.env.SECRET_ACCESS_KEY
  
  const s3ClientConfig ={
    credentials: {
        accessKeyId : accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      region: region
  }


  const s3 = new S3Client(s3ClientConfig);
  
  
  const uploadToS3 = async ({ file }) => {
    const randomName = randomImageName();
    const key = randomName;
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
  
    try {
      await s3.send(command);
      return { key };
    } catch (error) {
      console.log(error);
      return { error };
    }
  };
  
  const getImageKeysByUser = async () => {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET,
    });
  
    const { Contents = [] } = await s3.send(command);
  
    return Contents.sort(
      (a, b) => new Date(b.LastModified) - new Date(a.LastModified)
    ).map((image) => image.Key);
  };

  const getImageById = async (image_id) => {
    try{
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: image_id,
    });
  
    const data = await s3.send(command);
  
    return data;
    }catch(error){
        console.error('Error fetching image file:', error);
    throw error;
    }
  };
  
  const getUserPresignedUrls = async (userId) => {
    try {
      const imageKeys = await getImageKeysByUser(userId);
  
      const presignedUrls = await Promise.all(
        imageKeys.map((key) => {
          const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
          return getSignedUrl(s3, command, { expiresIn: 900 }); // default
        })
      );
      return { presignedUrls };
    } catch (error) {
      console.log(error);
      return { error };
    }
  };

  module.exports ={
    uploadToS3,
    getImageKeysByUser,
    getImageById
  };