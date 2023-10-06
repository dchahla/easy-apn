# easy-apn
[![npm version](https://img.shields.io/npm/v/@swoopshops/easy-apn)](https://www.npmjs.com/package/easy-apn)
[![License](https://img.shields.io/github/license/dchahla/easy-apn.svg)](https://github.com/dchahla/easy-apn/blob/master/LICENSE) 
## Why

Easy APN (Apple Push Notification) is a lightweight Node.js module designed for any version of Node, including Node.js 18 and later, allowing you to send push notifications to iOS devices using the Apple Push Notification Service (APNs) seamlessly. No dependencies are required as it leverages the simplicity of the `curl` command for reliable error handling.

This module was born out of frustration after trying seemingly all existing APN npm libraries (apn-http2, apn2, node-apn, push-notification) in Node 18. When transitioning past Node.js 16 to Node.js 18, these modules returned error "unsupported" due to the introduction of native http2 in Node.js 18.

Easy APN aims to provide a simple and reliable solution for sending p12 certs using system features, which Apple seems to prefer.

## Installation


You can install the `easy-apn` module via npm:

```bash
npm install easy-apn
```
## Usage 
```
const sendPushNotification = require('easy-apn');

const pushNotificationData = {
  title: 'Your Notification Title',
  message: 'Your Notification Message',
  sound: 'default', // optional
  badge: 1, // optional
  certPath: '/path/to/your/cert.p12',
  exportPassword: 'your-export-password',
  appBundleId: 'com.your.app',
  pushToken: 'your-device-push-token', 
  additionalInfo: 'Test', // optional
  production: true, // use false for sandbox.push.apple.com must be dev certs - optional
  debuggerEnabled: true // logs  
};

async function exampleSend() {

    const err = await sendPushNotification(pushNotificationData)
    if(err){console.log(err)}

}

exampleSend()

```

## API

- **sendPushNotification(options, callback)**
  - Sends a push notification to an iOS device using APNs.
  - **options** (Object): An object containing the following properties:
    - `[title]` (String): The title of the push notification (required).
    - `[message]` (String): The message content of the push notification (required).
    - `[sound]` (String, optional): The name of the sound to be played (default: 'default').
    - `[badge]` (Number, optional): The badge number to display (default: 0).
    - `[certPath]` (String): The file path to your P12 certificate file (required).
    - `[exportPassword]` (String): The export password for the P12 certificate file (required).
    - `[appBundleId]` (String): The bundle ID of your iOS app (required).
    - `[pushToken]` (String): The device's push notification token (required).
    - `[additionalInfo]` (String, optional): Additional information for the push notification (default: '').
    - `[production]` (Boolean, optional): Whether to send the notification to the production environment (`true`) or the sandbox environment (`false`, default).
    - `[debuggerEnabled]` (Boolean, optional) Prints stdout and stderr stream.

  - **callback** (Function): A callback function to handle the result of sending the push notification. It will be called with an error as the first argument if there is an error, or `null` if the push notification was sent successfully.

