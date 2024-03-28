// Middleware to serve media files

import Debug from 'debug';
import path from 'path';
import sharp from 'sharp';
import { ApolloError } from 'apollo-server-core';

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
      const buffer = await getBuffer(file.buffer);
      const compressedBuffer = await sharp(buffer)
        .resize({ width: 800, height: 800, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Get file name without extension
      const fileNameWithoutExtension = path.parse(file.filename).name;
      // Generating a unique file name
      const uniqueFileName = `${fileNameWithoutExtension}_${Date.now()}${path.extname(file.filename)}`;
      // Saving or further processing the compressed image
      await sharp(compressedBuffer).toFile(`./public/media/${uniqueFileName}`);
      // get the file path
      const filePath = `./media/${uniqueFileName}`;

      // get the file name
      const fileName = path.basename(filePath);
      // Returning image details
      return {
        url: `https://localhost:3000/public/media/${fileName}`,
        name: uniqueFileName,
      };
    }));

    // Saving the compressed images in the request body
    return compressedImages;
  } catch (error) {
    throw new ApolloError(error);
  }
}

export default handleUploadedFiles;
