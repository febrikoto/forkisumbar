const https = require('https');

https.get('https://event.forkindo.my.id/assets/index-BTKsq2Hx.js', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    // Extract any string containing "png", "jpg", "jpeg", "svg" or "webp"
    const urls = data.match(/["'][^"']*\.(?:png|jpe?g|webp|svg)[^"']*["']/gi);
    if (urls) {
      console.log([...new Set(urls)]);
    } else {
      console.log('No URLs found');
    }
  });
}).on('error', (err) => {
  console.error(err);
});
