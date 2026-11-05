Starter file — add your code here
const fsPromises = require("fs").promises;
console.log(fs);


const data = fs.readFileSync("assets/poem.txt", {encoding: "utf8"});
console.log(data);

async function main(){
    const data = await fsPromises.readFile("assets/poem.txt", {encoding: "utf8"} );
    console.log(data);
}

main();
const fs = require("fs");
fs.writeFileSync("assets/output.txt", "Hello, freeCodeCamp!");


fs.appendFileSync("assets/output.txt", "\nhere we implement");

const exists = fs.existsSync("assets/output.txt");
console.log(exists);

const entries = fs.readdirSync("assets");
console.log(entries);


const buf = Buffer.from("Hello, Node!");
console.log(buf);
console.log(buf.toString("hex"));
console.log(buf.toString("base64"));


const buff = Buffer.alloc(8, 0xff);
console.log(buff);

const decode = Buffer.from("ZnJlZUNvZGVDYW1w", "base64").toString("utf8");
console.log(decode);


 const crypto = require("crypto");
const hashed = crypto.createHash("sha256").update("freeCodeCamp!").digest("hex");
console.log(hashed);

const random = crypto.randomBytes(16).toString("hex");
console.log(random);
// 

const id = crypto.randomUUID();
console.log(id);

const os = require("os");

const platform = os.platform();
const arch = os.arch();
const hostname = os.hostname();
console.log(platform);
console.log(arch);
console.log(hostname);

const total = os.totalmem();
const freetoUse = os.freemem();
const uptime = os.uptime();
console.log(total);
console.log(freetoUse);
console.log(uptime);


console.log(os.cpus().length);

const path = require("path");
const filePath = path.join("__dirname", "assets", "poem.txt");
console.log(filePath);

console.log(path.basename(filePath));
console.log(path.dirname(filePath));
console.log(path.extname(filePath));

console.log(path.join("assets", "..", "server.js"));
console.log(path.resolve("assets", "..", "server.js"));

const parsed = path.parse(filePath);
console.log(parsed);


console.log(process.version);
console.log(process.platform);
console.log(process.env.NODE_ENV);


console.log(process.argv);

console.log(process.stdout.write("Hello from stdout\n"));
console.log(process.stderr.write("Hello from stderr\n"));



const readable = fs.createReadStream("assets/poem.txt", {encoding: "utf8"});
readable.on("data", (chunk) => {
    console.log(chunk);
});

readable.on("end", () => {
    console.log("Done reading");
})


const writable = fs.createWriteStream("assets/stream-output.txt");
writable.write("here we are\n");
writable.write("to change the intuition of an aui\n");
writable.end();

readable.pipe(writable);

