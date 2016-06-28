'use strict';
var sync = require('child_process').spawnSync;
var endOfLine = require('os').EOL;
var readlineSync = require('readline-sync');
var Helpers = require('helpers.js');

exports.ApkRunner = ApkRunner;

exports.createApkRunner = function (androidSdkDir) {
  return new ApkRunner(androidSdkDir);
};

function ApkRunner(androidSdkDir){
	this.androidSdkDir = androidSdkDir;
	this.adb = `${this.androidSdkDir} + \\platform-tools`;
	this.deviceId=null;
}

ApkRunner.prototype.installApk=function(apk){
	if(!Helpers.fileExists){
		console.log(`Apk ${apk} doesn't exists!`);
	}

	if(this.deviceId==null){
		this.chooseDevice();
	}

	var output = sync('adb',["-s",this.deviceId,"install",apk]);

	if(output.error.code!=0){
		console.log(`Failed to install ${apk}!`);
	}else{
		console.log(`Successfully installed ${apk}`);
	}
};

ApkRunner.prototype.getDevicesList=function(){
	var output = sync('adb',['devices']);
	var stdOutput =output.stdout.toString();
	var lines = stdOutput.split(endOfLine);
	var devices = [];
	lines.map(function(line){
		if(line.includes("device") && line.includes("\t")){
			var temp= line.split("\t");
			devices.push(temp[0].trim());
		}
	});

	return devices;
};

ApkRunner.prototype.getDevice=function(){
	return this.deviceId;
};

ApkRunner.prototype.chooseDevice=function(){
	var devices = this.getDevicesList();

	var choosingString = "";

	devices.map(function (device,index) {
		choosingString+=(`[${index}] ${device}${endOfLine}`);
	});

	var deviceIndex = readlineSync.question(`Please choose device (e.g number): ${endOfLine}${choosingString}`);

	this.deviceId = devices[deviceIndex];
};