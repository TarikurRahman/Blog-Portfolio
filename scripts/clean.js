const fs = require('fs');
const path = require('path');

const targets = ['.next', 'tsconfig.tsbuildinfo'];

function deleteRecursive(targetPath) {
  if (!fs.existsSync(targetPath)) return;

  const stat = fs.lstatSync(targetPath);
  if (stat.isDirectory()) {
    const files = fs.readdirSync(targetPath);
    for (const file of files) {
      deleteRecursive(path.join(targetPath, file));
    }
    fs.rmdirSync(targetPath);
  } else {
    fs.unlinkSync(targetPath);
  }
}

console.log('🧹 Cleaning build cache and temporary files...');
targets.forEach((target) => {
  const targetPath = path.join(__dirname, '..', target);
  if (fs.existsSync(targetPath)) {
    try {
      deleteRecursive(targetPath);
      console.log(`✅ Deleted: ${target}`);
    } catch (err) {
      console.error(`❌ Failed to delete ${target}:`, err.message);
    }
  } else {
    console.log(`ℹ️ Not found: ${target}`);
  }
});
console.log('✨ Cleanup complete! Run "npm run dev" or "npm run build" to recreate them.');
