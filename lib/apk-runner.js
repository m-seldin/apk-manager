'use strict';
var sync = require('child_process').spawnSync;
var endOfLine = require('os').EOL;
var readlineSync = require('readline-sync');
var Helpers = require('./helpers.js');

exports.ApkRunner = ApkRunner;

exports.createApkRunner = function (apk,androidSdkDir) {
  return new ApkRunner(apk,androidSdkDir);
};

function ApkRunner(apk,androidSdkDir){
	this.androidSdkDir = androidSdkDir;
	this.buildToolsDir = Helpers.findBuildTools(this.androidSdkDir);
	this.aapt = `${this.buildToolsDir}\\aapt`;
	this.adb = `${this.androidSdkDir}\\platform-tools\\adb`;
	this.apk = apk;
	this.appName =null;
	this.activityName=null;

	this.chooseDevice();
	this.analizeApk();
}

ApkRunner.prototype.runApp=function(){
	console.log(`Running app ${this.appName} (${this.apk})`)
	sync(this.adb,["-s",this.deviceId ,"shell","am","start",
			"-a",this.activityName,"-n",`${this.appName}/${this.activityName}`],
		{stdio: [0, 1, 2]});

};

ApkRunner.prototype.stopApp=function(){
	console.log(`Stopping app ${this.appName} (${this.apk})`)
	sync(this.adb,["-s",this.deviceId ,"shell", "am", "force-stop",this.appName],
		{stdio: [0, 1, 2]});
};


ApkRunner.prototype.uninstallApk=function(){
	console.log(`Uninstalling app ${this.appName} (${this.apk})`)
	sync(this.adb,["-s",this.deviceId,"uninstall",this.appName],{stdio: [0, 1, 2]});
};

ApkRunner.prototype.installApk=function(){
	console.log(`Installing app ${this.appName} (${this.apk})`)
	if(!Helpers.fileExists(this.apk)){
		console.log(`Apk ${this.apk} doesn't exists!`);
	}

	if(this.deviceId==null){
		this.chooseDevice();
	}

	var output = sync(this.adb,["-s",this.deviceId,"install","-r",this.apk],{stdio: [0, 1, 2]});


	if(output.toString().includes("Failure")){
		console.log(`Failed to install ${this.apk}!`);
	}else{
		console.log(`Successfully installed ${this.apk}`);
	}
};

ApkRunner.prototype.getDevicesList=function(){
	const output = sync('adb',['devices']);
	const stdOutput =output.stdout.toString();
	const lines = stdOutput.split(endOfLine);
	const devices = [];
	lines.map(function(line){
		if(line.includes("device") && line.includes("\t")){
			let temp= line.split("\t");
			devices.push(temp[0].trim());
		}
	});

	return devices;
};

ApkRunner.prototype.getDevice=function(){
	return this.deviceId;
};

ApkRunner.prototype.chooseDevice=function(){
	const devices = this.getDevicesList();

	if(devices.length==0){
		throw "No devices connected";
	}

	let choosingString = "";

	devices.map(function (device,index) {
		choosingString+=(`[${index}] ${device}${endOfLine}`);
	});

	if(devices.length>1) {
		let deviceIndex = readlineSync.question(`Please choose device (e.g number): ${endOfLine}${choosingString}`);
		this.deviceId = devices[deviceIndex];
	}else {
		this.deviceId = devices[0];
	}
};

ApkRunner.prototype.analizeApk=function(apk){
	const dumpBadginOut = sync(this.aapt,["dump","badging",this.apk]);
	let appName = "";
	let activityName="";

	if(dumpBadginOut.status!=0){
		throw `Error parsing ${this.apk} info : ${dumpBadginOut.stderr}`;
	}
	const dumpBadginOutStr = dumpBadginOut.stdout.toString();
	var lines = dumpBadginOutStr.split(endOfLine);
	lines.map(function(line){
		if(line.includes("package")){
			appName = line.split("'")[1];
			console.log(`found application name : ${appName}`);
		}else if(line.includes('launchable-activity')){
			activityName= line.split("'")[1];
			console.log(`found activity name : ${activityName}`);
		}
	});

	this.appName = appName;
	this.activityName = activityName;
};