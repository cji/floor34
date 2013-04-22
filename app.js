var express = require('express');
var app = express();
app.use(app.router);

// Turn on access logging with log4js. Output to console and file
var log4js = require('log4js');
log4js.configure({
 appenders: [
   //{ type: 'console' },
   { type: 'file', filename: '/home/bernard/floor34/access.log', category: 'access' }
  ]
});

var logger = log4js.getLogger('access');
logger.setLevel('INFO');

app.use(log4js.connectLogger(logger, { level: log4js.levels.INFO, format: ':remote-addr - ":method :url" :status' }));

// Configure static file delivery
app.use(express.static(__dirname + '/public'));

// Verbose error logs, just because
app.use(express.errorHandler({showStack: true, dumpExceptions: true}));

// Configure Jade views for most of the content
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// People love favicons. One less 404 in the logs.
app.use(express.favicon());

// Certain pages should only be available from localhost
function checkLocal(req, res, next) {
	if (req.ip != '127.0.0.1') {
		res.render('fail', {title: 'ACCESS DENIED'});
	} else {
		next();
	}
}

function logReq(req, res, next) {
	logger.info(req.ip + " - " + "\"" + req.method + " " + req.url + "\" " + res.statusCode);
	next();
}

/* "By enabling the "trust proxy" setting via app.enable('trust proxy'), Express will 
   have knowledge that it's sitting behind a proxy and that the X-Forwarded-* header 
   fields may be trusted, which otherwise may be EASYIL SPOOFED." -- OOPS :-P */
app.enable('trust proxy');

// General app routing
app.set('title', 'Silo IT Department: 34th Floor');

app.get('/', logReq, function(req, res){
	res.render('index', {title: 'Silo IT Department: 34th Floor'});
});

app.get('/admin', logReq, function(req, res){
	res.render('admin', {title: 'IT Department Forensics Administration'});
});

app.get('/generator', logReq, function(req, res){
	res.render('generator', {title: 'Generator Status'});
});

// Route the 'protected' directory. Make sure only users connecting from the server have access. 
app.get('/35', logReq, checkLocal, function(req, res){
	res.render('35', {title: 'Floor 35 Access'});
});

// 404 handler for anything else
app.use(function(req, res, next){
  res.status(404);
  res.render('404', {title: '404'});
  //Have to do this last for some reason...
  logReq();
});

// Hey! Listen! 
app.listen(8080);
logger.info('Listening on port 8080');
