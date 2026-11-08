// Lesson 3 — Filesystem concurrency

// This is where we solve a problem that atomic writes alone cannot solve:
// - Two requests modifying the same JSON file.
// - Lost updates.
// - Race conditions.
// - Sequential versus parallel filesystem operations.
// - Mutexes and write queues.
// - Why Promise.all() can be dangerous when multiple operations modify the same file.
// - When to stop using JSON files and move to a database.
// The central engineering question will be:

// How do we ensure that multiple operations cannot corrupt or silently overwrite each other's work?

// one of the most inportant in backend development because it explains a bug that xan exist even 
// when every individual operation is written correcctly.

// what hapen when multiple requests try to send and modify the same file at the same time.
// we will come to understand sync/async execution
// Race condition / lost update problem / promise.all() can be dangerous for writes.
// sequentila execution / write queues. / mutexes and locks.
// multi-process concurrency  /  when JSON file should be replace with a DAtabase.


// Imagine my app has an Endpoint:


// app.post("build-file-processor/research.txt", async (req, res) => {
//     const articles = await getResearch();

//     articles.push(req.body);

//     await saveResearch(articles);
//     res.end("Article created");
// });

// one request arrives : everything works smooth.
// now imagiine 100 users send requests at almost exact same time.
// my server can handle multiple request concurrently. each req runs async
// their operations can overlap
// JS running on one Node.js event loop does not mean Async opertions execute one at a time.

// Node.js can start Multiple I/Ooperations and resume 
// their callBacks or promises as operations complete


// i do have an array
// [
//     {"_id": 1,  "title": "Node.js"}
// ]

// Request A              Request B  
// 1: read file           1: read file 
// 2: add article A       2: add article B.
// 3: write file.         3: write file.

// posible execution order 
// A reads the original file 
// B reads the roginal file 

// A adds article A to its own array.
// B adds article B to its own array.

// A writes its array.
// B writes its array afterward, replacing A's version .

// LOST UPDATE Happens   Article A  disappers from the final file.

// this is a race condition: the result depends on timing andd ordering of operations.

const fs = require("node:fs/promises");

const pathFile = "./articles.json";

async function getArticles(){
    const content = await fs.readFile(pathFile, "utf8");
    return JSON.parse(content);
}

async function saveArticles(articles){
    await fs.writeFile(pathFile, JSON.stringify(articles, null, 2), "utf8");

}

async function createArticle(article){
    const articles = await getArticles();

    // simulate some processing time 
    await new Promise((resolve) => setTimeout(resolve, 100));

    articles.push(article);
    await saveArticles(articles);
}


async function main(){
    await Promise.all([
        createArticle({_id: 2, title: "Article A"}),
        createArticle({_id: 3, title: "Article B"}),
    ]);

    console.log(await getArticles());
}

main().catch(console.error);

// OUTPUT
// node concurrencyLearn.js
// [ { _id: 1, title: 'Node.js' }, { _id: 2, title: 'Article A' } ]


// because each req has its own JS array in memory
// both array start with same origin data. they donot automatically share changes with one another.

// DEEPER MENTAL MODEL 
// 1: The file stored on Desk
// 2: Request A js array in memory.
// 3: Request B js array in memory.
// changing one array does not change other array or file automatically
// only the subsequent write operation changes the storeed file.
// this is the foundation of understanding consurrency.

// here promise.all() starts all operation asynchronously without waiting for one to finish before starting next.
// it is usefull when operations are independent

// const [user, settings, permissions] = await Promise.all([
//   getUser(),
//   getSettings(),
//   getPermissions(),
// ]);
// If these are independent reads, parallel execution can improve performance.

// But these operations are not independent:
// Promise.all([
//   createArticle(articleA),
//   createArticle(articleB),
// ]);
// Both modify the same shared resource.
// Professional rule: Parallelize independent operations. Coordinate operations that mutate shared state.

// PROFESSIONAL RULE : parallelize independent operations.  Coordinate operations that mutate shared state.


// SIMPLEST SOLUTION 
async function main(){
    await createArticle({
        _id: 2,
        title: "Article A",
    });
    await createArticle({
        _id: 3,
        title: "Article B",
    });
    await createArticle({
        _id: 4,
        title: "Article C",
    });

    console.log( await getArticles());
};
// Create A → Read → Modify → Write → Finish
//                                       |
//                                       v
// Create B → Read → Modify → Write → Finish
//                                       |
//                                       v
// Create C → Read → Modify → Write → Finish

// now each operation reads result of previuos operation.
// this avoids the Lost Update ;

// but what if 1000 request comes into server?????
// in this situtaion we cannot put eachh HTTP request into manullay written sequence to handle.
// we need a way to automatically coordinates access to shared resources.

// here we comes into the understanding of QUEUES & MUTEXES.

// ./conQueue.js define this concepts. GO FOR IT.