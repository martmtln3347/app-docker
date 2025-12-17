import fs from "fs";
import path from "path";
import archiver from "archiver";
import ignore from "ignore";

const output = fs.createWriteStream(path.resolve(process.cwd(), "projet-backend.zip"));
const archive = archiver("zip", { zlib: { level: 9 } });

const ig = ignore();
const gitignorePath = path.resolve(".gitignore");
if (fs.existsSync(gitignorePath)) {
  ig.add(fs.readFileSync(gitignorePath).toString());
}

archive.pipe(output);

function addDirToArchive(dir, base = "") {
  for (const item of fs.readdirSync(dir)) {
    const relPath = path.join(base, item);
    const absPath = path.join(dir, item);
    if (ig.ignores(relPath)) continue;
    const stat = fs.statSync(absPath);
    if (stat.isDirectory()) {
      addDirToArchive(absPath, relPath);
    } else {
      archive.file(absPath, { name: relPath });
    }
  }
}

addDirToArchive(process.cwd());

archive.finalize();