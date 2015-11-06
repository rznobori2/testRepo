function commit() {
  // First we create a blob from a string.  The `formats` mixin allows us to
  // use a string directly instead of having to pass in a binary buffer.
  repo.saveAs("blob", "Hello World\n", function(err, blobHash){
    console.log(err, "blobHash: " + blobHash);
  
    // Now we create a tree that is a folder containing the blob as `greeting.txt`
    repo.saveAs("tree", {
      "greeting.txt": { mode: modes.file, hash: blobHash }
    }, function(err, treeHash){
      console.log(err, "treeHash: " + treeHash);
  
      // With that tree, we can create a commit.
      // Again the `formats` mixin allows us to omit details like committer, date,
      // and parents.  It assumes sane defaults for these.
      repo.saveAs("commit", {
        author: {
          name: "rznobori",
          email: "sp398ga9@yahoo.co.jp"
        },
        tree: treeHash,
        message: "Test commit\n"
      }, function(err, commitHash){
        console.log(err, "commitHash: " + commitHash);
        console.log(err, repo);
      });
    });
  });
}