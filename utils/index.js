const chalk = require("chalk");
const fs = require("fs-extra");
const reg = require("./reg");

exports.reg = reg;

exports.isEmptyObject = obj => Object.keys(obj).length === 0;

exports.getFileName = s => s.substring(s.lastIndexOf("/") + 1);

exports.removeLastSlash = s => s.substring(0, s.lastIndexOf("/"));

exports.copyer = (from, to, exclude) => {
  exclude = exclude || [];
  fs.copySync(from, to, {
    dereference: true,
    filter: file => exclude.every(item => item !== file)
  });
};

exports.writeJSON = (data, output) => {
  fs.writeFileSync(output, JSON.stringify(data, null, 2));
};

const log = {};
const colorList = [
  "red",
  "blue",
  "cyan",
  "green",
  "white",
  "yellow",
  "magenta",
  "gray"
];
colorList.forEach(item => {
  const type = item === "gray" ? item : `${item}Bright`;
  log[item] = info => {
    console.log(chalk[type](info));
  };
});

exports.log = log;
