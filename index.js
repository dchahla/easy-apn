const {
  spawn
} = require('child_process');

function sendPushNotification({
  title,
  message,
  sound = 'default',
  badge = 0,
  certPath,
  exportPassword,
  appBundleId,
  pushToken,
  additionalInfo = '',
  debuggerEnabled,
  production
}) {

  const apnURL = production ?
    'https://api.push.apple.com/3/device/' :
    'https://api.sandbox.push.apple.com/3/device/';


  const curlArgs = [
    'curl',
    '-v',
    '-d',
    JSON.stringify({
      aps: {
        alert: {
          title,
          body: message,
        },
        sound: sound || 'default',
        badge,
      },
      "aditional-info": additionalInfo
    }),
    '--cert-type',
    'P12',
    '--cert',
    `${certPath}:${exportPassword}`,
    '-H',
    `apns-topic: ${appBundleId}`,
    '--http2',
    `${apnURL}${pushToken}`,
  ];
  return new Promise((resolve, reject) => {

    const curlProcess = spawn('curl', curlArgs);
    let err = ''
    curlProcess.stdout.on('data', (data) => {
      if (debuggerEnabled) {
        console.log(`Easy-APN stdout: ${data}`);
      }
    });

    curlProcess.stderr.on('data', (data) => {
      if (debuggerEnabled && data.includes('HTTP/2 200')) {
        console.log('\x1b[32m ' + `Easy-APN info: ${format(data.toString())}` + ' \x1b[0m');
      }
      if (data.includes('HTTP/2 40')) {
        console.error(`Easy-APN stderr: ${err}`);
        if (production) {
          resolve('\x1b[91m ' +
            `Failed to send push notification!\n \nPlease check you are using production certs if you since this error can happen when you send dev certs to a production environment\n
         You have {production : true} in your config. \n
         Test by opening this page in a browser https://api.push.apple.com/3/device/    
        ` +
            ' \x1b[0m');
        } else {
          resolve('\x1b[91m ' +
            `Failed to send push notification!\n\n This error can happen when you send production certs to a dev (sandbox) environment \n
        You have {production : false} or undefined in your config. (pointing to sandbox) \n
        Test by opening this page in a browser https://api.sandbox.push.apple.com/3/device/      
        ` +
            ' \x1b[0m');
        }
      }
      err += `${data}`
    });

    curlProcess.on('close', (code) => {
      if (code === 0) {
        if (debuggerEnabled) {
          console.log('\x1b[33m ' + 'Push notification sent successfully! ' + ' \x1b[0m');

        }
        resolve(null)

      } else {
        if (code === 58) {
          var error = "'Incorrect path to p12 file. Use full file path.'"
        }
        resolve(`Failed to send push notification. Easy-APN exited with code ${code}. \n
      {error: ${error} }
      `);
      }
    });
  })
}

function format(inputString) {
  const lines = inputString.split('\n');
  if (lines.length >= 2) {
    return lines.slice(0, 2).join('\n');
  }
  return inputString;
}
module.exports = sendPushNotification;
