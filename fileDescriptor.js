// When Node.js opens a file, how does it keep track of that file, communicate with the operating system, and manage access to it?

// This is where file descriptors and file handles come in.

// By the end of this lesson, you'll understand:
// - What happens internally when Node.js opens a file.
// - What a file descriptor (FD) actually is.
// - What a file handle is and how it relates to an FD.
// - Why open(), read(), write(), and close() matter.
// - How to manage resources safely.
// - What file descriptor leaks are and how to prevent them.
// - When professional applications should use handles instead of simple readFile() and writeFile().

// You might imagine Node.js simply opens the file, reads its contents, and returns them.

// But internally, there is more happening.
// Node.js needs to ask the operating system to open the file.
// The operating system finds the file, checks permissions, establishes access to it, and provides an identifier that Node.js can use for subsequent operations.

// That identifier is called a file descriptor.
// 2. What is a file descriptor?
// A file descriptor is a non-negative integer that identifies an open file or another I/O resource within a process.
// think of it like a Ticket Number.
// you dont need to ask OS each and every time which file to open.
// once file is open you can use it descriptor to refer to that open resources.

// const fd = 18; => OS = 18 descriptor => research.txt = 18

// descriptor assigned by OS
// not just a file descriptor it can identify SOCKET, PIPE, TERMINAL, I/O resources.

// Node.js provide file handle?  a higher-level Object fileHandle through "node:fs/promises";

const fs = require("node:fs/promises");
const path = require("path");

const pathFile = path.join("./build-file-processor/research.txt");

async function example(){
   const fileHandle =  await fs.open("./build-file-processor/research.txt", "r");

//    console.log(fileHandle) // object
   console.log("Descriptor of that file", fileHandle.fd);
   await fileHandle.close();
}
example();
// fileHandle give us an object. and provides methods 
// fileHandle.fd   => it expose underlying descriptor
// File descriptor vs FileHandle
// File descriptor	FileHandle
// Integer identifier	JavaScript object
// Managed by the OS	Provided by Node.js
// Identifies an open resource	Provides methods to use that resource
// Example: 18	Example: fileHandle
// Lower-level representation	Higher-level interface


// critical enginnering responsoibility is step 3:  which is close() file
// my app can accumulate open descrirptor. that bring important  production problem


// FILE DESCRIPTOR LEAKS::
async function readArticle(){
    const handle = await fs.open("./build-file-processor/research.txt", "r");

    const content = await handle.readFile("utf8");

    return content;
}
// file descriptor leaks occur when app open resource but fail to release them after use.
// whats wrong : we opened the file read it and returned the content.
// but never close the handle.  every invocation can leave another descriptor open.

// the correct approach : try ... finally
async function readArticleFile(){
    const handle = await fs.open("./build-file-processor/research.txt", "r");

    try {
        const content = await handle.readFile("utf8");
        return content;
    } catch(error){
        console.error(error);
    } finally {
        await handle.close();
    }
}

// finally runs whether the operation succeds or throw an error
// One  
// const handle = fs.open("path", "r");
// // the flag tels the OS what kind of accesss you need 
// "r" : open for reading.file must exisst.
// "r+" : open for reading and wwritting. file must be exists.
// "w" : open for writing; create or truncate   old data vanished new start 
// "w+": open for read & write : create or truncate.
// "a": open for appending: create if missing.  old data preserved + new data
// "a+": open for reading and  appending.
// "wx": create for writing; fail if file exists.
// "ax": create for appending fail if file exists.


// handle give us low level methods.
// handle.write()
// handle.read()
// handle.writeFile()
// handle.stat()
// handle.sync()
// handle.close()

// handle.read() example::
async function readFirstBytes(){
    const handle = await fs.open(pathFile, "r");
    
    try {
        const buffer = Buffer.alloc(20);

        const result = await handle.read(buffer, 0, buffer.length, 0);

        console.log("Bytes read: ", result.bytesRead);
        console.log("Content:", buffer.subarray(0, result.bytesRead).toString("utf8"));
    } finally {
        await handle.close();
    }
}

// handle.read(buffer, offset, length, position);
// buffer: memory area where daat will be placed     buffer = 20
// offset: where inside the buffer to start writing   0
// length: where number of bytes to read        buffer.length= 20
// position: where in the file to begin reading   0

// Buffer.alloc(20) create a memory area capacity of 20 bytes

// result = { bytesRead: 20, buffer }
// IMPORTANT : a single read() call is not guaranteed to fill the request length. professional code
// that need exact bytes numbers must loop until it has read enough or reached at the end of the file

// handle.write()  EXAMPLE:
async function writeData(){
    const handle = await fs.open(pathFile, "w");

    try {
        const data = Buffer.from("Learning Node.js filesystem");

        const result = await handle.write(data, 0, data.length, 0);

        console.log("Bytes written :", result.bytesWritten);

    }finally {
        await handle.close();
    }
}
// handle.write(buffer, offset, length, position);

// await handle.read(buffer, 0, 10, 20);
// reads starting from position 20
// when wwe use null at position in low/level read/write apis, the operation uses and update the current file/


// Production level handling of file 
async function readFileHandle(pathFile){
    let handle;

    try {
      handle = await fs.open(pathFile, "r");

      const stats = await handle.stat();

      if(!stats.isFile()){  // if the given is not a file then show an error 
        throw new Error("Expected a regular file.");
      }

      const content = await handle.readFile({encoding: "utf8"});
      return content;

    } catch(error){
        if(error.code === "ENOENT"){
            throw new Error(`File not found: ${pathFile}`, {cause: error,});
        }

        throw error;
    } finally {
        if(handle){
        await handle.close();
    }
}
}

// we are inspecting the file through the already-open handle rather than opening it again by path.
// this matters because the handle refers to the resource we actually opened.

// Situation	Recommended approach
// Read a small JSON configuration file	readFile()
// Write a small JSON file	writeFile() or atomic-write helper
// Append application logs	appendFile() or a logging library
// Repeated operations on one open file	open() and FileHandle
// Read specific byte positions	FileHandle.read()
// Write specific byte positions	FileHandle.write()
// Process very large files	Streams
// Manage a file resource explicitly	FileHandle

// A professional engineer doesn't use the lowest-level API everywhere. They choose the simplest API that correctly handles the requirements.

//


// knowledge check 
// 1. What does a file descriptor represent?

// A file's size in bytes

// An OS-level identifier for an open resource

// A JavaScript object containing file contents

// Correct

// A descriptor is an integer identifier assigned by the OS to an open resource within a process.



// 2. What does a FileHandle provide?

// A higher-level JavaScript interface to an open file

// A permanent file identifier that never changes

// A copy of the entire file

// Correct

// Node.js FileHandle wraps access to an open file descriptor and exposes methods such as readFile(), write(), stat(), sync(), and close().



// 3. Why use try...finally with an open FileHandle?

// To make reading synchronous

// To guarantee cleanup when operations succeed or fail

// To prevent all concurrent writes

// Correct

// The finally block runs during normal completion, returns, and thrown errors, allowing the handle to be closed.



// 4. What happens when you open an existing file with the 'w' flag?

// It appends to the end

// It opens only for reading

// It truncates the file

// Correct

// The 'w' flag opens for writing and truncates an existing file to zero length.

// 5. Does one read() call guarantee that all requested bytes are returned?

// Yes, always

// No, it may return fewer bytes

// Only when the file is JSON

// Correct

// Low-level reads may be partial. Code requiring an exact amount must continue reading until complete or EOF.