
//Setup:
//At the command line, make an images directory and css directory
//with a foundation stylesheet. Reference the image directory
// with the --library command line option.

var RedditScraper = require('./RedditScraper.js');
var FileUtility = require('./FileUtility.js');
var async = require('async');
var argv = require('optimist')
	.usage("Usage: $0 -r [subreddit]")
	.demand(['r'])
	.default('library',"./images")
	.default('pages', 4).argv;

var sub = argv.r;
var nItems = argv.pages * 25;

var existingFiles = [];

var rootPath = argv.library + '/';
var stampedName = sub + "_" + new Date().getTime();
var dir = rootPath + stampedName + "/";

//add a foundation.css to the page header
var myPage = ["<head><meta charset=\"utf-8\" />",
		"<meta name=\"viewport\" content=\"width=device-width\" />",
		"<title>"+sub+"</title>",
		"<link rel=\"stylesheet\" href=\"../../css/foundation.min.css\" /></head>"];

var imageCallback = function ( localImageName, text ) {
	myPage.push("<div class=\"row\"><div class=\"large-12 columns\">");
	myPage.push( text );
	myPage.push("<img src=\"" + localImageName+"\"></div></div>");				
}

//this is the filter for image items
var filter = function( i ) {
	var href = i.data.url;
	var text = i.data.title;			
	
	var lastDotIndex = href.lastIndexOf(".");
	var fileType = href.slice ( lastDotIndex);
	if (fileType != ".gif" && fileType != ".jpg" && fileType != ".png") return false;

	if ( i.data.over_18 ) return false;
	
	var imageName = href.substr(href.lastIndexOf('/') + 1);
	if ( existingFiles.indexOf(imageName) != -1) return false;
	
	return true;
}

//generate function that intercepts functions that return true/false and logs the value
var booleanLogger = function ( fun, trueLog, falseLog ) {
	return function ( i ) {
		var result = fun(i);
		if (result) {
			trueLog(i);
		} else {
			falseLog(i);		
		}
		return result;
	}
}

var imageFilter = booleanLogger(filter,function(i) {console.log("found "+ i.data.url);}, function(i) {console.log("skipping "+ i.data.url);});
var createDirFun = FileUtility.createDir( dir );
var scraperFun = RedditScraper.scraperGen( sub, dir, nItems, imageFilter, imageCallback);
var writeLocalPageFun = FileUtility.writeFile ( dir + "index.html", myPage );

FileUtility.deepFileListing( argv.library + "/", function( item) {
	existingFiles.push(item);
},
function (err) {
	async.series( [createDirFun, scraperFun, writeLocalPageFun] );	
});

