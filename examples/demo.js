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
            var html = template(tpl.val(), JSON.parse(data.val()));
            var b = new Date();
            result[0].value = pre;
            $('#tips').html('耗费时间:' + (b - a) + '毫秒');
        }, 0)
    });

});

(function(){
    "use strict";
    var AMS_RENDER=[];
    function echo(s){AMS_RENDER.push(s);}
    var AMS_DATA=undefined;
    AMS_RENDER.push("    <h2>");
    echo(name);
    AMS_RENDER.push("</h2>");
    AMS_RENDER.push("\r\n");AMS_RENDER.push("    <p>");
    echo(describe);
    AMS_RENDER.push("</p>");
    AMS_RENDER.push("\r\n");AMS_RENDER.push("    ");
    if (2>2) {
        AMS_RENDER.push("\r\n");AMS_RENDER.push("    <ul>");
        AMS_RENDER.push("\r\n");AMS_RENDER.push("        ");

        for(var index=0;index<planet.length;index++){
            var item=planet[index];

            AMS_RENDER.push("\r\n");AMS_RENDER.push("        <li");
            if (index%2==0) {
                AMS_RENDER.push(" class=\"odd\"");
            }
            AMS_RENDER.push(">");
            echo(item);
            AMS_RENDER.push("</li>");
            AMS_RENDER.push("\r\n");AMS_RENDER.push("        ");
        };
        AMS_RENDER.push("\r\n");AMS_RENDER.push("    </ul>");
        AMS_RENDER.push("\r\n");AMS_RENDER.push("    ");
    } else {
        AMS_RENDER.push("\r\n"); var hour=new Date().getHours();
        AMS_RENDER.push("\r\n");AMS_RENDER.push("        ");

        echo ('<p>北京时间' + new Date().toLocaleTimeString()+'</p>')
        if (hour>9 && hour<12) {
            echo ('现在是'+'上午')
        } else if (hour>12 && hour<18) {
            echo ('下午')
        } else {
            echo(hour+'点')
        }

        AMS_RENDER.push("\r\n");AMS_RENDER.push("    ");
    }
    AMS_RENDER.push("\r\n");

    return AMS_RENDER.join('');
})();