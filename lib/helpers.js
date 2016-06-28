var fs = require('fs'),
    path = require('path');

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
}

exports.findBuildTools = function(sdkHomeDir){
    var buildToolsDir = sdkHomeDir  + "/build-tools";

    var getChildDirs = getDirectories(buildToolsDir);
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
    console.log(`Using build tools : ${buildToolsDir}`)

    return buildToolsDir;
};