// A write queue ensure that only one operation at a time performs 
// read--modify--write transaction through queue

// Request A--------Request B--------Request C 
        //    write Queue: controls the order of operations.
// request A running     ------ request B waiting  ------- request C waiting


// STEP 1: craete a queue.
let writeQueue = Promise.resolve();
function runExclusive(operation){
    const result = writeQueue.then(operation);

    //keep the queue usable even if this operation fails.
    writeQueue = result.catch(() => {});

    //Return the original result so the caller sees its error.
    return result;
}

// STEP B:  use the Queue for article creation
async function createArticle(article){
    return runExclusive(async () => {
       const articles = await getArticles();

       articles.push(article);
        
       await atomicWriteFile(pathFile, JSON.stringify(articles, null, 2));

       return article;
    });
}


// UPDATE ARTICLES
async function updateArticle(id, updates){
    return runExclusive(async () => {
        const articles = await getArticles();

        const index = articles.findIndex(article => article._id === id);

        if(index === -1){
            return false;
        }

        articles[index] = {
            ...articles[index],
            ...updates,
            _id: articles[index]._id,
        };


        await atomicWriteFile(pathFile, JSON.stringify(articles, null, 2));

        return true;
    });
}

// the same pattern applies to deletion also.


// STEP C : test it 
async function main(){
    const result = await Promise.all([
        createArticle({_id: 2, title: "Article A"}),
        createArticle({_id: 3, title: "Article B"}),
        createArticle({_id: 4, title: "Article C"}),
    ]);

    console.log("Created: ", results);
    console.log("Final articles:", await getArticles());
}

main().catch(console.error);
// we still use Promise.all() why is it safe here?
// each call enters into queue. the req can arrive concurrently.
// but the actual modifications are serialized.
// the order is the order in which the operations are added to the queue.
// do not assume that order necessarily matches the order inwhich client originally send req across network.



// IS THIS A MUTEX ?
// conceptually yep: this queue provides mutua; exclusion for operation that use it.
// A MUTEX mean mutual exclusion.

// it ensure that only one participating operation can enter a protected critical section at a time.
// A critical section is the part of our program that accesses shared mutable state.

const articles = await getArticles();
articles.push(article);
await atomicWriteFile(pathFile, JSON.stringify(articles));

// that entire sequence is CRITICAL SEQUENCE.

// Acquire queue position
//        ↓
// Read current file
//        ↓
// Modify current data
//        ↓
// Write updated data
//        ↓
// Release queue position


// Imagine a room with one key.
// - Request A takes the key.
// - Request B waits.
// - Request C waits.
// - Request A finishes and releases the key.
// - Request B takes the key.
// - Request B finishes and releases the key.
// - Request C takes the key.
 // This is one of the most important details in concurrency control.

// THe biggest limitation this queue only protect one process
// our Queue is 
// let writeQueue = Promise.resolve();
// where does this variable live ?  => inside the memory of one Node.js process


// 1 application  =   3 node.js process
// Process A -------  Process B ------- Process C
// queue A   -------   queue B  ------- queue C 
// ownMemory -------- own Memory ------ own Memory

// (-- shared articles.json --)  all three process can access this file 

// process A doesnot know that process B and process B doesnot knwo about the process C has been writing
// therefore our in memory queue does not provide cross-process-protection

// This also matters when you use:
// - Node.js cluster.
// - Worker processes that each maintain their own file-storage logic.
// - Multiple containers.
// - Multiple application servers.
// - Serverless function instances.
// What are the solutions?
// There are several approaches, depending on the application.
// Approach	What it protects
// In-memory queue	Operations in one process
// In-process mutex	Critical sections in one process
// OS-level file lock	Cooperating processes accessing a shared file
// Distributed lock	Cooperating application instances
// Database transaction	Coordinated database changes

// Node's built-in fs/promises API does not itself provide a general-purpose cross-process file-locking abstraction. Engineers use platform-specific facilities or carefully selected locking libraries when file locking is necessary.

// For a real multi-instance backend, a database is usually the better solution.

// *** is my Promise queue a mutex ?
// it implements a similar mutual-exclusion gurantee, but technically
// it is a Promise-based serial execution queue

// ** MUTEX acquire and releasease ownership of a lock
// ** Promise Queue: chain operations so each waits for its predecessor.

// Promise.all() does not impose Serialization my queue does
// Promise.all() simply waits foe all the returned promises to settle succesfully (or rejects as soon as oone rejects.).


// Concept check
// 4/4 answered

// 1. What does Promise.resolve() provide when initializing writeQueue?

// A lock that blocks other requests

// An already-fulfilled Promise to start the chain

// A Promise that reads the JSON file

// Correct

// It creates an already-fulfilled Promise, giving the first operation a completed starting point.



// 2. Request A is still writing. Request B calls writeQueue.then(operationB). What happens?

// B executes immediately

// B is discarded

// B waits for the Promise representing A to fulfill

// Correct

// B's callback depends on the previous queue Promise. It cannot execute before that Promise fulfills.



// 3. Why do we assign result.catch(() => {}) back to writeQueue?

// To retry failed operations automatically

// To recover the queue so later operations can execute

// To hide errors from the original caller

// Correct

// The recovered Promise keeps the queue chain fulfilled after failure, while the original result still exposes the rejection.



// 4. Why can Promise.all() safely submit three createArticle calls?

// Promise.all() automatically locks the file

// Node.js executes all filesystem operations synchronously

// Each operation is independently chained to the write queue

// Correct

// Promise.all submits the calls, while the queue serializes their critical sections.

