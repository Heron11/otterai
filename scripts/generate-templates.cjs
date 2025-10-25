#!/usr/bin/env node
/**
 * Generate static template data from local template directories
 * Run: node scripts/generate-templates.js
 */

const fs = require('fs');
const path = require('path');

function readTemplateDirectory(templatePath, relativePath = '') {
  const files = [];
  const entries = fs.readdirSync(templatePath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(templatePath, entry.name);
    const relativeFilePath = path.join(relativePath, entry.name);

    // Skip patterns
    const skipPatterns = ['node_modules', '.git', '.vscode', '.idea', 'dist', 'build', '.next', '.DS_Store', 'Thumbs.db', '.env', 'package-lock.json', 'yarn.lock'];
    if (skipPatterns.some(pattern => relativeFilePath.includes(pattern))) continue;

    if (entry.isFile()) {
      const stats = fs.statSync(fullPath);
      if (stats.size > 100000) continue; // Skip files larger than 100KB

      const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.pdf', '.zip', '.tar', '.gz'];
      if (binaryExtensions.some(ext => entry.name.toLowerCase().endsWith(ext))) continue;

      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        files.push({
          path: relativeFilePath.replace(/\\/g, '/'),
          content,
          type: 'file'
        });
      } catch (e) {
        console.warn(`⚠️  Failed to read: ${fullPath}`);
      }
    } else if (entry.isDirectory()) {
      const skipDirs = ['node_modules', '.git', '.vscode', '.idea', 'dist', 'build', '.next'];
      if (!skipDirs.includes(entry.name) && relativeFilePath.split('/').length <= 3) {
        files.push(...readTemplateDirectory(fullPath, relativeFilePath));
      }
    }
  }
  return files;
}

try {
  console.log('🔧 Generating static template data...\n');

  const templatesDir = path.join(__dirname, '../templates');
  const templateDirs = fs.readdirSync(templatesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  const templates = {};
  
  for (const templateDir of templateDirs) {
    console.log(`📁 Processing: ${templateDir}`);
    const templatePath = path.join(templatesDir, templateDir);
    const files = readTemplateDirectory(templatePath);
    templates[templateDir] = files;
    console.log(`   ✓ ${files.length} files loaded\n`);
  }

  const output = `/**
 * Auto-generated template data
 * DO NOT EDIT MANUALLY
 * 
 * To regenerate: npm run generate:templates
 * or: node scripts/generate-templates.js
 */

export interface TemplateFile {
  path: string;
  content: string;
  type: 'file' | 'dir';
}

export const staticTemplateData: Record<string, TemplateFile[]> = ${JSON.stringify(templates, null, 2)};
`;

  const outputPath = path.join(__dirname, '../app/lib/templates-data.ts');
  fs.writeFileSync(outputPath, output);
  
  console.log('✅ Generated: app/lib/templates-data.ts');
  console.log(`📊 Total templates: ${Object.keys(templates).length}`);
  console.log(`📊 Total files: ${Object.values(templates).reduce((sum, files) => sum + files.length, 0)}\n`);
  
} catch (error) {
  console.error('❌ Error generating template data:', error);
  process.exit(1);
}

