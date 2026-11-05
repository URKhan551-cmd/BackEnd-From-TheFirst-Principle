// how node js diferent from vanilla js 
// node runs on a server - not in a browser (backend not frontend )
// the console is in the terminal window 
console.log("hello, world!");

// global object instead of window object

// console.log(global);

// has common core modules that we will explore 
// ccommon js modules instead of ES6 modules
// Node Missing some of an API like fetch()


const os = require("os");

// console.log(os.type());
// console.log(os.version());
// console.log(os.homedir());

// console.log(__dirname);
// console.log(__filename);

const path = require("path");
// console.log(path.dirname(__filename)); // C:\Users\ACER\Desktop\NODE JS\01Output
// console.log(path.basename(__filename));  // server.js
// console.log(path.extname(__filename));  // .js

// console.log(path.parse(__filename));

// this will give us an object of all these values 
// {
//   root: 'C:\\',
//   dir: 'C:\\Users\\ACER\\Desktop\\NODE JS\\01Output',
//   base: 'server.js',
//   ext: '.js',
//   name: 'server'
// }


// const math = require("./math");

// console.log(math.add(2, 5));  // 7
// console.log(math.multiply(2, 5));  // 10
// console.log(math.subtract(2, 5));  // -3
// console.log(math.divide(2, 5));  // 0.4


// extract each or we can say destruction
const {add, subtract, multiply, divide } = require("./math");
console.log(add(2, 8));
console.log(subtract(2, 8));
console.log(multiply(2, 8));
console.log(divide(2, 8));

