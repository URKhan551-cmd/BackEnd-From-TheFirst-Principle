// Why do we need a stream ? ; imagine we have file 2GB of data.
// we want to copy from one place to other.

// const fs = require("node:fs/promises");

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


// createReadStream()  comes from node:fs,  not  node:fs/promises
const fs = require("node:fs")

const pathFile = "./build-file-processor/articles.json";
const readable = fs.createReadStream(pathFile);

readable.on("data", (chunk) => {
    console.log("received a chunk");
    console.log("chunk size:", chunk.length);
    console.log("chunk content: ", chunk.toString("utf8"));
});

readable.on("end", () => {
    console.log("Finished reading the file.");
})

readable.on("error", (error) => {
    console.log("Reading failed:", error.message);
});

// fs.createReadStream()  does not mean the entire file has been read into memory. it established underlyiing machinery of file-reading.
// data is an event. when data becomes available node emit data event.
// chunk is usually a Buffer when stream is operating in its default binary mode.
// why Buffer ? ==  because files contain bytes, not inherently JS string.  then cnvert bytes into string

// end event indicate that the stream has no more data to provide.

// error event : the file does not exists. / permission denied /  underlying device or filesystem encounter an error.

// how Node decide chunk size  fs.createReadStream(pathFile, {highWaterMark: 64 * 1024,});  65,536 bytes = 64Kib,

// smaller chunk : less data per chunk, potentially more overload.
// Larger chunnk: fewer operations, potentially more buffering and memory use.


// WRITABLE SIDE OF STREAM ::
const writable = fs.createWriteStream(pathFile);

writable.write("First line\n");
writable.write("Second line\n");
writable.write("Third line\n");
writabke.end();

writable.on("finish", () => {
    console.log("Writing complete:");
});

writable.on("error", (error) => {
    console.error("Writing failed:", error.message);
});

// createWriteStream() = create writable stream
// write()  submits data to the stream.
// end()  signals that no more data wwill be written.
// the stream finishes processing its queue data.
// the finish event indicates that all submitted data has been handled by the writable stream.

// end() is a signal frommy app 
// finish is an event from writable stream
// close indicate underline stream resources has been closed.

// COMBINE READ AND WRITE STREAM 
const source = pathFile;
const destination = "./writeReadStream.txt";

const readable = fs.createReadStream(source);
const writabel = fs.createWriteStream(destination);

readable.pipe(writable);

writable.on("finish", () => {
    console.log("File Copied successfully");
});

readable.on("error", (error) => {
    console.error("Read error:", error.message);
});

writable.on("error", (error) => {
    console.error("write Error: ", error.message);
});

// pipe()  also coordinates flow with destination ability to accept data. we will study underlying in lesson 5 next .
// this pipe does not provide complete pipeline error management and cleanup by itself .
// for production work Node provide pipeline().


// PIPEline() API 
// const fs = require("node:fs");
const { pipeline } = require("node:stream/promises");
const path = require("node:path");

async function copyFile(source, destination){
    await pipeline(
        fs.createReadStream(source),
        fs.createWriteStream(destination)
    );

    console.log("copy completed");
}

const source = path.join(__dirname, "data", "articles.json");
const destination = path.join(__dirname, "data", "articles-copy.json");

copyFile(source, destination).catch((error) => {
    console.error("Copy failed", error.message);
});

// pipeline():
// - Connects the streams.
// - Coordinates data flow.
// - Propagates errors through the pipeline.
// - Handles stream destruction and cleanup when failures occur.
// - Returns a promise when using node:stream/promises.
// It gives you a more reliable way to compose stream operations.

