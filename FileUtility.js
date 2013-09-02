//MIT license, if you really need to know.
var async = require('async');
var fs = require ("fs");

var deepFileListing = function( thisDir, itemFunction ) {
		
	return function ( callback_ ) {
		console.log("TOPDIR: " + thisDir );
		
		fs.readdir( thisDir , function(err, files ) {
			if ( err ) {
				console.log("Could not list directory (" + thisDir + "):" +err);
				callback_(err);
				return;
			}
			async.each( files, function (item, item_callback) {
				//2nd param of async called for each item
				//console.log("dir: (" + item + "):");
				var itemPath = thisDir + "/" + item;
				fs.stat( itemPath, function ( err, stat) {
					if ( err ) {
						console.log("Could not stat image in directory (" + item + "):" +err);
						item_callback();
						return;
					}
					if ( stat.isFile() ) {
						itemFunction(item);
						//existingFiles.push(item);
						item_callback();						
					} else if (stat.isDirectory() ) {
						(deepFileListing( itemPath, itemFunction))(item_callback );
					} else {
						item_callback();
					}
					return;
				});
			}, function (err) {
				//3rd param of async. all of the files in this directory have been recursively called
				callback_(err); 
			} );
		}); //end of readdir
	};
};

//returns function to create directory with callback
var createDir = function( dir ) {
	return function ( callback_ ) {
		debugger;
		console.log("creating " + dir);
		fs.exists(dir, function (exists) {
			if (!exists) {
				fs.mkdir( dir, function ( err ) {
					if ( err ) {
						console.log("Could not create directory (" + dir+ "):" +err);
					}
					callback_(err);
				});
			} else {
				console.log("directory exists (" + dir+ "):");			
				callback_();
			}
		});
	};
}

var writeFile = function ( path, contentsArray ) {
	return function (callback_) {
		//write the html page for local viewing
		fs.writeFile( path, contentsArray.join("\n"), callback_ );	
	}
};

module.exports.deepFileListing = deepFileListing;
module.exports.createDir = createDir;
module.exports.writeFile = writeFile;