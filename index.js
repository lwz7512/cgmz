"use strict";

var walk    = require('walk')
  , fs      = require('fs')
  , path    = require('path')
  , cheerio = require("cheerio")
  , ncp = require('ncp').ncp
  , walker  = walk.walk("./_book", { followLinks: false })
  ;

walker.on("file", fileHandler);
walker.on("errors", errorsHandler); // plural
walker.on("end", endHandler);

// root 是文件所在目录
function fileHandler(root, fileStat, next) {

  if(fileStat.name.indexOf('html')> -1) {

    console.log('>>>read file: ' + path.resolve(root, fileStat.name));

    var buffer = fs.readFileSync(path.resolve(root, fileStat.name));
    // console.log(fileStat.name, buffer.byteLength);
    // 保持中文正常读取
    var $ = cheerio.load(buffer, {decodeEntities: false});
    $('a').each(function(i,e){
      var a = $(e);
      var href = a.attr('href');
      if(!href) return;
      // 以 / 结尾的url
      if((/\/$/).test(href)) {
        // console.log('test: '+href);
        a.attr('href', href+'index.html')
      }
    });
    $('a').each(function(i, e){
      var a = $(e);
      var href = a.attr('href');
      if(!href) return;
      // console.log('result: '+href);
    });
    // console.log($.html());

    fs.writeFileSync(path.resolve(root, fileStat.name), $.html());

  }
  next();

}

function errorsHandler(root, nodeStatsArray, next) {
  nodeStatsArray.forEach(function (n) {
    console.error("[ERROR] " + n.name)
    console.error(n.error.message || (n.error.code + ": " + n.error.path));
  });
  next();
}

function endHandler() {
  console.log('>>>end of file process!');

  ncp('_book/', '/Users/liwenzhi/mobile/cgmz/www', function (err) {
   if (err) {
     return console.error(err);
   }
   console.log('all done!');
  });

  console.log('>>> start copy to mobile www...');

}
