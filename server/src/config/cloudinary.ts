import { v2 as cloudinary } from 'cloudinary';

const env = (globalThis as {
  process?: { env?: Record<string, string | undefined> };
}).process?.env;

cloudinary.config({
  cloud_name: env?.CLOUDINARY_CLOUD_NAME,
  api_key: env?.CLOUDINARY_API_KEY,
  api_secret: env?.CLOUDINARY_API_SECRET,
});

export default cloudinary;
