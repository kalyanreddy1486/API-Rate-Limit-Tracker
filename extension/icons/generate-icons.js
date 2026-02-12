const fs = require('fs');
const path = require('path');

// Simple 1x1 blue pixel PNG (will be stretched by Chrome)
// This is a valid minimal PNG file
const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const pngBuffer = Buffer.from(base64PNG, 'base64');

// Create icons for each size
const sizes = [16, 48, 128];

sizes.forEach(size => {
  const filename = `icon${size}.png`;
  fs.writeFileSync(path.join(__dirname, filename), pngBuffer);
  console.log(`Created ${filename}`);
});

console.log('\nAll icons created successfully!');
console.log('Note: These are placeholder icons. Replace them with proper icons later.');
