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

