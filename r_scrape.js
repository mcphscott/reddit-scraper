//MIT license, if you really need to know.

var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var fs = require ("fs");

//At the command line, make an images directory before
//running. Execute the program with node, like this:
// node r_scrape.js

//Try it with the aww subreddit, the only safe subreddit
var scraperAww = new RedditScraper('aww', 200 );
scraperAww.scrape( function ( err ) {
	console.log('done');
});

//Reddit-scraping class constructor
//pass in the name of the subreddit and the max number of
//images to download. The scrape method will
//downloads images and creates a single local web page
//for viewing all of the images.
function RedditScraper ( sub_, max_ ) {
  //private variables
	var sub = sub_;
	var nextUrl = 'http://www.reddit.com/r/' + sub;
	var cnt = 0;
	var max = max_;
	var myPage = "<ul>";
	var activeDownloads = 0;
	
	var stampedName = sub + "_" + new Date().getTime();
	var dir = "images/" + stampedName + "/";
	

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
		async.series([ createDir, requestAllUrls, writePage]);
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
				debugger;
				var href = el.attribs.href;
				var text = el.children[0].data;
				
				var imageName = href.substr(href.lastIndexOf('/') + 1);
				
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



