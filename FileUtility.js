//MIT license, if you really need to know.
var async = require('async');
var fs = require ("fs");

var deepFileListing = function( thisDir, itemFunction, callback_ ) {
		
	console.log("TOPDIR: " + thisDir );
	
	fs.readdir( thisDir , function(err, files ) {
		if ( err ) {
			console.log("Could not read images directory (" + thisDir + "):" +err);
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
					debugger;
					listRecursiveFiles( itemPath, itemFunction, item_callback );
				} else {
					item_callback();
				};
				return;
			});
		}, function (err) {
			//3rd param of async. all of the files in this directory have been recursively called
			callback_(err); 
		} );
	}); //end of readdir
};

module.exports.deepFileListing = deepFileListing;
