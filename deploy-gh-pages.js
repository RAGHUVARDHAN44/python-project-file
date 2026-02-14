import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

console.log('🚀 Building for GitHub Pages...');

// Build the app
execSync('npm run build', { stdio: 'inherit' });

// Create gh-pages branch if it doesn't exist
try {
  execSync('git checkout -b gh-pages', { stdio: 'ignore' });
} catch (error) {
  // Branch might already exist
  execSync('git checkout gh-pages', { stdio: 'inherit' });
}

// Copy dist contents to root
execSync('xcopy dist\\* . /E /Y /Q', { stdio: 'inherit' });

// Commit and push
execSync('git add .', { stdio: 'inherit' });
execSync('git commit -m "Deploy to GitHub Pages"', { stdio: 'inherit' });
execSync('git push origin gh-pages --force', { stdio: 'inherit' });

console.log('✅ Deployed to GitHub Pages!');
console.log('Your site will be available at: https://[username].github.io/[repository-name]');