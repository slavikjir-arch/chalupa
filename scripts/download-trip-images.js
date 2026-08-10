const https = require('https');
const fs = require('fs');
const path = require('path');

const imageUrls = {
  'rozhledna-na-skale.jpg': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
  'naucna-stezka.jpg': 'https://images.unsplash.com/photo-1469022563149-aa64dbd37dae?w=600&h=400&fit=crop',
  'prirodni-park-brdy.jpg': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
  'rybnik-dozin.jpg': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
  'cyklovylet-cizkov.jpg': 'https://images.unsplash.com/photo-1533174072545-7a0b3d37dc5d?w=600&h=400&fit=crop',
  'architektura.jpg': 'https://images.unsplash.com/photo-1523217311519-4a8ec36f7ee9?w=600&h=400&fit=crop',
  'hrad-tremstin.jpg': 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=600&h=400&fit=crop',
  'fajmanovy-skaly.jpg': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
  'farma.jpg': 'https://images.unsplash.com/photo-1500595046891-b56beb253d9d?w=600&h=400&fit=crop',
  'padrske-rybniky.jpg': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
  'rozhledna-stastna.jpg': 'https://images.unsplash.com/photo-1489900135156-2954e7128bae?w=600&h=400&fit=crop',
  'tenis.jpg': 'https://images.unsplash.com/photo-1554224311-beee415c15c?w=600&h=400&fit=crop',
  'zamecek.jpg': 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=600&h=400&fit=crop',
  'blovice.jpg': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
  'rybnik-drahota.jpg': 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&h=400&fit=crop',
};

function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(process.cwd(), 'public/trips', filename);
    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function downloadAllImages() {
  console.log('Stahuju fotky z Unsplash...\n');
  for (const [filename, url] of Object.entries(imageUrls)) {
    try {
      await downloadFile(url, filename);
    } catch (err) {
      console.error(`✗ ${filename}: ${err.message}`);
    }
  }
  console.log('\n✓ Všechny fotky staženy!');
}

downloadAllImages().catch(console.error);
