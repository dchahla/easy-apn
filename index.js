const { spawn } = require('child_process');

function sendPushNotification({
  title,
  message,
  sound,
  badge,
  certPath,
  exportPassword,
  appBundleId,
  pushToken,
  additionalInfo = '',
}) {
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
    }),
    '--cert-type',
    'P12',
    '--cert',
    `${certPath}:${exportPassword}`,
    '-H',
    `apns-topic: ${appBundleId}`,
    '--http2',
    `https://api.push.apple.com/3/device/${pushToken}`,
  ];

  const curlProcess = spawn('curl', curlArgs);

  curlProcess.stdout.on('data', (data) => {
    console.log(`Easy-APN stdout: ${data}`);
  });

  curlProcess.stderr.on('data', (data) => {
    console.error(`Easy-APN stderr: ${data}`);
  });

  curlProcess.on('close', (code) => {
    if (code === 0) {
      console.log('Push notification sent successfully.');
    } else {
      console.error(`Failed to send push notification. Easy-APN exited with code ${code}`);
    }
  });
}

module.exports = sendPushNotification;
