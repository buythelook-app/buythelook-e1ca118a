// Script to increment the build number for Buy The Look Beta
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES module approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the current package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Parse the current version
const currentVersion = packageJson.version;
const versionParts = currentVersion.split('.');
let [major, minor, build] = versionParts.map(part => parseInt(part, 10));

// Increment the build number
build += 1;

// Create the new version string
const newVersion = `${major}.${minor}.${build}`;
console.log(`Incrementing version from ${currentVersion} to ${newVersion}`);

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Update version.properties for Android APK filename
const versionPropsPath = path.join(__dirname, '..', 'version.properties');
fs.writeFileSync(versionPropsPath, `version=${newVersion}`);
console.log(`Updated version.properties to version=${newVersion}`);

// Update capacitor.config.ts
const capacitorConfigPath = path.join(__dirname, '..', 'capacitor.config.ts');
let capacitorConfig = fs.readFileSync(capacitorConfigPath, 'utf8');

// Replace the appName with the new version
const appNameRegex = /(appName: ['"])([^'"]+)(['"],)/;
const newAppName = `Buy The Look Beta ${newVersion}`;
capacitorConfig = capacitorConfig.replace(appNameRegex, `$1${newAppName}$3`);

fs.writeFileSync(capacitorConfigPath, capacitorConfig);

// Update Android strings.xml
const stringsXmlPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'values', 'strings.xml');
let stringsXml = fs.readFileSync(stringsXmlPath, 'utf8');

// Replace app_name and title_activity_main
stringsXml = stringsXml.replace(
  /<string name="app_name">([^<]+)<\/string>/,
  `<string name="app_name">${newAppName}</string>`
);
stringsXml = stringsXml.replace(
  /<string name="title_activity_main">([^<]+)<\/string>/,
  `<string name="title_activity_main">${newAppName}</string>`
);

fs.writeFileSync(stringsXmlPath, stringsXml);

// Update index.html title
const indexHtmlPath = path.join(__dirname, '..', 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

indexHtml = indexHtml.replace(
  /<title>([^<]+)<\/title>/,
  `<title>${newAppName}</title>`
);

fs.writeFileSync(indexHtmlPath, indexHtml);

console.log(`App name updated to "${newAppName}" in all relevant files`);
console.log(`APK will be named "Buy-The-Look-Beta-${newVersion}-YYYYMMDD.apk"`)
