// Why do we need a stream ? ; imagine we have file 2GB of data.
// we want to copy from one place to other.

const fs = require("node:fs/promises");

async function copyFile(source, destination){
    const data = await fs.readFile(source);

    await fs.writeFile(destination, data);
}
// this will work for small files.
// INTERNAL   2GB file -->> memory(RAM) plus additional overhead. --> destination file write hoga data.

// the problem is here read file complete file into RAM occupy space.
// if several req comes and perform same operation simultinously, memory consume significantly.
// do we really need to copy as whhole 2GB data No NO. we can proces it in pieces.
// where stream comes in.

// what exactly STREAM is ?  abstraction for processing data incrementally.
// in chunks like 2000 boxes, we can transport 100 boxes, deliver them then transport another 100.

// readFile() give us complete file.  /  A Readable stream read incrementally  /  writable stream accept data incrementally.

// 4 fundamental stream type::  
// Readable = produce data our app can consume  fs.createReadStream() |
// writabel = accept data from our app  fs.createWriteStream() |
// duplex  = do both produce and accept TCPsocket |
// transform = receives data transform and produce new data   GZIP compression.

 

