var AV = require('avoscloud-sdk').AV;

exports.query = function query(req,res){
  var psw = req.query.psw;
  if (!psw&&psw!="huagai123") {
    res.send("密码错误，不能查看");
    return;
  }

  AV.initialize("4wf4fj74qlb0ysgnnlvx1flraz2ht0qgldzcx4d7xpbpevsc", "m8oexnwyn6644w3hwgfdxojg7xtyvio1j4oe8e8wzwm30do7");

  var SQL = 'SELECT * FROM PhoneInfo ORDER BY updatedAt desc';
  AV.Query.doCloudQuery(SQL, {
    success: function(result){
        //results 是查询返回的结果，AV.Object 列表
        var results = result.results;
        // res.send(results);
        // return;
        res.render("query",{
          title: "短信详单",
          data: results
        });
      },
      error: function(error){
        //查询失败，查看 error
        res.send(error);
      }
    });
};