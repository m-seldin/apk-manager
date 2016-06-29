Module for manipulating apk's with adb
Install, uninstall, run, stop application on your device from command line

[![NPM](https://nodei.co/npm/apk-runner.png)](https://nodei.co/npm/apk-runner/)

## 1. Installation

To install the most recent release from npm, run:

    npm install apk-runner -g

## 2. Usage

You can do many things with this module:
* Install apk on device
* Uninstall apk on device
* Run app on device
* Stop app on device

Once you have installed the module globaly you will have 2 optional commands for running the module:
* apk-runner [arguments]
* ar [arguments]

### 2.1. Command line

Will install and run apk on connected device:
```bash
apk-runner yourapk.apk
```

#### Running the module with no arguments (as shown in example above) will run the following procedure for the apk:
1. stop application (if running and exists on device)
2. uninstall apk (if exists on device)
3. install apk
4. run application

Display usage:
```bash
apk-runner --help
```

if any option from the available options is specified then the module will execute only the specified option.
For instance running the following command will only install the apk.

```bash
apk-runner --install yourapk.apk
```

This command will uninstall and install the apk.

```bash
apk-runner --uninstall --install yourapk.apk
```

The logical order of the command will always be stop,uninstall,install,run.

## 3. Testing

To run tests, use the following command from module's root:

````
npm test
````