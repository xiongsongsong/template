/**
 * Created with JetBrains WebStorm.
 * User: xiongsongsong
 * Date: 13-5-8
 * Time: 下午10:41
 * To change this template use File | Settings | File Templates.
 */


define(function () {


// 数据量
    var length = 100;
// 渲染次数
    var number = 100;
    var pre = jQuery('#prper');

    var data = {
        list: []
    };

    for (var i = 0; i < length; i++) {
        data.list.push({
            index: i,
            user: '<strong style="color:red">糖饼</strong>',
            site: 'http://www.planeart.cn'
        });
    }

    var tpl = '#each(item in list) <li>#{item.index}. 用户: #{item.user}/ 网站：#{item.site}</li>#end'

    var a = Date.now();

    for (var k = 0; k < number; k++) {
        render(tpl, data)
    }

    pre.html('100条数据*100次\r\n编译模式' + (Date.now() - a) + '毫秒');


    var _tpl = compile(tpl);

    var c = Date.now();
    for (var j = 0; j < number; j++) {
        render(_tpl, data)
    }

    pre.html(pre.html() + '\r\n缓存模式' + (Date.now() - c) + '毫秒');


});