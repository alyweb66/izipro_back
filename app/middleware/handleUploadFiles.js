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
async function handleUploadedFiles(media, message = false) {
  debug('Sharp: sharp is running');
  debugInDevelopment(media);
  try {
    const compressedFiles = await Promise.all(media.map(async (file) => {
      const { mimetype, filename, buffer } = file;
      const fileNameWithoutExtension = path.parse(filename).name;

      let uniqueFileName;
      let thumbnailFileName;
      // Create a unique file name
      if (mimetype.startsWith('image/')) {
        uniqueFileName = `${fileNameWithoutExtension}_${Date.now()}.webp`;
        thumbnailFileName = `${fileNameWithoutExtension}_${Date.now()}_thumb.webp`;
      } else if (mimetype === 'application/pdf') {
        uniqueFileName = `${fileNameWithoutExtension}_${Date.now()}${path.extname(filename)}`;
      }

      // Create the file path
      const filePath = `./public/media/${uniqueFileName}`;
      let thumbnailFilePath;
      if (message) {
        thumbnailFilePath = `./public/media/${thumbnailFileName}`;
      }

      // Compression of images with Sharp
      if (mimetype.startsWith('image/')) {
        const imageBuffer = await getBuffer(buffer);
        await sharp(imageBuffer)
          .rotate() // correct orientation
          .resize({ width: 1920, withoutEnlargement: true })
          .webp({ quality: 75, effort: 6 })
          .toFile(filePath);

        // Create and save the thumbnail
        if (message) {
          await sharp(imageBuffer)
            .rotate()
            .resize({ width: 1920, withoutEnlargement: true }) // Same dimensions
            .webp({ quality: 1, effort: 6 }) // Lower quality for placeholder
            .blur(80) // Apply blur to make it more "placeholder-like"
            .toFile(thumbnailFilePath); // Save thumbnail file
        }
      } else if (mimetype === 'application/pdf') {
        // register pdf file without compression
        await new Promise((resolve, reject) => {
          pipeline(buffer, fs.createWriteStream(filePath), (err) => {
            if (err) reject(err);
            resolve();
          });
        });
      }
      // Generate the URLs for both the original and thumbnail
      const baseUrl = process.env.NODE_ENV === 'development'
        ? `${process.env.FILE_URL}:${process.env.PORT}/public/media/`
        : `${process.env.FILE_URL}/public/media/`;
      // Create the URL for the file
      const pictureUrl = `${baseUrl}${uniqueFileName}`;
      // Create the URL for the thumbnail
      let thumbnailUrl;
      if (message) {
        thumbnailUrl = `${baseUrl}${thumbnailFileName}`;
      }

      return {
        url: pictureUrl,
        ...(message ? { thumbnail: thumbnailUrl } : {}),
        name: uniqueFileName,
      };
    }));

    return compressedFiles;
  } catch (error) {
    debug('Error', error);
    throw new GraphQLError(error, { extensions: { code: 'INTERNAL_SERVER_ERROR', httpStatus: 500 } });
  }
}

export default handleUploadedFiles;
