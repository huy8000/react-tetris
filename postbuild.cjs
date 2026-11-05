const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dist = path.join(__dirname, 'dist');
const files = fs.readdirSync(dist);

function getHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 10);
}

// 1. Process mp3
const mp3File = files.find(f => f.endsWith('.mp3'));
let mp3NewName = '';
if (mp3File) {
  const mp3Path = path.join(dist, mp3File);
  const hash = getHash(mp3Path);
  mp3NewName = `music.${hash}.mp3`;
  fs.renameSync(mp3Path, path.join(dist, mp3NewName));
}

// 2. Process JS (replace mp3 ref if needed)
const jsFile = files.find(f => f.endsWith('.js'));
let jsPath = path.join(dist, jsFile);
let jsContent = fs.readFileSync(jsPath, 'utf8');
if (mp3File && mp3NewName) {
  jsContent = jsContent.replaceAll(mp3File, mp3NewName);
  fs.writeFileSync(jsPath, jsContent, 'utf8');
}
const jsHash = getHash(jsPath);
const jsNewName = `app.${jsHash}.js`;
fs.renameSync(jsPath, path.join(dist, jsNewName));

// 3. Process CSS
const cssFile = files.find(f => f.endsWith('.css'));
const cssPath = path.join(dist, cssFile);
const cssHash = getHash(cssPath);
const cssNewName = `css.${cssHash}.css`;
fs.renameSync(cssPath, path.join(dist, cssNewName));

// 4. Update index.html
const htmlPath = path.join(dist, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replaceAll(jsFile, jsNewName);
html = html.replaceAll(cssFile, cssNewName);
fs.writeFileSync(htmlPath, html, 'utf8');

console.log('Post-build complete:');
console.log('JS:', jsNewName);
console.log('CSS:', cssNewName);
if (mp3NewName) console.log('MP3:', mp3NewName);
