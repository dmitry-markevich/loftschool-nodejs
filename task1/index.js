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

fs.access(inDir, err => {
  if (err) {
    console.log('Input folder does not exist.');
  } else {
    fs.access(outDir, err => {
      if (err) {
        fs.mkdir(outDir, err => {
          if (err) {
            console.log('Can not create output folder.');
          } else {
            sortDir(inDir);
          }
        });
      } else {
        sortDir(inDir);
      }
    });
  }
});

function sortDir (dir) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.log('Can not read directory ' + dir);
    } else {
      files.forEach(item => {
        const itemPath = path.join(dir, item);

        fs.stat(itemPath, (err, state) => {
          if (err) {
            console.log('Can not check ' + itemPath);
          } else {
            if (state.isFile()) {
              const letter = item[0].toUpperCase();
              const targetDir = path.join(outDir, letter);
              const targetFile = path.join(targetDir, item);

              fs.access(targetDir, err => {
                if (err) {
                  fs.mkdir(targetDir, () => {
                    moveFile(item, itemPath, targetFile, targetDir, dir);
                  });
                } else {
                  moveFile(item, itemPath, targetFile, targetDir, dir);
                }
              });
            }
            if (state.isDirectory()) {
              sortDir(itemPath);
            }
          }
        });
      });
    }
  });
}

function moveFile (item, itemPath, targetFile, targetDir, dir) {
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
  });
}
