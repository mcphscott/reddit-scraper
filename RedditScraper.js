//MIT license, if you really need to know.

var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var fs = require ("fs");

//Reddit-scraping class constructor
//pass in the name of the subreddit and the max number of
//images to download. The scrape method will
//downloads images and creates a single local web page
//for viewing all of the images.
module.exports = function RedditScraper ( sub_, rootImagePath_, min_, max_ ) {
  //private variables
	var sub = sub_;
	var nextUrl = 'http://www.reddit.com/r/' + sub;

	var max = max_;
	var min = min_;
	var rootPath = rootImagePath_;

	var stampedName = sub + "_" + new Date().getTime();
	var dir = rootPath + stampedName + "/";
	
	var cnt = 0;	
	var myPage = "<ul>";
	var activeDownloads = 0;


	var existingFiles = [];

	var createListOfExistingFiles = function( callback_ , thisDir ) {
		if ( thisDir == null) {
			thisDir = rootPath;
		}
		fs.readdir( thisDir , function(err, files ) {
			if ( err ) {
				console.log("Could not read images directory (" + thisDir + "):" +err);
				callback_(err);
				return;
			}
			async.each( files, function (item, item_callback) {
				console.log("dir: (" + item + "):");
				var itemPath = thisDir + "/" + item;
				fs.stat( itemPath, function ( err, stat) {
					if ( err ) {
						console.log("Could not stat image in directory (" + item + "):" +err);
						item_callback();
						return;
					}
					if ( stat.isFile() ) {
						existingFiles.push(item);
						item_callback();						
					} else if (stat.isDirectory() ) {
						createListOfExistingFiles( item_callback, itemPath );
					} else {
						item_callback();
					};
					return;
				});
			}, function (err) {
				callback_(err);
			} );
		});
	}
	
	var createDir = function( callback_ ) {
		fs.exists(dir, function (exists) {
			if (!exists) {
				fs.mkdir( dir, function ( err ) {
					if ( err ) {
						console.log("Could not create images directory (" + dir+ "):" +err);
					}
					callback_(err);
				});
			} else {
				callback_();
			};
		});
	}

	//public methods	
	this.scrape = function( callback_ ) {
		async.series([ createListOfExistingFiles, createDir, requestAllUrls, writePage]);
	}
	
	var writePage = function ( callback_ ) {
		//write the html page for local viewing
		fs.writeFile( dir + "index.html", myPage, callback_ );	
	}	
	
	//public method for requesting url's
	//recursively calls until max reached
	var requestAllUrls = function( callback_ ) {
		async.whilst( function () {return (cnt < max)}, requestUrl, function (err) {
			myPage += "</ul>";
			callback_(err);
		} );
	}
	
	var requestUrl = function( callback_ ) {
		console.log(nextUrl);
		debugger;
		
		request.get( nextUrl, function(error, res, body) {

			if ( error || res.statusCode != 200) {
				console.log(error) // Print the web page.
				callback_(error);
				return;
			}
			
			var $ = cheerio.load(body);
		
			
			var imageLinks = $("a.title").filter(function(i,el) {				
				var href = el.attribs.href;
				var fileType = href.slice ( href.lastIndexOf("."));
				return (fileType == ".gif" || fileType == ".jpg" || fileType == ".png");
			});
			
			imageLinks.each( function (i, el) {
			
				if ( cnt < min ) return;

				debugger;
				var href = el.attribs.href;
				var text = el.children[0].data;
				
				var imageName = href.substr(href.lastIndexOf('/') + 1);

				if ( existingFiles.indexOf(imageName) != -1) {
					console.log("skipping " + imageName);
					return;
				}
				
				var localImageName = imageName;
				var localImagePath = dir + localImageName;
				
				//download the image
				
				activeDownloads ++;
				console.log("downloading " + href + ", active downloads: "+ activeDownloads);
				request(href, function(error) {
					console.log("downloaded " + href +", active downloads: " + activeDownloads);
					activeDownloads --;
					if ( error || res.statusCode != 200) {
						console.log(error) // Print the web page.
					}
				}).pipe(fs.createWriteStream( localImagePath ));				
				
				myPage += "<li>"+text+"<img src=\"" + localImageName+"\"></li>";				
			});
									
			nextUrl = $("p.nextprev a[rel^='nofollow next']").attr("href");			
			
			cnt += 25;
			callback_();
		});
		
	};
}



