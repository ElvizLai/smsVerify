var express = require('express');
var utility = require('utility');
var superagent = require('superagent');
var cheerio = require('cheerio');

var url = require('url');
var exec = require("child_process").exec;
var eventproxy = require('eventproxy');
var bodyParser = require('body-parser');

var requestServer = require('cloud/requestServer');
var verifyServer = require('cloud/verifyServer');
var queryServer = require('cloud/queryServer');

var app = express();

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(bodyParser.json());
app.use(express.bodyParser());    // 读取请求 body 的中间件

app.get('/',function(req,res){
  res.redirect("/portal");
});

app.get('/portal',function(req,res){
	res.render("portal",{
    title:"华盖Tech_短信认证Demo",
    content:"template"
  });
});

app.get('/md5',function (req,res) {
	var q = req.query.q;
	if (!q) {
		q=new Date().getTime() + "";
	}
	var md5Value = utility.md5(q)+"";
	var jsonStr = '{"MD5":"'+md5Value+'"}';
	res.send(JSON.parse(jsonStr));
});

app.get('/fileList',function(req,res){
	exec("find .",function (error, stdout, stderr) {
		res.writeHead(200, {"Content-Type": "text/plain"});
		res.write(stdout);
		res.end();
	});
});

app.get('/query',function(req,res){
  queryServer.query(req,res);
});

//请求格式http://url/requestSMS?phone=18521358916
app.get('/requestSMS', function (req, res) {
	requestServer.sendSMS(req,res);
});

app.post('/requestSMS', function (req, res) {
	requestServer.sendSMS(req,res);
});

//请求格式http://url/verifySMS?phone=18521358916&code=123456
app.get('/verifySMS',function (req,res) {
	verifyServer.verifySMS(req,res);
});

app.post('/verifySMS', function (req, res) {
	verifyServer.verifySMS(req,res);
});

app.get('*', function(req, res){
    res.render('404', {
        title: '404 Not Found'
    });
});

app.listen();