
Your exercises — don't skip these
Try these without looking for a ready-made solution.
Filesystem practice
0/6



[ ] 1. Create a deleteArticle(id) function.

Read articles, find the matching ID, remove it, and save the updated array.

[ ] 2. Create an updateArticle(id, updates) function.

Update only the specified article without replacing unrelated fields.

[ ] 3. Create listArticles().

Return all articles and handle a missing JSON file.

[ ] 4. Create an application logger.

Use appendFile() to record timestamps and messages in logs/application.log.

[ ] 5. Inspect file metadata.

Use stat() to find the file size, creation time, and whether the path is a file or directory.

[ ] 6. Handle corrupted JSON.

What happens when articles.json contains invalid JSON? Handle the error without silently destroying the original file.


7. What we will investigate at professional level
Before moving on, there are some important fs concepts we haven't explored yet:
1. File descriptors: How the operating system identifies an opened file.
2. File handles: How Node.js manages opened files through FileHandle.
3. Streams: How to process large files without loading everything into memory.
4. Backpressure: What happens when data is produced faster than it can be consumed.
5. Atomic writes: How to reduce the risk of partially written files.
6. Concurrency: What happens when multiple requests modify the same file.
7. Filesystem permissions: How applications interact with access restrictions.
8. Path traversal: How attackers can exploit poorly validated file paths.