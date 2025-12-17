import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import ignore from 'ignore';

// Script: zip-needed.js
// Crée project-clean.zip en incluant tous les fichiers de code du dépôt
// sauf les dossiers d'exclusion (node_modules, coverage, backups, .git),
// et en respectant .gitignore. Utile pour partager une archive "fonctionnelle".

const cwd = process.cwd();
const outName = 'project-clean.zip';
const outputPath = path.resolve(cwd, outName);

// Top-level directories to always exclude from archive
const excludeTop = new Set(['node_modules', 'coverage', 'backups', '.git']);

// Charger .gitignore si présent
const ig = ignore();
const gitignorePath = path.join(cwd, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  ig.add(fs.readFileSync(gitignorePath, 'utf8'));
}

// Files we want to include even if .gitignore would ignore them
const forcedInclude = new Set([
  '.env.example',
  // ensure helpful scripts we created are included in the clean archive
  'scripts/check_swagger_routes.js',
  'scripts/check_api_endpoints.js',
  'scripts/list_and_probe_get_routes.js',
]);

const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✅ Archive créée: ${outputPath} (${archive.pointer()} bytes)`);
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') console.warn(err.message);
  else throw err;
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

function walkAndAdd(dirAbs, baseRel = '') {
  for (const name of fs.readdirSync(dirAbs)) {
    const abs = path.join(dirAbs, name);
    const rel = baseRel ? `${baseRel}/${name}` : name;
    const relNorm = rel.replace(/\\/g, '/');

    // Skip top-level excluded dirs
    const top = relNorm.split('/')[0];
    if (excludeTop.has(top)) continue;

  // Respect .gitignore, but allow forced includes
  if (ig.ignores(relNorm) && !forcedInclude.has(relNorm)) continue;

  // Avoid including the archive we are currently creating
  if (relNorm === path.basename(outputPath)) continue;

  const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      walkAndAdd(abs, relNorm);
    } else {
      archive.file(abs, { name: relNorm });
    }
  }
}

(async () => {
  console.log('🔎 Création de l’archive: inclusion de tous les fichiers de code sauf node_modules/coverage/backups/.git (respecte .gitignore) ...');
  walkAndAdd(cwd, '');
  await archive.finalize();
})();
