const fsPro = require("node:fs/promises");

const path = require("node:path");
const { randomUUID } = require("node:crypto");

const pathFile = "./build-file-processor/research.txt";



// call this func with two parameters then see what hapen
export async function atomicWrite(Path, data){
   const directory = path.dirname("path");
   const filename = path.basename("path");

   // generate a unique temporary file.

   const tempPath = path.join(directory, `.${filename}.${randomUUID()}.tmp`);
   
   // directory is same filename becomes unique id with tmp extesion
//    Why not simply use:  const tempPath = `${filePath}.tmp`;
// Imagine two requests arrive simultaneously.
// Both try to create:
// articles.json.tmp
// They can interfere with each other.
// using UUID give us each operation is its own temp filename.

console.log("tempPath has been created...")
   let fileHandle;

   try {
    // 1 open a new temp file exclusively
    fileHandle = await fsPro.open(tempPath, "wx", 0o600);
// "wx"   where w=open for writing  &  x= fail if the file already exists. prevent from overwriting and opening existing temp file.
// 0o600 is a permission request read/write access only owner when creating file.

console.log("fileHandle open success...")
    // 2: write the complete content
    await fileHandle.writeFile(data, "utf8");
// Notice we are not using fs.writeFile instead we used fileHandle.
// give us control over the opened file and allow us to call sync() before closing.

console.log("writeFile success")

    // 3: request thet file data is flushed to storage
    await fileHandle.sync();
// writing does not mean the data reach to persistant storage properly.
// OS and storage system may cache writes.
// sync() request files data and metaData be sync to the underlynig storage.
// improve durability, although it cannot gurantee protection againt hardware, filesystem devices failure.

console.log("sync succes...")
    // 4: close the temp file.
    await fileHandle.close();
    fileHandle = undefined;
// before renaming useful for portability and avoid keeping unnecessary open handle.

console.log("close file properly success/...")
    // 5: replace the destination with temp file.
    await fsPro.rename(tempPath, pathFile);
    // this is the point where new file becomes visible at destination path.

   } catch (error){
    // close the file handle if it is still open 
    if(fileHandle){
        await fileHandle.close().catch(() => {});
    }

    // remove the temp file if it still exists.
    await fsPro.unlink(tempPath).catch((cleanupError) => {
        if(cleanupError.code !== "ENOENT"){
            error.cleanupError = cleanupError;
        }
    });

    throw error;
   }
};



// USE
let articles = [
    {
        name: "umair",
        designation: "principal Engineer",
        at: "Antropical"
    }
]
// await atomicWrite(pathFile, JSON.stringify(articles, null, 2));



// TO SAVE THE FILE 
async function saveResearch(articles){
    if(!Array.isArray(articles)){
        throw new TypeError("Articles must be an array.");
    }

    const content = JSON.stringify(articles, null, 2);

    await atomicWrite(pathFile, content);
};

saveResearch(articles);
// now we have reusable storage helper that can be used by both
// deleteResearch()  and  updateResearch();;

// IMPORTANT 
// Atomicity versus durability — an important professional distinction
// These two concepts are related, but they are not identical.
// Concept	Meaning
// Atomicity	Readers see the old or new version, not a partial replacement.
// Durability	Once an operation is reported successful, the data should survive a crash or power loss.
// Our implementation improves both, but it does not provide an absolute durability guarantee.
// For stronger crash-durability guarantees on POSIX systems, engineers may also synchronize the parent directory after the rename. This helps persist the directory entry change itself. The exact guarantees and implementation vary by operating system and filesystem.
// Also, atomic rename does not prevent two requests from overwriting each other's changes.
// That is a separate problem called concurrency, which is our third lesson.

// Engineer's mental model
// Keep these five ideas separate:
// Problem	Engineering solution
// Partially written file	Atomic replacement
// Open resource not released	File handle lifecycle
// Multiple writers conflict	Concurrency control
// Large file consumes too much memory	Streams
// Fast producer overwhelms slow consumer	Backpress
