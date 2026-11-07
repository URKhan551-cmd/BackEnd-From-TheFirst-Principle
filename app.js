const fsPromises = require("node:fs/promises");
const path = require("path");

const pathFile = "./build-file-processor/research.txt";

async function getResearch(){
    try{
        const data = await fsPromises.readFile(pathFile, "utf8");
        return JSON.parse(data);
    } catch(err){
        if(err.code === "ENOENT"){
            return [];
        }
        throw err;
    }
}

async function writeResearch(title, content){
    
        const articles = await getResearch();
        const article = {
            id: Date.now(),
            title: title,
            content: content,
            createdAt: new Date().toISOString()
        };
    
        articles.push(article);

        await fsPromises.writeFile(pathFile, JSON.stringify(articles), "utf8");

        return article;
}

async function main(){
    try{
        await fsPromises.mkdir("./dataHolder", {recursive: true});

        const article = await writeResearch("Understanding Node", "Learning fs module 1:");
        console.log("Article created ", article);

        const articles = await getResearch();
        console.log("All articles Research :", articles);
    } catch(err){
        console.error("Application error: ", err);
    }
}

main();
// the main call has been calling writeResearch() also and getResesarch;



// delete article from articles
// deletion  here mean create new arr witout selected article, then persisit that array 
async function deleteResearch(id){
    try { 
       const articles = await getResearch();
       const found = articles.filter((article) => {
          article._id !== id;        
       });

       if(found.length === articles.length){
          return false;
       }

        await fsPrmoises.writeFile(pathFile, JSON.stringify(found, null, 2), "utf8");
     return true;


    } catch (err){
        throw err;
    }
};


// updateResearch 
// here we are preserving original _id if someone accidentally includes another _id in updates
async function updateResearch(id, update){
    try {
    const articles = await getResearch();
    const index = articles.findIndex(article => {
        article._id === id;
    });

    if(index === -1){
        return false;
    }

    const updateArticle = {
      ...articles[index],
      ...update,
      _id: articles[index]._id
    };

    articles[index] = updateArticle;

    await fsPromises.writeFile(pathFile, JSON.stringify(articles, null, 2), "utf8");
    return true;
    } catch (err){
    throw err;
    }
};


// retiurn all research with missing JSON file
async function withoutJson(){
    try {
     const content = await fsPromises.readFile(pathFile, "utf8");

     return JSON.parse(content);
    } catch(err){
    if(err.code === "ENOENT"){
      return [];
    }

    throw err;
    }
};


// build an application logger
// imagine my backend receives these requests
// GET/articles
// POST/articles
// DELETE/articles/2


// we want to record when thses events happen
// records what happens inside your application.
// application started / user registration / databases connection failed / article created / unexpected error occured.

const logDirectory = path.join(__dirname, "./logs");
const logFile = path.join(logDirectory, "application.log");

const logLevels = ["info", "warn", "error", "debug"];

async function recordLogger(message, {level = "info", context = {}} = {}){
   // validate msg
   if(typeof message !== "string" || message.trim() === ""){
     throw new TypeError("Log mesage must  be a non-empty string.");
   }

   // validate log level.
   if(!logLevel.includes(level)){
    throw new TypeError(`Invalid log Level: ${level}`);
   }

   // validate content
   if(context === null || typeof context !== "object" || Array.isArray(context)){
    throw new TypeError("Log context must be an object.");
   }

   const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
   };

   // convert the log entry to one JSONline.
   const logLine = `${JSON.stringify(logEntry)}\n`;

   // ensure the logs directiry exists.
   await fsPromises.mkdir(logDirectory, {recursive: true, mode: 0o700,});

   // append instead of replacing existing logs.
   await fsPromises.appendFile(logFile, logLine, {
    encoding: "utf8",
    mode: 0o600,
    flag: "a",
});

}
// how to use this
//async function main(){
// await recordLogger("application started");  
// await recordLoger("article created", {
// level: "info",
// context: {
//   articleId: 101,
//   author: "umair",
//  },
// });
//
//  await recordLogger("Database connection failed", {
//   level: "error",
//   context: {
//    database: "MongoDB",
//    retryAttempt: 3,
//    },
// });
//
// }
//   main().catch(console.error);



// FILE METADATA 
// sometimes we need to know about the file without reading its contents.
// how large file is? / when it was created ? / when was it modified ? 
// / is it regular file or dir ? / what are its permission
async function inspectFile(pathFile){
    if(typeof pathFile !== "string" || pathFile.trim() === ""){
        throw new TypeError("A valid file path is required.");
    }

    try {
        const stats = await fsPromises.stat(pathFile);

        return {
            path: path.resolve(pathFile);,
            type: stats.isFile() ? "file" : stats.isDirectory() ? "directory" : "other",
            sizeBytes: stats.size,
            createdAt: stats.birthtime.toISOString(),
            modifiedAt: stats.mtime.toISOString(),
            accessedAt: stats.attime.toISOString(),
            permission: (stats.mode & 0o700).toString(8).padStart(3, '0'),
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory(),
        };
    } catch(error){
        if(error.code === "ENOENT"){
            throw new Error(`Cannot inspect file: ${pathFile} does not exist.`, {cause: error});
        }

        throw error;
    }

};
// test this in main func
// async function main(){
//     const metaData = await inspectFile(pathFile);
//     console.log(metaData);
// }
// main().catch(console.error);




// corrupted JSON Handling
// never overwrite a file just because  reading or parsing it failed.
// contain invalid JSON, preserve it and report 
async function readResearchSafely(){
    let content;

    // step 1 read original fil.
    // readFile()  Missing file, permission denied, disk error
    try {
        content = await fsPromises.readFile(pathFile, "utf8");

    } catch (err){
        if(err.code === "ENOENT"){
            return [];
        }

        throw err;
    }

    // step 2: parse the json seperately.
    // check parse() Invalid JSON syntax
    let articles;
    try{
        articles = JSON.parse(content);
    } catch (err){
        if(err instanceof SyntaxError){
            throw new Error(`Invalid JSON in articles file: ${pathFile}`, {cause: err});
        }

        throw err;
    }

    // step 3: Validate the expected data structure.
    // valid JSON, but unexpected data structure.
    if(!Array.isArray(articles)){
        throw new TypeError("Inavlid articles data: expeceted a JSON array.");
    }

    return articles;
};


/* async function main(){
try {
  const articles  = await readResearchSafely();
  console.log(articles);
} catch (error){
 console.error(error.message);
 console.error("Original error:", error.cause?.message); 
}
}

main();
*/

