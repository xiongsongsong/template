/**
 * Created with JetBrains WebStorm.
 * User: xiongsongsong
 * Date: 12-11-25
 * Time: 下午12:46
 * Des: transport tpl
 */

define(function (require, exports, module) {

    var IFANDEACH = /([\\]*#each|[\\]*#if)([\s]*\([^#]*\))?/gm;

    //RegExp object does not support lookbehind
    //so with the code below
    function translateIF(value) {

        var tempValue = value;

        function _translateIf() {
            var allIf = tempValue.match(IFANDEACH);

            if (!allIf) {
                return;
            }
            //query first #if
            var point = tempValue.indexOf(allIf[0]);

            //check for escape
            var isEscape = tempValue.substring(point).indexOf('\\') === 0;

            //as the starting point of the first interception string
            tempValue = tempValue.substring(point + allIf[0].length);

            if (isEscape) {
                _translateIf();
                return;
            }

            //find the #end last place
            var current = tempValue.match(/[\s\S]*?([^\\]#end){1}/);

            //if you find the "#end"
            if (current) {
                //and  can not contain the "#if #each..."
                var matchIF = current[0].match(IFANDEACH);
                if ((!matchIF || (matchIF[0] && matchIF[0].indexOf('\\') === 0))) {
                    //if not found,it proved to be correct
                    var a = allIf[0].match(IFANDEACH);
                    var _a = '', _b = '';

                    //replaced the a full-width in order to avoid duplication find
                    if (RegExp.$1 === '#if') {
                        _a = '\r\n＃ＩＦ';
                        _b = '＃ＥＮＤＩＦ'
                    } else if (RegExp.$1 == '#each') {
                        _a = '\r\n＃ＥＡＣＨ';
                        _b = '＃ＥＮＤＥＡＣＨ'
                    }
                    value = value.replace(allIf[0] + current[0], _a + RegExp.$2 + '\r\n' +
                        current[0].substring(0, current[0].lastIndexOf('#end')) + '\r\n' + _b + '\r\n');

                    //repeat find
                    tempValue = value;
                }
            }

            _translateIf();
        }

        _translateIf();
        return value;
    }
});