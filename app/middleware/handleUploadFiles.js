// Middleware to serve media files
import Debug from 'debug';
import path from 'path';
import sharp from 'sharp';
import { pipeline } from 'stream';
import { GraphQLError } from 'graphql';
import fs from 'fs';

const debug = Debug(`${process.env.DEBUG_MODULE}:middleware:sharp`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}
/**
 * Converts a stream into a buffer.
 *
 * @async
 * @function getBuffer
 * @param {stream.Readable} stream - The readable stream to convert into a buffer.
 * @returns {Promise<Buffer>} A promise that resolves to
 * a buffer containing the data from the stream.
 * @throws {Error} If there is an error reading the stream.
 */
// Function to get the buffer of a stream
async function getBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

// function that uses Sharp to compress images
async function handleUploadedFiles(media) {
  debug('Sharp: sharp is running');
  debugInDevelopment(media);
  try {
    const compressedFiles = await Promise.all(media.map(async (file) => {
      const { mimetype, filename, buffer } = file;
      const fileNameWithoutExtension = path.parse(filename).name;
      let uniqueFileName;

      // Create a unique file name
      if (mimetype.startsWith('image/')) {
        uniqueFileName = `${fileNameWithoutExtension}_${Date.now()}.webp`;
      } else if (mimetype === 'application/pdf') {
        uniqueFileName = `${fileNameWithoutExtension}_${Date.now()}${path.extname(filename)}`;
      }

      // Create the file path
      const filePath = `./public/media/${uniqueFileName}`;

      // Compression of images with Sharp
      if (mimetype.startsWith('image/')) {
        const imageBuffer = await getBuffer(buffer);
        await sharp(imageBuffer)
          .resize({ width: 1920, withoutEnlargement: true })
          .webp({ quality: 75, effort: 4 })
          .toFile(filePath);
      } else if (mimetype === 'application/pdf') {
        // register pdf file without compression
        await new Promise((resolve, reject) => {
          pipeline(buffer, fs.createWriteStream(filePath), (err) => {
            if (err) reject(err);
            resolve();
          });
        });
      }

      // Générer l'URL du fichier
      const pictureUrl = process.env.NODE_ENV === 'development' ? `${process.env.FILE_URL}:${process.env.PORT}/public/media/${uniqueFileName}` : `${process.env.FILE_URL}/public/media/${uniqueFileName}`;

      return {
        url: pictureUrl,
        name: uniqueFileName,
      };
    }));

    return compressedFiles;

    // Function to get the buffer of a stream
    /*  const getBuffer = (stream) => new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });

    const compressedImages = await Promise.all(media.map(async (file) => {
      // Image compression with Sharp
      let compressedBuffer;
      if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'
      || file.mimetype === 'image/jpg') {
        const buffer = await getBuffer(file.buffer);
        compressedBuffer = await sharp(buffer)
          .resize({ width: 1920, withoutEnlargement: true }) // Adjust size if needed
          .webp({ quality: 75, effort: 4 }) // Adjust quality and effort for better compression
          .toBuffer();
      }

      // Get file name without extension
      const fileNameWithoutExtension = path.parse(file.filename).name;

      // Generating a unique file name
      let uniqueFileName;
      if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'
      || file.mimetype === 'image/jpg') {
        uniqueFileName = file.mimetype.startsWith('image/')
         / ? `${fileNameWithoutExtension}_${Date.now()}.webp`
          : `${fileNameWithoutExtension}_${Date.now()}${path.extname(file.filename)}`;
      }

      if (file.mimetype === 'application/pdf') {
        uniqueFileName = `${fileNameWithoutExtension}_${Date.now()}${path.extname(file.filename)}`;
      }

      // Saving or further processing the compressed image or pdf
      const filePath = `./public/media/${uniqueFileName}`;
      if (file.mimetype === 'image/jpeg' || file.mimetype ===
      'image/png' || file.mimetype === 'image/jpg') {
        await sharp(compressedBuffer).toFile(filePath);
      } else {
        await file.buffer.pipe(fs.createWriteStream(`./public/media/${uniqueFileName}`));
      }
      // get the file path
      // const filePath = `./media/${uniqueFileName}`;

      // get the file name
      const fileName = path.basename(filePath);
      // Returning image details
      const pictureUrl = process.env.NODE_ENV === 'development'
       /? `${process.env.FILE_URL}${process.env.PORT}/public/media/${fileName}`
       : `${process.env.FILE_URL}/public/media/${fileName}`;

      return {
        url: pictureUrl,
        name: uniqueFileName,
      };
    }));

    // Saving the compressed images in the request body
    return compressedImages; */
  } catch (error) {
    debug('Error', error);
    throw new GraphQLError(error, { extensions: { code: 'INTERNAL_SERVER_ERROR', httpStatus: 500 } });
  }
}

export default handleUploadedFiles;
