const fs = require('fs');
const path = require('path');
const params = require('commander');

params
  .option('-i, --in [in]', 'Input folder', './in')
  .option('-o, --out [out]', 'Output folder', './out')
  .option('-d, --delete', 'Delete input folder')
  .parse(process.argv);

const inDir = params.in;
const outDir = params.out;
const deleteInDir = params.delete;

sortCollection(inDir, outDir, deleteInDir).then(() => {
  console.log('DONE!');
}).catch(err => {
  console.log(err);
});

function sortCollection (inDir, outDir, deleteInDir) {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        await checkAccess(inDir);
      } catch (err) {
        console.log('Input folder does not exist');
        reject(err);
      }

      try {
        await checkAccess(outDir);
      } catch (err) {
        try {
          await createDir(outDir);
        } catch (err) {
          console.log('Can not create output folder');
          reject(err);
        }
      }

      try {
        await sortDir(inDir);
      } catch (err) {}

      resolve();
    })();
  });
}

function checkAccess (path) {
  return new Promise((resolve, reject) => {
    fs.access(path, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function createDir (path) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function readDir (path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

function getStat (path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, state) => {
      if (err) {
        reject(err);
      } else {
        resolve(state);
      }
    });
  });
}

function sortDir (dir) {
  return new Promise((resolve, reject) => {
    readDir(dir).then(files => {
      Promise.all(files.map(item => {
        return new Promise((resolve, reject) => {
          const itemPath = path.join(dir, item);

          getStat(itemPath).then(state => {
            if (state.isFile()) {
              const letter = item[0].toUpperCase();
              const targetDir = path.join(outDir, letter);
              const targetFile = path.join(targetDir, item);

              checkAccess(targetDir).then(() => {
                moveFile(item, itemPath, targetFile, targetDir, dir).then(resolve).catch(reject);
              }).catch(() => {
                createDir(targetDir).then(() => {
                  moveFile(item, itemPath, targetFile, targetDir, dir).then(resolve).catch(reject);
                }).catch(() => {
                  moveFile(item, itemPath, targetFile, targetDir, dir).then(resolve).catch(reject);
                });
              });
            }

            if (state.isDirectory()) {
              sortDir(itemPath).then(resolve).catch(reject);
            }
          }).catch(reject);
        });
      })).then(resolve).catch(reject);
    }).catch(err => {
      console.log('Can not read input folder');
      reject(err);
    });
  });
}

function moveFile (item, itemPath, targetFile, targetDir, dir) {
  return new Promise((resolve, reject) => {
    let fileNameSuffix = 1;

    while (fs.existsSync(targetFile)) {
      const itemParts = path.parse(item);
      targetFile = path.join(targetDir, itemParts.name + '_' + fileNameSuffix + itemParts.ext);
      fileNameSuffix++;
    }

    fs.link(itemPath, targetFile, err => {
      const result = err ? '[error]' : '[ok]';
      console.log(itemPath + ' -> ' + targetFile + ' ' + result);

      if (deleteInDir) {
        fs.unlink(itemPath, () => {
          fs.rmdir(dir, () => {});
          fs.rmdir(inDir, () => {});
        });
      }

      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
