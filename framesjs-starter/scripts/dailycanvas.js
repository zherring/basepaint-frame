const fetch =  import('node-fetch');
const sharp =  import('sharp');
const path =  import('path');
const fs =  import('fs');


console.log("logging fetch", fetch, "logging sharp", sharp, "logging path", path, "fs", fs);
const processedImagesPath = './public/processed_images'; // Make sure this directory exists
const gradientImagePath = './public/bg-gradient.png'; // Path to your gradient image

async function processImage(index) {
  const imageUrl = `https://basepaint.xyz/api/art/image?day=${index}`;

  try {
    const response = await fetch(imageUrl);
    const imageBuffer = await response.buffer();

    // Processed image path
    const processedImagePath = path.join(processedImagesPath, `${index}.png`);

    // Get metadata for calculation
    let metadata = await sharp(imageBuffer).metadata();
    const aspectRatio = metadata.width / metadata.height;

    // Calculate dimensions for centered image
    const maxImageWidth = 600; // Max width for the centered image, adjust as needed
    const imageResizeHeight = Math.round(maxImageWidth / aspectRatio);
    const centeredImageBuffer = await sharp(imageBuffer)
      .resize(maxImageWidth, imageResizeHeight) // Resize maintaining aspect ratio
      .toBuffer();

    const targetHeight = Math.round(1200 / aspectRatio);

    // Resize, blur, and crop the background image
    const resizedImageBuffer = await sharp(imageBuffer)
      .resize(1200, targetHeight) // Resize maintaining aspect ratio
      .blur(8) // Apply blur
      .extract({ left: 0, top: Math.max(0, (targetHeight - 630) / 2), width: 1200, height: 630 }) // Crop vertically to 630px
      .toBuffer();

    // Composite the gradient and centered image over the blurred background
    await sharp(resizedImageBuffer)
      .composite([
        { input: gradientImagePath, blend: 'over' },
        { 
          input: centeredImageBuffer, 
          blend: 'over', 
          top: Math.round((630 - imageResizeHeight) / 2), // Center vertically
          left: Math.round((1200 - maxImageWidth) / 2) // Center horizontally
        }
      ])
      .toFile(processedImagePath);

    console.log(`Processed and saved image with gradient overlay and centered image for day ${index}`);
  } catch (error) {
    console.error(`Failed to process image for day ${index}:`, error);
  }
}

async function processTodaysImage() {
  console.log("working");
}
// async function processAllImages() {
//   for (let i = 101; i <= 182; i++) { // Adjust the range as needed
//     await processImage(i);
//   }
// }

// Ensure the processed_images directory exists before starting
if (!fs.existsSync(processedImagesPath)) {
  fs.mkdirSync(processedImagesPath, { recursive: true });
}

processAllImages();


// Yo, this works, don't delete, it's good enough, I'm spending another 20 minutes on this to get it "just right"
// async function processImage(index) {
//   const imageUrl = `https://basepaint.xyz/api/art/image?day=${index}`;

//   try {
//     const response = await fetch(imageUrl);
//     const imageBuffer = await response.buffer();

//     const processedImagePath = path.join(processedImagesPath, `${index}.png`);

    
//     await sharp(imageBuffer)
//     .resize(1200, 630, {
//       fit: 'contain',
//       position: 'center',
//       background: { r: 0, g: 0, b: 0, alpha: 1 } // black bg
//     })
//     .toFile(processedImagePath);

//     console.log(`Processed image for day ${index}`);
//   } catch (error) {
//     console.error(`Failed to process image for day ${index}:`, error);
//   }
// }

// async function processAllImages() {
//   for (let i = 1; i <= 10; i++) {
//     await processImage(i);
//   }
// }

// processAllImages();
