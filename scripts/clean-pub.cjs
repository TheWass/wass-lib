const fs = require('fs-extra');
const path = require('path');
const aliasRoot = require('./gen-alias.cjs').aliasRoot;

fs.removeSync(path.resolve(__dirname, `../dist`));
aliasRoot
  .map((alias) => path.resolve(__dirname, `../${alias}`))
  .forEach(alias => { fs.removeSync(alias); });
