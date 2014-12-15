var AV = require('avoscloud-sdk').AV;

var fixedTime = 600;//发送短信的最小间隔、单位秒

exports.sendSMS = function sendSMS(req,res){
	if (req.query.phoneNumber) {
		send(req.query.phoneNumber,res);
		return;
	}

	if (req.body.phoneNumber) {
		send(req.body.phoneNumber,res);
	}else{
		var body='',jsonStr;

		req.on('data',function(chunk){
			body+=chunk;
		});

		req.on('end',function(){
			try{
				jsonStr = JSON.parse(body);
				send(jsonStr.phoneNumber,res);
			}catch(err){
				jsonStr='{"code":1,"msg":"JSON Error!"}';
				res.send(JSON.parse(jsonStr));
			}
		});
	}
};

function send(phone,res){

	if (!checkPhone(phone)) {
		var jsonStr ='{"code":1, "msg":"手机号码不正确!"}';
		res.send(JSON.parse(jsonStr));
		return;
	}

	AV.initialize("4wf4fj74qlb0ysgnnlvx1flraz2ht0qgldzcx4d7xpbpevsc", "m8oexnwyn6644w3hwgfdxojg7xtyvio1j4oe8e8wzwm30do7");
	var PhoneInfo = AV.Object.extend("PhoneInfo");
	var query = new AV.Query(PhoneInfo);
	query.equalTo("phoneNum", phone+"");
	query.find({
		success: function(results) {
			if (results.length==0) {
				addToDB(phone+"");
				sendMsg(null,phone);
				var jsonStr ='{"code":0, "msg":"短信发送成功!"}';
				res.send(JSON.parse(jsonStr));
			}else{
			var timeDiff = (parseInt(new Date().getTime())-parseInt(results[0].updatedAt.getTime()))/1000;//相差的秒数
			//满足时间要求，则发送短信，并增加使用的次数1
			if (timeDiff>=fixedTime) {
				sendMsg(results[0],phone);
				var jsonStr ='{"code":0, "msg":"短信发送成功!"}';
				res.send(JSON.parse(jsonStr));
			}else{
				var need = fixedTime-timeDiff;
				var jsonStr = '{"code":1, "msg":'+Math.ceil(need)+'}';
				res.send(JSON.parse(jsonStr));
			}
		}
	},
	error: function(error) {
		res.send(error);
	}
});
}

function checkPhone(num) {
	if (!(/^0?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/.test(num))) {
		return false;
	}
	return true;
}

function addToDB(num) {
	var PhoneInfo = AV.Object.extend("PhoneInfo");
	var phoneInfo = new PhoneInfo();
	phoneInfo.set("phoneNum", num);
	phoneInfo.save(null, {
		success: function(phoneInfo) {},
		error: function(phoneInfo, error) {}
	});
}

function addFrequency(object) {
	if (object==null) {return;}
	object.set("hasVerified",false);
	object.increment("frequency");
	object.save();
}

function sendMsg(object,tel) {
	AV.Cloud.requestSmsCode({
		mobilePhoneNumber: tel+'',
		name: '华盖科技短信鉴权',
		op: 'Portal认证',
		ttl: fixedTime/60
	}).then(function(){
		addFrequency(object);
	}, function(err){
	        //发送失败
	        console.log(err);
	    });
}