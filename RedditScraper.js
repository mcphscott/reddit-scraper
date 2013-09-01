//MIT license, if you really need to know.

var RedditScraper = require('./FileUtility.js');

var request = require('request');
var async = require('async');
var fs = require ("fs");

//Reddit-scraping higher order function, returns
// function for scraping in format which can be used with async commands.
//pass in the name of the subreddit and the max number of
//images to download. The scrape method will
//downloads images and creates a single local web page
//for viewing all of the images.
module.exports.scraperGen = function ( sub, dir, max, filter, imageCallback ) {
	var cnt = 0;

	//public method for requesting url's
	//recursively calls until max reached
	return function( callback_ ) {
		var requestUrlFun = requestUrlGen ( sub, dir, max, filter, imageCallback );
		async.whilst( function () {
				cnt += 25;
				return (cnt < max);
			}, requestUrlFun,
			function (err) {
				callback_(err);
			}
		);
	};
};
	
var requestUrlGen = function ( sub, dir, max, filter, imageCallback) {
	var nextUrl = 'http://www.reddit.com/r/' + sub +'.json';
	var activeDownloads = 0;
 
	return function( callback_ ) {
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
				return filter( i );
			});
			
			imageLinks.forEach( function (i) {
				var href = i.data.url;
				var text = i.data.title;
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
						console.log(error); // Print the web page.
					}
				}).pipe(fs.createWriteStream( localImagePath ));				
				
				imageCallback(localImageName, text);
			});
								
			var after = listing.data.after;
			//nextUrl = $("p.nextprev a[rel^='nofollow next']").attr("href");			
			nextUrl = 'http://www.reddit.com/r/' + sub +'.json?after='+after;
				
			callback_();
		});
		
	};
};

