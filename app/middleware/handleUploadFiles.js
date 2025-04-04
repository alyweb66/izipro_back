// Middleware to serve media files
import Debug from "debug";
import path from "path";
import sharp from "sharp";
// import convert from 'heic-convert';
import crypto from "node:crypto";
import { GraphQLError } from "graphql";
import fs from "fs";
import url from "url";

const debug = Debug(`${process.env.DEBUG_MODULE}:middleware:sharp`);
const fileName = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(fileName);
function debugInDevelopment(message = "", value = "") {
  if (process.env.NODE_ENV === "development") {
    debug("⚠️", message, value);
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
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

// function that uses Sharp to compress images
async function handleUploadedFiles(
  media,
  itemId,
  dataSources,
  message = false
) {
  debug("Sharp: sharp is running");
  debugInDevelopment(media);

  try {

    const compressedFiles = await Promise.all(
      media.map(async (file) => {
        const { mimetype, filename, buffer } = file;
        const fileNameWithoutExtension = path.parse(filename).name;
        // Get the extension of the file
        const extension = path.extname(filename).toLowerCase();

        const validExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
        if (!validExtensions.includes(extension)) {
          throw new GraphQLError("Invalid file extension", {
            extensions: { code: "BAD_REQUEST", httpStatus: 400 },
          });
        }

        if (!fileNameWithoutExtension) {
          throw new GraphQLError("Invalid file name", {
            extensions: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500 },
          });
        }

        // Normalize the file name remove spaces and special characters
        const normalizedFileName = fileNameWithoutExtension.replace(/\s+/g, "-");

        const uniqueId = crypto.randomBytes(16).toString("hex");
        let uniqueFileName;
        let thumbnailFileName;
        // Create a unique file name
        if (mimetype.startsWith("image/")) {
          uniqueFileName = `${normalizedFileName}_${uniqueId}.webp`;
          thumbnailFileName = `${normalizedFileName}_${uniqueId}_thumb.webp`;
        } else if (mimetype === "application/pdf") {
          uniqueFileName = `${normalizedFileName}_${uniqueId}${path.extname(
            filename
          )}`;
        }

        // Create the file path
        const filePath = `./public/media/${uniqueFileName}`;
        let thumbnailFilePath;
        if (message) {
          thumbnailFilePath = `./public/media/${thumbnailFileName}`;
        }

        // Get the buffer of the file
        const fileBuffer = await getBuffer(buffer);

        // Compression of images with Sharp
        if (mimetype.startsWith("image/") && fileBuffer.length < 1.5e7) {
          // Create a sharp object with common settings
          const image = sharp(fileBuffer)
            .rotate()
            .resize({ width: 1920, withoutEnlargement: true });

          // Create and save the compressed file
          await image.clone()
            .webp({ quality: 75, effort: 6 })
            .toFile(filePath);

          // Create and save the thumbnail if message is true
          if (message) {
            await image.clone()
              .webp({ quality: 1, effort: 6 }) // Lower quality for placeholder
              .blur(80) // Apply blur to make it more "placeholder-like"
              .toFile(thumbnailFilePath); // Save thumbnail file
          }
        } else if (
          mimetype === "application/pdf" &&
          fileBuffer.length < 1048576
        ) {
          // Record the file without compression
          await fs.promises.writeFile(filePath, fileBuffer);
        } else {
          if (message) {
            dataSources.dataDB.message.delete(itemId);
          } else {
            dataSources.dataDB.request.delete(itemId);
          }
          throw new GraphQLError("Invalid file type", {
            extensions: { code: "BAD_REQUEST", httpStatus: 400 },
          });
        }

        // Generate the URLs for both the original and thumbnail
        const baseUrl =
          process.env.NODE_ENV === "development"
            ? `${process.env.FILE_URL}:${process.env.PORT}/public/media/`
            : `${process.env.FILE_URL}/public/media/`;
        // Create the URL for the file
        const pictureUrl = `${baseUrl}${uniqueFileName}`;

        // Create the URL for the thumbnail
        let thumbnailUrl;
        if (message && mimetype.startsWith("image/")) {
          thumbnailUrl = `${baseUrl}${thumbnailFileName}`;
        }

        return {
          url: pictureUrl,
          ...(message && mimetype.startsWith("image/")
            ? { thumbnail: thumbnailUrl }
            : {}),
          name: uniqueFileName,
        };
      })
    );

    if (compressedFiles.length === 0) {
      throw new GraphQLError("No files were uploaded", {
        extensions: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500 },
      });
    }

    return compressedFiles;
  } catch (error) {
    debug("Error", error);
    throw new GraphQLError(error, {
      extensions: { code: "INTERNAL_SERVER_FILES_ERROR", httpStatus: 500 },
    });
  }
}

export default handleUploadedFiles;
