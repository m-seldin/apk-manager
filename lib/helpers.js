var fs = require('fs');

function fileExists(file) {
    try {
        fs.accessSync(file, fs.F_OK);
    } catch (e) {
        return false;
    }
    return true;
}