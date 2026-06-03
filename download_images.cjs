const https = require('https');
const fs = require('fs');

https.get('https://event.forkindo.my.id/banner.png', (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to get banner.png: ${res.statusCode}`);
    return;
  }
  const file = fs.createWriteStream('public/banner.png');
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('banner.png downloaded!');
  });
}).on('error', (err) => {
  console.error(err);
});

https.get('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQGCntVxBIr00MFun3OcDBbw73rboTYFklRQtj4Udpz_6WVy4uwwgz6oU9&s=10', (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to get logo: ${res.statusCode}`);
    return;
  }
  const file = fs.createWriteStream('public/forki-logo.png');
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('logo downloaded!');
  });
}).on('error', (err) => {
  console.error(err);
});
