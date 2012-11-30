/**
 * Created with JetBrains WebStorm.
 * User: 松松
 * Date: 12-11-30
 * Time: 下午7:58
 * To change this template use File | Settings | File Templates.
 */

define(function (require, exports, module) {

    var template = require('template/index');
    var c = document.getElementById('c');
    document.getElementById('test').onkeydown = function () {
        var self = this;
        setTimeout(function () {
            c.value = template.render(self.value);
        }, 0)
    }

});