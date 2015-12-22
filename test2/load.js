function load() {

	  repo.loadAs("blob", "557db03de997c86a4a028e1ebd3a1ceb225be238", function(err, byteArray){
	    console.log(byteArray);
	  });
}