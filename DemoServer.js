//var fs = require('fs');
//var https = require('https');
var http = require('http');
var express = require('express');
var AgoraSignGenerator = require('./lib/AgoraSignGenerator');

var PORT = 8888;

// Fill the vendorkey and sign key given by Agora.io
var VENDOR_KEY = "d767a2002f2341c2bcab2eb6773f8970";
var SIGN_KEY = "2cb60be28b74464db9d46ec8d3f2cd47";

//var private_key = fs.readFileSync(__dirname + '/../../cert/xxx.com.key');
//var certificate = fs.readFileSync(__dirname + '/../../cert/xxx.com.crt');
//var credentials = {key: private_key, cert: certificate, passphrase: "password"};

var app = express();
app.disable('x-powered-by');
app.set('port', PORT);
app.use(express.favicon());
app.use(app.router);
app.use('/', express.static('public'));
var generateDynamicKey = function(req, resp){
    var channelName = req.query.channelName;
    if (!channelName){
        return resp.status(400).json({'error':'channel name is required'}).send();
    }

    var ts = Math.round(new Date().getTime() / 1000);
    var rnd =Math.round(Math.random()*100000000);
    var key = AgoraSignGenerator.generateDynamicKey(VENDOR_KEY, SIGN_KEY, channelName, ts, rnd);

    resp.header("Access-Control-Allow-Origin", "*")
    //resp.header("Access-Control-Allow-Origin", "http://ip:port")
    return resp.json({'key': key}).send();
};

app.get('/dynamic_key', generateDynamicKey);

var server = http.createServer(app);
var io = require('socket.io')(server);
server.listen(app.get('port'), function() {
    console.log('AgoraSignServer starts at ' + app.get('port'));
});
io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

//https.createServer(credentials, app).listen(app.get('port') + 1, function() {
//    console.log('AgoraSignServer starts at ' + (app.get('port') + 1));
//});
