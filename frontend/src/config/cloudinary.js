import { Cloudinary } from '@cloudinary/url-gen';

export const cloudinaryConfig = {
  cloudName: 'dw1p4jkjb',
  apiKey: '176345728317619',
  uploadPreset: 'ml_default' // using default preset
};

export const cld = new Cloudinary({
  cloud: {
    cloudName: cloudinaryConfig.cloudName
  }
}); 