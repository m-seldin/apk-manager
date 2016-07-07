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
const Helpers = require('./helpers.js');
const sync = require('child_process').spawnSync;
const endOfLine = require('os').EOL;
const readlineSync = require('readline-sync');

exports.ApkRunner = ApkRunner;

exports.createApkRunner = function (apk,androidSdkDir) {
  return new ApkRunner(apk,androidSdkDir);
};

function ApkRunner(apk,androidSdkDir){

	this.androidSdkDir = androidSdkDir;
	this.buildToolsDir = Helpers.findBuildTools(this.androidSdkDir);
	this.aapt = `${this.buildToolsDir}/aapt`;
	this.adb = `${this.androidSdkDir}/platform-tools/adb`;
	this.apk = apk;
	this.appName =null;
	this.activityName=null;

	this.chooseDevice();
	this.analizeApk();

	this.printVars();
}

ApkRunner.prototype.printVars=function(){
	logger.info(`SDK dir = ${this.androidSdkDir}`);
	logger.info(`Build Tools Dir dir = ${this.buildToolsDir}`);
	logger.info(`Apk = ${this.apk}`);
	logger.info(`App package = ${this.appName}`);
	logger.info(`Main activity name = ${this.activityName}`);

}

ApkRunner.prototype.runApp=function(){
	logger.info(`Running app ${this.appName} (${this.apk})`);
	sync(this.adb,["-s",this.deviceId ,"shell","am","start",
			"-a",this.activityName,"-n",`${this.appName}/${this.activityName}`],
		{stdio: [0, 1, 2]});

};

ApkRunner.prototype.stopApp=function(){
	logger.info(`Stopping app ${this.appName} (${this.apk})`)
	sync(this.adb,["-s",this.deviceId ,"shell", "am", "force-stop",this.appName],
		{stdio: [0, 1, 2]});
};


ApkRunner.prototype.uninstallApk=function(){
	logger.info(`Uninstalling app ${this.appName} (${this.apk})`)
	sync(this.adb,["-s",this.deviceId,"uninstall",this.appName],{stdio: [0, 1, 2]});
};

ApkRunner.prototype.installApk=function(){
	logger.info(`Installing app ${this.appName} (${this.apk})`)
	if(!Helpers.fileExists(this.apk)){
		logger.info(`Apk ${this.apk} doesn't exists!`);
	}

	if(this.deviceId==null){
		this.chooseDevice();
	}

	var output = sync(this.adb,["-s",this.deviceId,"install","-r",this.apk],{stdio: [0, 1, 2]});


	if(output.toString().includes("Failure")){
		logger.info(`Failed to install ${this.apk}!`);
	}else{
		logger.info(`Successfully installed ${this.apk}`);
	}
};

ApkRunner.prototype.getDevicesList=function(){
	const output = sync(this.adb,['devices']);
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
			logger.debug(`found application name : ${appName}`);
		}else if(line.includes('launchable-activity')){
			activityName= line.split("'")[1];
			logger.debug(`found activity name : ${activityName}`);
		}
	});

	this.appName = appName;
	this.activityName = activityName;
};