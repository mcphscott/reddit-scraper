reddit-scraper
==============

Simple script I wrote to learn node.js. Scrapes images from reddit, and makes a local web page for viewing the files in a browser.
All images are downloaded asynchronously, so you can get hundreds of simultaneous downloads if you are greedy.

###To install, do something like this:

1) make an .\images directory at the same level as the css directory with the foundation stylesheet

2) scrape something like this

``` 
node scrape -r aww --pages 4 --library ./images
```
 
3) Using your browser, open the index.html file in the  images/subreddit_timestamp directory.

Note: Scraping the images creates a single web page with all of the images on it. At around 200 images (with gifs), my browser gets overloaded.

Note: Images flagged as 'over18' are skipped, i.e. hopefully not downloaded (but don't risk your job using my code.) Read the MIT license before using.

### Dependencies

node_modules is checked in for local management of dependencies, as recommended by npm community.

###License

MIT




