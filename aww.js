
//At the command line, make an images directory before
//running. Execute the program with node, like this:
// node aww.js
var RedditScraper = require('./RedditScraper.js');
var FileUtility = require('./FileUtility.js');


var existingFiles = [];
FileUtility.deepFileListing( "./images/", function( item) {
	existingFiles.push(item);
},
function (err) {
	console.log(err);
	console.log("adding: " + existingFiles );
	//Try it with the aww subreddit, the only safe subreddit
	var scraperAww = new RedditScraper('aww', "./images/", 0 , 200, existingFiles);

	scraperAww.scrape( function ( err ) {
	console.log('done');
	});
	
});

