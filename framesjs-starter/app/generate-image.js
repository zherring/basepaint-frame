const sharp = require('sharp');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

/**
 * Fetches an image from a URL, resizes it, and saves it locally.
 * @param {string} imageUrl - The URL of the image to process.
 * @param {string} outputFilename - The filename for the output image.
 * @returns {Promise<string>} The path to the processed image.
 */
async function processImage(imageUrl, outputFilename) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

    const imageBuffer = await response.buffer();
    const outputPath = path.join(__dirname, 'public', 'processed_images', outputFilename);

    await sharp(imageBuffer)
      .resize(630, 630, {
        fit: 'contain',
        background: 'black'
      })
      .extend({
        top: 0,
        bottom: 0,
        left: Math.floor((1200 - 630) / 2),
        right: Math.ceil((1200 - 630) / 2),
        background: 'black'
      })
      .toFormat('jpeg') // Convert to JPEG format
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

module.exports = processImage;