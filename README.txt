repo.saveAs("blob", "Hello World\n", function(err, blobHash){
  console.dir(blobHash);
  repo.loadAs("blob", blobHash, function(err, byteArray){
    console.log(byteArray);// -> [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 10]
  });
});