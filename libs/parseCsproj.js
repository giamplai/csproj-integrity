"use strict";

// vendors modules
const globby = require("globby");
const fs = require("fs");
const xml2js = require("xml2js");
const path = require("path");

// libs modules
const beautifyPath = require("./beautifyPath");

/**
 * Parse csproj file
 * 
 * @returns {promise}
 */
module.exports = function() {
    let cwd = process.cwd();

    let csproj = globby.sync(["*.csproj"]).map(e => {
      return beautifyPath(cwd + "/" + e);
    });

    if (csproj && csproj.length > 0) {
      var parser = new xml2js.Parser();
      var fileIncluded = [];

      return new Promise((resolve, reject) => {
        fs.readFile(csproj[0], (err, data) => {
          parser.parseString(data, (err, result) => {
            let itemgroups = result.Project.ItemGroup;

            if (!itemgroups || itemgroups.length === 0) {
              reject("No item groups found in csprojFile");
            }

            fileIncluded = itemgroups
              //Take only item groups <Compile>, <Content>, <None> and <TypeScriptCompile>
              .filter(
                item =>
                  item.Compile ||
                  item.Content ||
                  item.None ||
                  item.TypeScriptCompile ||
                  false
              )
              //Take only the object of itemgroup
              .map(item => {
                let a = [];

                if (item.Content) {
                  a = a.concat(item.Content);
                }
                if (item.Compile) {
                  a = a.concat(item.Compile);
                }
                if (item.None) {
                  a = a.concat(item.None);
                }
                if (item.TypeScriptCompile) {
                  a = a.concat(item.TypeScriptCompile);
                }

                return a;
              })
              .reduce((fileIncludes, itemsArray) => {
                fileIncludes = itemsArray
                  .map(item => {
                    let include = item.$.Include;
                    include = include.replace(/\\/g, path.sep); //normalize on *nix
                    return unescape(include);
                  })
                  .concat(fileIncludes);

                return fileIncludes;
              }, []);
            resolve(fileIncluded);
          });
        });
      });
    } else {
      return Promise.reject("ERR: csproj file not found");
    }
}
