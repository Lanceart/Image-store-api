const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');
const cors = require('cors');
const sharp = require('sharp');
const {getCharacterById, getCharacters, addOrUpdateCharacter, deleteCharacter} = require('./dynamo');
const {uploadToS3, getImageById, getImageKeysByUser} = require('./s3');

dotenv.config()

// const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const bucketName = process.env.BUCKET_NAME
const region = process.env.BUCKET_REGION
const accessKeyId = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY



// const hp = {
//   "key":'0ewew',
//   "type":"nbeginweqr"
  
// };
// addOrUpdateCharacter(hp);
// ("0");

// getCharacterById("0ewew", "nbeginweqr").then(item => {
//   console.log(item);
// }).catch(error => {
//   console.error(error);
// });

// deleteCharacter("0ewew", "nbeginweqr").then(item => {
//   console.log(item);
// }).catch(error => {
//   console.error(error);
// });

const s3Client = new S3Client({
  
  credentials: {
    accessKeyId : accessKeyId,
    secretAccessKey: secretAccessKey,
  },
  region: region
})

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createCanvas } = require('canvas');


const app = express();
app.use(cors());
const PORT = 8080;


app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

// const upload = multer({ storage: storage });
const upload = multer();



app.post('/upload', upload.single('image'), async (req, res) => {
  // if (err) throw err;
  // const buffer = await sharp(req.file.buffer).resize({height: 1920,width: 1080, fit:"contain"}).toBuffer();
  
  // const params = {
  //   Bucket: bucketName,
  //   Key: randomName,//req.file.originalname,
  //   Body: req.file.buffer,
  //   ContentType: req.file.mimetype,
  // }

  

  // const command = new PutObjectCommand(params);
  // console.log('Bucket Name:', bucketName);
  // await s3Client.send(command);
  const {file} = req;
  const { error, key } = await uploadToS3({ file });
  
  const db_list = {
    "key": key,
    "type":"blogs",
    // "title": req.text,
  };
 addOrUpdateCharacter(db_list);

  res.json({ message: 'Image uploaded successfully', filename: req.file.filename });

});

app.delete('/image-delete/:key', async (req, res) => {
  try {
    const key = req.params.key;

    const result = await deleteCharacter({ key},"blogs");
    if (result.deletedCount === 0) {
      return res.status(404).send('Image not found');
    }

    res.send('Image deleted successfully');
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.get('/image/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const data = await getImageById(imageId);

    if (!data.Body) {
      return res.status(404).send('Image not found');
    }

    // Assuming the image content type is known and consistent, e.g., 'image/jpeg'
    // You might want to adjust this based on the actual content type of your images
    res.setHeader('Content-Type', 'image/jpeg');

    // Stream the image data to the response
    data.Body.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving image');
  }
});
app.use('/uploads', express.static('uploads'));


// Text-to-Image API
app.get('/text-to-image', (req, res) => {
    const text = req.query.text || 'Hello, World!';
    const width = 800;
    const height = 600;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    // Set background color
    context.fillStyle = '#FFF';
    context.fillRect(0, 0, width, height);

    // Set text properties
    context.font = '30px Arial';
    context.fillStyle = '#000';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Place text in the center
    context.fillText(text, width / 2, height / 2);

    // Convert canvas to an image
    const buffer = canvas.toBuffer('image/png');

    // Set the content type to image/png and send the image
    res.type('png');
    res.send(buffer);
});


app.get('/list-db', async(req, res) =>{
  try{
    const character =  await getCharacters();
    res.json(character);
  }catch(err){
    console.log(err);
    res.status(500).json({err : 'Something went wrong'});
  }
}); 

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
