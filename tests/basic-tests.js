'use strict';
var ApkRunner = require('../lib/apk-runner');
var Helpers = require('../lib/helpers');
describe('Basic tests', function () {

    it('Check Helpers', function () {
        let value = Helpers.fileExists("just-a-file-that-doesnt-exist");
        expect(value).toBe(false);

        value = Helpers.fileExists("package.json");
        expect(value).toBe(true);
    });
});