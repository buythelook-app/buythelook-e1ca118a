
// Script to build and prepare the web version for deployment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the directory name using ES module approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🚀 Building web version for deployment...');

// Run the build command
try {
  console.log('Running build command...');
  execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

// Create a web-specific version.txt file in the dist directory
const versionPath = path.join(rootDir, 'version.properties');
const distDir = path.join(rootDir, 'dist');

if (fs.existsSync(versionPath)) {
  const versionContent = fs.readFileSync(versionPath, 'utf8');
  const versionMatch = versionContent.match(/version=(.+)/);
  const version = versionMatch ? versionMatch[1] : 'unknown';
  
  const webVersionInfo = {
    version,
    buildDate: new Date().toISOString(),
    platform: 'web'
  };
  
  fs.writeFileSync(
    path.join(distDir, 'version.json'),
    JSON.stringify(webVersionInfo, null, 2)
  );
  
  console.log(`📝 Created version.json with version ${version}`);
}

// Add SPA routing configurations for common hosting platforms
console.log('⚙️ Creating SPA routing configuration files...');

// Create _redirects file for Netlify
fs.writeFileSync(
  path.join(distDir, '_redirects'),
  '/*    /index.html   200'
);
console.log('✅ Created _redirects file for Netlify');

// Create vercel.json in the root for Vercel
fs.writeFileSync(
  path.join(rootDir, 'vercel.json'),
  JSON.stringify({
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }, null, 2)
);
console.log('✅ Created vercel.json file for Vercel');

console.log('\n🌐 Web deployment preparation complete!');
console.log('To deploy your web app:');
console.log('1. Upload the contents of the "dist" folder to your web hosting provider');
console.log('2. Ensure your hosting provider is configured for single-page applications');
console.log('3. Set up any required environment variables on your hosting platform');
console.log('\nHappy deploying! 🎉');
