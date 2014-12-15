var AV = require('avoscloud-sdk').AV;

exports.verifySMS = function verifySMS(req,res){
  if (req.query.phoneNumber&&req.query.verifyCode) {
    verify(req.query.phoneNumber,req.query.verifyCode,res);
    return;
  }
  if (req.body.phoneNumber&&req.body.verifyCode) {
    verify(req.body.phoneNumber,req.body.verifyCode,res);
  }else{
    var body='',jsonStr;

    req.on('data',function(chunk){
      body+=chunk;
    });

    req.on('end',function(){
      try{
        jsonStr = JSON.parse(body);
        verify(jsonStr.phoneNumber,jsonStr.verifyCode,res);
      }catch(err){
        jsonStr='{"code":1,"msg":"JSON Error!"}';
        res.send(JSON.parse(jsonStr));
      }
    });
  }
};

function verify(phone,code,res){

  if (!checkPhone(phone)) {
    var jsonStr ='{"code":1, "msg":"手机号码不正确!"}';
    res.send(JSON.parse(jsonStr));
    return;
  }

  if (code.length!=6) {
    var jsonStr ='{"code":1, "msg":"验证码位数错误!"}';
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
        var jsonStr ='{"code":1, "msg":"手机号码不存在，请先申请短信验证!"}';
        res.send(JSON.parse(jsonStr));
      }else{
        if (results[0].get("hasVerified")) {
          var jsonStr ='{"code":2, "msg":"该号码已经验证，请勿重复验证!"}';
          if (code!=results[0].get("verifyCode")) {
            jsonStr ='{"code":3, "msg":"验证码错误!未通过鉴权!"}';
          }
          res.send(JSON.parse(jsonStr));
        }else{
          var codeWithPhone = code+'?mobilePhoneNumber='+phone;
          AV.Cloud.verifySmsCode(codeWithPhone).then(function(){
          //验证成功
          addVerifyFrequency(results[0], code+"");
          var jsonStr = '{"code":0,"msg":"短信认证成功,页面即将跳转!"}';
          res.send(JSON.parse(jsonStr));
          return;
        }, function(err){
          //验证失败
          var jsonStr = '{"code":4,"msg":"验证码错误!未通过鉴权!"}';
          res.send(JSON.parse(jsonStr));
          return;
        });
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

function addVerifyFrequency(object, code) {
  object.set("hasVerified",true);
  object.set("verifyCode",code);
  object.increment("verifyFrequency");
  object.save();
}