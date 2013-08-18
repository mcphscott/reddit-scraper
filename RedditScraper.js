//MIT license, if you really need to know.

var RedditScraper = require('./FileUtility.js');

var request = require('request');
var async = require('async');
var fs = require ("fs");

//Reddit-scraping class constructor
//pass in the name of the subreddit and the max number of
//images to download. The scrape method will
//downloads images and creates a single local web page
//for viewing all of the images.
module.exports = function RedditScraper ( sub_, rootImagePath_, min_, max_, existingFiles_ ) {
	var existingFiles = existingFiles_;
  //private variables
	var sub = sub_;
	var nextUrl = 'http://www.reddit.com/r/' + sub +'.json';

	var max = max_;
	var min = min_;
	var rootPath = rootImagePath_;

	var stampedName = sub + "_" + new Date().getTime();
	var dir = rootPath + stampedName + "/";
	
	var cnt = 0;
	//add a foundation.css to the page header
	var myPage = "<head><meta charset=\"utf-8\" />\n"+
		"<meta name=\"viewport\" content=\"width=device-width\" />\n"+
		"<title>"+sub+"</title>\n"+
		"<link rel=\"stylesheet\" href=\"../../css/foundation.css\" /></head>\n";
	var activeDownloads = 0;
	
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
			}
		});
	};

	//public methods	
	this.scrape = function( callback_ ) {
		async.series([ createDir, requestAllUrls, writePage]);
	};
	
	var writePage = function ( callback_ ) {
		//write the html page for local viewing
		fs.writeFile( dir + "index.html", myPage, callback_ );	
	};
	
	//public method for requesting url's
	//recursively calls until max reached
	var requestAllUrls = function( callback_ ) {
		async.whilst( function () {
				return (cnt < max);
			}, requestUrl,
		function (err) {
			myPage += "";
			callback_(err);
		} );
	};
	
	var requestUrl = function( callback_ ) {
		console.log(nextUrl);
		
		request.get( nextUrl, function(error, res, json) {

			if ( error || res.statusCode != 200) {
				console.log(error); // Print the web page.
				callback_(error);
				return;
			}

			var listing = JSON.parse(json);
			var children = listing.data.children;
			
			var imageLinks = children.filter( function( i ) {
				var href = i.data.url;
				console.log(href);

				var lastDotIndex = href.lastIndexOf(".");
				var fileType = href.slice ( lastDotIndex);
				return (fileType == ".gif" || fileType == ".jpg" || fileType == ".png");
			});
			
			imageLinks.forEach( function (i) {
			
				if ( cnt < min ) return;

				var href = i.data.url;
				var text = i.data.title;
				
				var imageName = href.substr(href.lastIndexOf('/') + 1);

				if (i.data.over_18) {
					console.log("skipping over 18 images!");
					return;
				}
				
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
						console.log(error); // Print the web page.
					}
				}).pipe(fs.createWriteStream( localImagePath ));				
				
				myPage += "<div class=\"row\"><div class=\"large-12 columns\">";
				myPage += text+"<img src=\"" + localImageName+"\"></div></div>";				
			});
								
			var after = listing.data.after;
			//nextUrl = $("p.nextprev a[rel^='nofollow next']").attr("href");			
			nextUrl = 'http://www.reddit.com/r/' + sub +'.json?after='+after;
				
			cnt += 25;
			callback_();
		});
		
	};
};



