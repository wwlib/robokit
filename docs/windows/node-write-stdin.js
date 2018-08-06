const fs = require ('fs');
//let outfile = fs.createWriteStream('outfile.wav', { encoding: 'binary' });
//process.stdin.pipe(outfile);


// let data = '';
let buffers = [];
process.stdin.on('data', function(chunk) {
  console.log('chunk is buffer: ', Buffer.isBuffer(chunk));
  buffers.push(chunk);
  // data += chunk;
});

process.stdin.on('end', function() {
      console.log('end');
      // var buffer =  Buffer.from(data, 'binary');
      var buffer = Buffer.concat(buffers);

      fs.writeFile('outfile.wav', buffer, function(err) {
        // handle error, return response, etc...
        if (err) {
            console.log(err);
        } else {
            console.log('aok');
        }
      });
  });
