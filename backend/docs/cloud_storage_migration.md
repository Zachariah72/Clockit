# Cloud Storage Migration Guide for Clockit

Currently, user song uploads (via `soundcloudController.js`) and other media (avatars, stories) use `multer.diskStorage` to save files locally in the `backend/uploads` directory.

While this works perfectly in development and environments with persistent local storage, PaaS providers like **Render** or **Heroku** use ephemeral filesystems. This means that if the server restarts or deploys, all locally uploaded user tracks will be permanently lost.

To scale past 10k users and ensure data persistence in production, you should migrate to a cloud storage provider such as AWS S3 or Cloudinary.

## Option 1: AWS S3 (Recommended for Audio)

AWS S3 is cost-effective and built for scalable storage of large binary files like audio.

### 1. Install Dependencies
```bash
npm install aws-sdk multer-s3
```

### 2. Configure AWS S3 Multer Storage in `soundcloudController.js`
Replace the `multer.diskStorage` block with `multerS3`:

```javascript
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION // e.g., 'us-east-1'
});

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    acl: 'public-read', // Or 'private' if you want to stream through your backend
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, `audio/user_${req.user.id}_${uniqueSuffix}${extension}`);
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: fileFilter
});
```

### 3. Update the Database Record
When the file is uploaded, S3 will return the public URL in `req.file.location`. Update the `UserTrack` creation logic to store this URL instead of the local filesystem path.

---

## Option 2: Cloudinary

Cloudinary is also an excellent choice, though typically optimized for images and video, it fully supports raw audio files.

### 1. Install Dependencies
```bash
npm install cloudinary multer-storage-cloudinary
```

### 2. Configure Cloudinary Storage

```javascript
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'clockit-audio',
    resource_type: 'video', // Cloudinary treats audio as video resource type
    format: async (req, file) => 'mp3', 
    public_id: (req, file) => `user_${req.user.id}_${Date.now()}`
  },
});

const upload = multer({ storage: storage });
```

### 3. Update the Database Record
Cloudinary will return the URL via `req.file.path` (or `secure_url`). Save this URL in your MongoDB schema.

## Next Steps
For now, locally persistent storage will work. Ensure that if you deploy to Render, you **attach a Persistent Disk** to your web service and mount it to the `backend/uploads` directory to prevent data loss before migrating to AWS S3.
