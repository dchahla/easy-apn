const {
  spawn
} = require('child_process');
const fs = require('fs')

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
  if(!message || !message.length) {return "Easy-APN stderr: [message] field required."}
  if(!pushToken || !pushToken.length) {return "Easy-APN stderr: [pushToken] field required."}
  if(!appBundleId || !appBundleId.length) {return "Easy-APN stderr: [appBundleId] field required."}
  if(!certPath || !certPath.length) {return "Easy-APN stderr: [certPath] field required."}
  if(!fs.existsSync(certPath)) {return "Easy-APN stderr: [certPath] invalid."}
  else 
{
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
        if(data.toString().includes("TopicDisallowed")){
          err = data
        }
      });

      curlProcess.stderr.on('data', (data) => {
        if (debuggerEnabled && data.includes('HTTP/2 200')) {
          console.log('\x1b[32m ' + `Easy-APN info: ${format(data.toString())}` + ' \x1b[0m');
        }
        if (data.includes('HTTP/2 40')) {
          if (production) {
            resolve('\x1b[91m ' +
              `\nEasy-APN stderr: sending for ${appBundleId}... cert + appBundleId mismatch.\n  \nPlease check you are using production certs if you since this error can happen when you send dev certs to a production environment\n
          You have {production : true} in your config. \n
          Test by opening this page in a browser https://api.push.apple.com/3/device/    
          ` +
              ' \x1b[0m');
          } else {
            resolve('\x1b[91m ' +
              `\nEasy-APN stderr: sending for ${appBundleId}... cert + appBundleId mismatch.\n \n This error can happen when you send production certs to a dev (sandbox) environment \n
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
          resolve(null)

        } else {
          if (code === 58 && fs.existsSync(certPath)) {
            var error = "Easy-APN stderr: [certPath] invalid."
            resolve(`Easy-APN stderr: exportPassword for ${certPath} invalid.`)

          }
          else  {
            resolve(err) 
          }
        }
      });
    })}
}

function format(inputString) {
  const lines = inputString.split('\n');
  if (lines.length >= 2) {
    return lines.slice(0, 2).join('\n');
  }
  return inputString;
}
module.exports = sendPushNotification;
