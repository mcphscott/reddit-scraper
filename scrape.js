
//Setup:
//At the command line, make an images directory and css directory
//with a foundation stylesheet. Reference the image directory
// with the --library command line option.

var RedditScraper = require('./RedditScraper.js');
var FileUtility = require('./FileUtility.js');
var argv = require('optimist')
	.usage("Usage: $0 -r [subreddit]")
	.demand(['r'])
	.default('library',"./images")
	.default('pages', 4).argv;

var nItems = argv.pages * 25;

var existingFiles = [];
FileUtility.deepFileListing( argv.library + "/", function( item) {
	existingFiles.push(item);
},
function (err) {
	console.log(err);
	console.log("adding: " + existingFiles );
	//Try it with the aww subreddit, the only safe subreddit
	var scraperAww = new RedditScraper( argv.r, argv.library + "/", 0 , nItems, existingFiles);

	scraperAww.scrape( function ( err ) {
	console.log('done');
	});
	
});

