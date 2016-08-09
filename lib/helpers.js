//
// Copyright 2016 Michael Seldin
//     Licensed under the Apache License, Version 2.0 (the "License");
//     you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
//     Unless required by applicable law or agreed to in writing,
//     Software distributed under the License is distributed on an "AS IS" BASIS,
//     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//     See the License for the specific language governing permissions and limitations under the License.
//
//  Author:
//  Michael Seldin
'use strict';
const fs = require('fs'),
    path = require('path'),
    log4js = require('log4js');

global.logger = log4js.getLogger();

function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function(file) {
        return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
}

function isNumeric(num){
    return !isNaN(num)
}

exports.fileExists = function(file) {
    try {
        fs.accessSync(file, fs.F_OK);
    } catch (e) {
        return false;
    }
    return true;
};

exports.findBuildTools = function(sdkHomeDir){
    var buildToolsDir = sdkHomeDir  + "/build-tools";

    const getChildDirs = getDirectories(buildToolsDir);
    var maxVersion = 0;
    var choosedBuildTools = "";
    getChildDirs.map(function(item){
        var name = item.replace(".","");
        if(isNumeric(name)){
            if(name>maxVersion){
                maxVersion=name;
                choosedBuildTools = item;
            }
        }
    });

    buildToolsDir=buildToolsDir + `/${choosedBuildTools}`;
    logger.debug(`Using build tools : ${buildToolsDir}`)

    return buildToolsDir;
};

exports.deleteFolderRecursive = function(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};