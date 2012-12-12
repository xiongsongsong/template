/**
 * Created with JetBrains WebStorm.
 * User: 松松
 * Date: 12-12-5
 * Time: 上午9:29
 * To change this template use File | Settings| File Templates.
 */

define(function (require, exports, module) {

    var $ = require('https://a.alipayobjects.com/gallery/jquery/1.7.2/jquery.js');
    var template = require('../src/template');

    var tpl = $('#tpl');
    var result = $('#result');
    var data = $('#data');

    $(tpl).add(data).on('keydown', function (ev) {
        setTimeout(function () {
            var a = new Date();
            var pre = template(tpl.val());
            var html = template(tpl.val(), JSON.parse(data.val()), {cache: true});
            var b = new Date();
            result[0].value = html;
            $('#tips').html('耗费时间:' + (b - a) + '毫秒');
        }, 0)
    });

});
