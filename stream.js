const fs = require("fs");

const rs = fs.createReadStream("./streamLong.txt", {encoding: 'utf8'});

const ws = fs.createWriteStream("./newStart.txt");

// rs.on('data', (chunkData) => {

//     ws.write(chunkData);
// });

rs.pipe(ws);  // has been doing the same thisng as we did with on()
