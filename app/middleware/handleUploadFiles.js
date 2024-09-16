// Middleware to serve media files

import Debug from 'debug';
import path from 'path';
import sharp from 'sharp';
import { GraphQLError } from 'graphql';
import fs from 'fs';

const debug = Debug(`${process.env.DEBUG_MODULE}:middleware:sharp`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}
// function that uses Sharp to compress images
async function handleUploadedFiles(media) {
  debug('Sharp: sharp is running');
  debugInDevelopment(media);
  try {
    // Function to get the buffer of a stream
    const getBuffer = (stream) => new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });

    const compressedImages = await Promise.all(media.map(async (file) => {
      // Image compression with Sharp
      let compressedBuffer;
      if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        const buffer = await getBuffer(file.buffer);
        compressedBuffer = await sharp(buffer)
          .resize({ width: 1920, withoutEnlargement: true }) // Adjust size if needed
          .webp({ quality: 75, effort: 4 }) // Adjust quality and effort for better compression
          .toBuffer();
      }

      // Get file name without extension
      const fileNameWithoutExtension = path.parse(file.filename).name;

      // Generating a unique file name
      // const uniqueFileName =
      // `${fileNameWithoutExtension}_${Date.now()}${path.extname(file.filename)}`;
      let uniqueFileName;
      if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        uniqueFileName = file.mimetype.startsWith('image/')
          ? `${fileNameWithoutExtension}_${Date.now()}.webp`
          : `${fileNameWithoutExtension}_${Date.now()}${path.extname(file.filename)}`;
      }

      if (file.mimetype === 'application/pdf') {
        uniqueFileName = `${fileNameWithoutExtension}_${Date.now()}${path.extname(file.filename)}`;
      }

      // Saving or further processing the compressed image or pdf
      const filePath = `./public/media/${uniqueFileName}`;
      if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        await sharp(compressedBuffer).toFile(filePath);
      } else {
        await file.buffer.pipe(fs.createWriteStream(`./public/media/${uniqueFileName}`));
      }
      // get the file path
      // const filePath = `./media/${uniqueFileName}`;

      // get the file name
      const fileName = path.basename(filePath);
      // Returning image details
      const pictureUrl = process.env.NODE_ENV === 'development' ? `${process.env.FILE_URL}${process.env.PORT}/public/media/${fileName}` : `${process.env.FILE_URL}/public/media/${fileName}`;

      return {
        url: pictureUrl,
        name: uniqueFileName,
      };
    }));

    // Saving the compressed images in the request body
    return compressedImages;
  } catch (error) {
    debug('Error', error);
    throw new GraphQLError(error, { extensions: { code: 'INTERNAL_SERVER_ERROR', httpStatus: 500 } });
  }
}

export default handleUploadedFiles;
