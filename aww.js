
//At the command line, make an images directory before
//running. Execute the program with node, like this:
// node r_scrape.js
var RedditScraper = require('./RedditScraper.js');

//Try it with the aww subreddit, the only safe subreddit
var scraperAww = new RedditScraper('aww', "./images/", 0 , 200 );

scraperAww.scrape( function ( err ) {
	console.log('done');
});