function fileCommit() {

	var element_file = document.getElementById("input_02_file");
	var element_msg = document.getElementById("commit_msg").value || "No input commit message.";
	var element_author = document.getElementById("commit_author").value || "tester";
	var element_email = document.getElementById("commit_email").value || "temp@xxx.com";

	// ------------------------------------------------------------
	// サポート状況
	// ------------------------------------------------------------
	if(!window.File){
		alert("File クラスに対応していません。");
		return;
	}
	if(!window.FileReader){
		alert("FileReader クラスに対応していません。");
		return;
	}

	// ファイルが選択されたか
	if(!(element_file.value)) return;

	// ファイルリストを取得
	var fileList = element_file.files;
	if(!fileList) return;

	readFiles(fileList);

	setTimeout(function()
	{
		alert("コミット完了　ページを更新します");
		window.location.reload();
	}, 3000);
	/**
	** ファイルを読み込みLocalStorageにコミットする
	** tree情報とblob情報をファイルごとに作成する
	**
	**/
	function readFiles(fileList)
	{
		var trees =[]; // 今回生成されるtreeHashをすべて持たせる
		var commitFiles = [];
		var len = fileList.length;	// 選択されたファイル数
		console.log(len);
		for(var k = 0; k < len; k++)
		{
			// for文の中でコールバック処理を入れる場合処理を無名関数にするなど工夫が必要
			(function(n)
			{
			    setTimeout(function()
			    {
					var file = fileList[n];
					if(!file) return;
					// FileReader オブジェクトを生成
					var file_reader = new FileReader();

					file_reader.addEventListener("load",function(e)
					{
						var fileResult = file_reader.result;	// ファイルコンテンツ
						var fileName = file.name;				// ファイル名

						// 最新コミットHash設定用
						commitFiles.push(fileName);

						if(file.type.indexOf("image") == 0
						|| file.type.indexOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") == 0
						|| file.type.indexOf("application/pdf") == 0)
						{
							fileResult = Base64.btoa(fileResult);
						} else {
							fileResult = Base64.encode(fileResult);
						}

						// treeオブジェクトとblobHashの発行
						repo.saveAs("blob", fileResult, function(err, blobHash)
						{
							// blobを保存（テキストデータはBase64に変換）
							localStorage.setItem(blobHash, fileResult);
							// ファイル名:blobを保存
							localStorage.setItem(fileName, blobHash);

							// 今回コミット分のファイル名をすべて保存
							var repoFiles = store.get("__repoFiles") || [];
							if (repoFiles.indexOf(fileName) < 0) {
								repoFiles.push(fileName);
								store.set("__repoFiles", repoFiles);
							}

							//TODO modeは自動で判別させる
							repo.saveAs("tree",
							hash(fileName, { mode: modes.file, hash: blobHash}),
							function (err, treeHash)
							{
								// treeHashを保存
								repo.loadAs("tree", treeHash, function(err, treeObject)
								{
									store.set(treeHash, treeObject);
									trees.push(treeHash);
									store.set("__trees", trees);
								});
							});
						});

					});

					if(file.type.indexOf("image") == 0
					|| file.type.indexOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") == 0
					|| file.type.indexOf("application/pdf") == 0)
					{
						console.log("image");
						// 読み込みを開始する
						file_reader.readAsBinaryString(file);
					} else if(file.type.indexOf("text") == 0 || file.type == ("application/javascript")) {
						console.log("text");
						// ファイルの読込を開始する
						file_reader.readAsText(file);
					} else {
						console.log("text");
						// TODO サポートされていないファイルは弾くかテキストとして読み込む
						file_reader.readAsText(file);
					}
				}, 1000);
			})(k);
		} // for

		// treeとblob情報の生成が終わるまで処理開始を待つ
		console.log("Create start commitInfo.");
	    setTimeout(function()
	    {
			treesObj = localStorage.getItem("__trees") || [];
			
			// コミット情報の作成
		    repo.saveAs("commit",
		    {
				author:
				{
					name: element_author,
					email: element_email
				},
				tree: treesObj,
				message: element_msg
			}, function(err, commitHash)
			{
				// commitHashを保存
				repo.loadAs("commit", commitHash, function(err, commitObject)
				{
					// コミットツリーの生成
					var commitTree = store.get("__commitTree") || [];
					commitTree.push(commitHash);
					store.set("__commitTree", commitTree);

					// 親コミットを登録する
					commitObject.parents.push(store.get("__refs/heads/master"));

					// コミット情報をJSON形式でストレージへ保存
					store.set(commitHash, commitObject);

					// 前回コミットハッシュを保存する（Resetなどで使用）
					localStorage.setItem("__beforeCommit", localStorage.getItem("__refs/heads/master"));

					// 最新コミットハッシュを保存する
					localStorage.setItem("__refs/heads/master", commitHash);
					
					// ファイルの最終コミットを保存する
					for(var i = 0; i < len; i++)
					{
						var commitfileName = commitFiles[i];
						var blobHash = localStorage.getItem(commitfileName);
						
					}
					console.log(commitFiles);

				}); //END: repo.loadAs("commit")
			});
			console.log("Create end commitInfo.");
		}, 2000);
	}

	// オブジェクトのキーに変数を指定する関数
	function hash(key, value)
	{
	  var h = {};
	  h[key] = value;
	  return h;
	}
}