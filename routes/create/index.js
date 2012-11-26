/**
 * Created with JetBrains WebStorm.
 * User: xiongsongsong
 * Date: 12-11-25
 * Time: 下午4:46
 * To change this template use File | Settings | File Templates.
 */

var transport = require('./transport');

var testData = {"data":[
    {"name":"<b>王恺放</b>", "age":23, "msg":"四川的人儿<b>啊啊啊啊</b>"},
    {"name":"李四", "age":66, "msg":"敏感词"},
    {"name":"李四", "age":66, "msg":"敏感词"},
    {"name":"李四", "age":66, "msg":"敏感词"}
]};

exports.register = function (app) {

    //Home
    app.get('/create', function (req, res) {
        res.render('create/index')
    });

    //Save
    app.post('/create/save', function (req, res) {
        res.header('Content-Type', 'text/plain;charset=utf-8');
        res.end(transport.convert(req.body.source, testData));
    });
};