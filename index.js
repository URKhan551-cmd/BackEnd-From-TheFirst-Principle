// const fs = require("fs");
// const path = require("path");


// fs.readFile(path, callback(data, error));


// fs.readFile("./start.txt", (err, data) => {
//     if(err) throw err;

//     console.log(data);
// })
// this will give us buffer


// fs.readFile("./start.txt", 'utf8', (err, data) => {
//     if(err) throw err;

//     console.log(data);
// })  // give us the txt  from start file


// fs.readFile(path.join(__dirname,  'start.txt'), 'utf8', (err, data) => {
//     if(err) throw err;

//     console.log(data);
// })



// console.log("heeloo.."); 
// here we see the async function how it would perform
// first print hello then go back to execute the readFile fn


// fs.writeFile(path, data, callback(err)) structure
// fs.writeFile(path.join(__dirname, "luck.txt"), "hello this is my luck full of melodrama", (err) => {
//     if(err) throw err;
//     console.log("write complete::");
// })



// it will create and modify both depends on the file you provide is present it will modfy it
// fs.appendFile(path.join(__dirname, 'test.txt'), 'test has been aded', (err) => {
//     if(err) throw err;
//     console.log("test added append complete::");
// })


// fs.appendFile(path.join(__dirname, "luck.txt"), "\ni just told about unluckiest person", (err) => {
//     if(err) throw err;
//     console.log("append into existed file::");
// })

// console.log(path.join(__dirname));



// fs.writeFile(path.join(__dirname, "test.txt"), "my test has been scheduled", (err) => {
//     if(err) throw err;
//     console.log("created first completed ::");


//     fs.appendFile(path.join(__dirname, "test.txt"), "\n\nYes it is scheduled", (err) => {
//         if(err) throw err;
//         console.log("append attach to the test file :: ");

//         fs.rename(path.join(__dirname, "test.txt"), path.join(__dirname, "final.txt"), (err) => {
//             if(err) throw err;
//             console.log("we rename the text file to final completed");
//         })

//     })
    
// })  
// here i did two operaton at the same time in one flow 
// what ever change we wana do it ini the same file will do through callback fn;
// this will create callback hell in javascript to avoid this 
// we will use  Async Await 



const fsPromises = require('fs').promises;
const path = require("path");


const fileOps = async () => {
    try{
        const data = await fsPromises.readFile(path.join(__dirname, "start.txt"), "utf8");
        console.log(data);

        await fsPromises.unlink(path.join(__dirname, "luck.txt"));
         // to delete the specific file

        await fsPromises.writeFile(path.join(__dirname, "khan.txt"), data);
        await fsPromises.appendFile(path.join(__dirname, "khan.txt"), "\n\nWe will show to the world..");
        await fsPromises.rename(path.join(__dirname, "lorem.txt"), path.join(__dirname, "streamLong.txt"));
        const newData = await fsPromises.readFile(path.join(__dirname, "khan.txt"), "utf8");
        console.log(newData);

    } catch (err){
        console.error(err);
    }
} 

fileOps();

// exit on uncaught error
process.on('uncaughtException', err => {
    console.error(`There was an uncaught error: ${err}`);
    process.exit(1);
});

