// This provides symbolic names for the octal modes used by git trees.
window.modes = require('./lib/modes');

// Create a repo by creating a plain object.
window.repo = {};

// This provides an in-memory storage backend that provides the following APIs:
// - saveAs(type, value) => hash
// - loadAs(type, hash) => hash
// - saveRaw(hash, binary) =>
// - loadRaw(hash) => binary
require('./mixins/mem-db')(repo);

// This adds a high-level API for creating multiple git objects by path.
// - createTree(entries) => hash
require('./mixins/create-tree')(repo);

// This provides extra methods for dealing with packfile streams.
// It depends on
// - unpack(packStream, opts) => hashes
// - pack(hashes, opts) => packStream
require('./mixins/pack-ops')(repo);

// This adds in walker algorithms for quickly walking history or a tree.
// - logWalk(ref|hash) => stream<commit>
// - treeWalk(hash) => stream<object>
require('./mixins/walkers')(repo);

// This combines parallel requests for the same resource for effeciency under load.
require('./mixins/read-combiner')(repo);

// This makes the object interface less strict.  See it's docs for details
require('./mixins/formats')(repo);