const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const htmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(htmlPath)) {
  console.error('dist/index.html not found! Please build first.');
  process.exit(1);
}

let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Find asset files
const assetsDir = path.join(distDir, 'assets');
const files = fs.readdirSync(assetsDir);

const cssFile = files.find(f => f.endsWith('.css'));
const jsFile = files.find(f => f.endsWith('.js'));

let cssContent = '';
let jsContent = '';

if (cssFile) {
  cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');
}

if (jsFile) {
  jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');
}

// Safely escape </script> inside JS
jsContent = jsContent.replace(/<\/script>/gi, '<\\/script>');

// Replace script and link tags in htmlContent using function to avoid special $ substitution
htmlContent = htmlContent.replace(/<link rel="stylesheet"[^>]*>/g, () => `<style>\n${cssContent}\n</style>`);
htmlContent = htmlContent.replace(/<script type="module"[^>]*><\/script>/g, () => `<script type="module">\n${jsContent}\n</script>`);

const outputPath = path.join(distDir, 'google_apps_script_index.html');
fs.writeFileSync(outputPath, htmlContent, 'utf8');

console.log('Successfully created standalone Single-File HTML for Google Apps Script:', outputPath);
