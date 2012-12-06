/**
 * Created with JetBrains WebStorm.
 * User: 松松
 * Date: 12-12-6
 * Time: 下午4:49
 * To change this template use File | Settings | File Templates.
 */

define(function (require, exports, module) {
    //
    var $ = require('https://a.alipayobjects.com/gallery/jquery/1.7.2/jquery.js');

    window.beauty = function (data) {
        console.log(data.items.length);
        //console.log(parseInt(Math.random()*100,10)%(20-0+1)+0)
    };

    $.ajax('http://api.flickr.com/services/feeds/photos_public.gne?tags=universe&tagmode=any&format=json&jsoncallback=beauty', {
        dataType:'jsonp'
    })

});
