const fs = require('fs');
const path = require('path');

const embedsDir = path.join(__dirname, '../../embeds');

if (!fs.existsSync(embedsDir)) {
  fs.mkdirSync(embedsDir, { recursive: true });
}

const loadEmbed = (filename) => {
  const filePath = path.join(embedsDir, `${filename}.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading embed ${filename}:`, error);
    return null;
  }
};

const getAvailableEmbeds = () => {
  try {
    const files = fs.readdirSync(embedsDir).filter(file => file.endsWith('.json'));
    return files.map(file => file.replace('.json', ''));
  } catch (error) {
    console.error('Error reading embeds directory:', error);
    return [];
  }
};

module.exports = {
  loadEmbed,
  getAvailableEmbeds,
};
