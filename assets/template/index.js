/**
 * Created with JetBrains WebStorm.
 * User: 松松
 * Date: 12-11-30
 * Time: 下午7:47
 * To change this template use File | Settings | File Templates.
 */

(function () {

    'use strict';

    var placeholderFlag = [
        [/\\#if/gm , 'AMS_IF_COMMENT' , '\\#if'],
        [/\\#elseif/gm , 'AMS_ELSEIF_COMMENT' , '\\#elseif'],
        [/\\#else/gm , 'AMS_ELSE_COMMENT' , '\\#else'],
        [/\\#each/gm , 'AMS_EACH_COMMENT' , '\\#each'],
        [/\\#end/gm , 'AMS_END_COMMENT' , '\\#end'],
        [/\\#var/gm , 'AMS_VAR_COMMENT' , '\\#var'],
        [/\\#js/gm , 'AMS_JS_COMMENT' , '\\#js'],
        [/\$/gmi, 'AMS_JS_REGEXP', '$']
    ];


    /**
     * Javascript code fragment
     *
     * */
    function temporaryProtection(tpl) {

        placeholderFlag.forEach(function (o) {
            tpl = tpl.replace(o[0], o[1])
        });

        //转换JS代码块
        tpl = tpl.replace(/#js([\s\S]*?)#end/gm, 'AMS_FLAG_JS$1AMS_FLAG_ENDJS');

        return tpl
    }

    function revertProtection(value) {
        placeholderFlag.forEach(function (o) {
            value = value.replace(o[1], o[2])
        });
        return value
    }

//替换#if  #end 之间的elseif 和 #else
    function replaceElse(str) {
        str = str.replace(/#(elseif)[\s]*(\([^)]+\)){1}/gm, 'AMS_FLAG_ELSEIF$2');
        str = str.replace(/#else/gm, 'AMS_FLAG_ELSE');
        //Revert TEMPBLOCK
        str = str.replace(/AMSTEMPBLOCKS==(.*)==/gm, '\\#$1');
        return str;
    }

//RegExp object does not support lookbehind
//so with the code below
    function translateIF(tpl) {

        tpl = temporaryProtection(tpl);

        var flag = ['#if', '#each', '#js'];
        var flagRe = /#(if|each|js)/gm;
        var flagPart = /(?:#if|#each|#js)([\s\S]+?)#end/gm;

        function _translateIf() {
            if (!/#end/.test(tpl)) return;
            var _tpl = tpl.substring(0, tpl.indexOf('#end') + 4);

            var _str = '';
            if (flagRe.test(_tpl)) {
                var point = [];
                flag.forEach(function (s) {
                    var _p = _tpl.lastIndexOf(s);
                    if (_p > -1) point.push(_p)
                });
                _tpl = _tpl.substring(Math.max.apply(null, point));
                flagRe.test(_tpl);
                var c = _tpl.match(flagRe);
                var $1 = c[0].substring(1);
                var _a = '', _b = '';
                switch ($1) {
                    case "if":
                        _a = 'AMS_FLAG_IF';
                        _b = 'AMS_FLAG_ENDIF';
                        break;
                    case "each":
                        _a = 'AMS_FLAG_EACH';
                        _b = 'AMS_FLAG_ENDEACH';
                        break;
                    case "js":
                        _a = 'AMS_FLAG_JS';
                        _b = 'AMS_FLAG_ENDJS';
                        break;
                }
                _str = _tpl.replace(flagPart, _a + '$1' + _b);
                if ($1 === 'if') _str = replaceElse(_str);
                tpl = tpl.replace(_tpl, _str);
            } else {
                _str = _tpl.substring(0, _tpl.length - 4) + 'AMS_UNOPENED_END';
                tpl = tpl.replace(_tpl, _str);
            }
            _translateIf();
        }

        _translateIf();

        //接下来分析模板
        //TODO:是否可以移动到外部
        function replaceEcho(_value) {
            var re = /[\\]+#\{([^}]+)\}/gm;
            tpl = _value.replace(re, 'AMS_VARIABLE_COMMENT_START--$1--AMS_VARIABLE_COMMENT_END');
            tpl = tpl.replace(/#\{([^}]+)\}/gm, 'AMS_PLACEHOLDER_START--$1--AMS_PLACEHOLDER_END')
        }

        replaceEcho(tpl);

        return tpl;
    }

//寻找变量值
    function transportOperation(tpl) {

        var re = /(AMS_FLAG_IF|AMS_FLAG_ELSEIF){1}(.*?)(?=AMS_FLAG_ELSEIF|AMS_FLAG_ELSE|AMS_FLAG_ENDIF|AMS_FLAG_EACH|AMS_FLAG_ENDEACH|[\r\n])/gm;

        tpl = tpl.replace(re, '$1AMS_OPERATION--$2--AMS_OPERATION');

        //开始逐一判断参数合法性

        var amsOperation = /AMS_OPERATION--(.*?)--AMS_OPERATION/gm;

        var operation = tpl.match(amsOperation);
        //首先靠猜测
        if (operation) {
            operation.forEach(function (item) {
                var source = item.match(amsOperation);
                var $1 = RegExp.$1;
                //首先查询最右侧括号
                var rightEnd = $1.lastIndexOf(')');
                var step1 = $1.substring(0, rightEnd + 1);
                var step1End = $1.substring(rightEnd + 1);
                if (JSHINT('var test=' + step1.trim() + ';')) {
                    tpl = tpl.replace('AMS_OPERATION--' + $1 + '--AMS_OPERATION', 'AMS_OPERATION_SUCCESS--' + step1 + '--AMS_OPERATION_SUCCESS' + step1End);
                } else {
                    var _step1 = step1;
                    var i = 0;
                    var length = step1.length;
                    while (_step1.length > 1) {
                        if (JSHINT('var test=' + _step1.trim() + ';')) {
                            tpl = tpl.replace('AMS_OPERATION--' + $1 + '--AMS_OPERATION', 'AMS_OPERATION_SUCCESS--' + _step1.trim() + '--AMS_OPERATION_SUCCESS' + step1.trim().substring(_step1.trim().length));
                            break;
                        }
                        _step1 = _step1.substring(0, step1.length - i);
                        if (i >= step1.length) break;
                        i++;
                    }
                }
            });
        }

        return tpl;
    }

//转换JS代码块
    function transportJS(value) {
        var _jsRe = /AMS_FLAG_JS([\s\S]+?)AMS_FLAG_ENDJS/gm;
        var match = value.match(_jsRe);
        if (match) {
            match.forEach(function (str) {
                var v = str.match(_jsRe);
                var $1 = RegExp.$1;
                value = value.replace(str, 'AMS_FLAG_JS' + encodeURIComponent($1) + 'AMS_FLAG_ENDJS');
            });
        }
        return value;
    }

    function render(value) {

        var tpl = translateIF(value);
        var html = [];

        tpl = transportJS(tpl);

        tpl = transportOperation(tpl);

        tpl = revertProtection(tpl);

        if (/AMS_OPERATION--/gm.test(tpl)) {
            //throw('Syntax Error')
        }

        //检查IF标签配对
        var OPEN_IF = [
            'AMS_FLAG_IFAMS_OPERATION_SUCCESS',
            'AMS_FLAG_ELSEIFAMS_OPERATION_SUCCESS'
        ];

        var CLOSE_IF = 'AMS_OPERATION_SUCCESS';
        var IF_FLAG = new RegExp('' +
            '(' +
            OPEN_IF[0] + '--(?:.+?)--' + CLOSE_IF + '|' +
            OPEN_IF[1] + '--(?:.+?)--' + CLOSE_IF + '|' +
            'AMS_FLAG_EACH(?:\\([^)]+?\\))|' +
            'AMS_PLACEHOLDER_START' + '--(?:.+?)--' + 'AMS_PLACEHOLDER_END' + '|' +
            'AMS_FLAG_JS(?:.+?)AMS_FLAG_ENDJS' + '|' +
            'AMS_VAR_START(?:var.+)AMS_VAR_END' + '|' +
            'AMS_FLAG_ELSE|AMS_FLAG_ENDIF|AMS_FLAG_ENDEACH)', 'gm');

        //开始转换为JS
        tpl.split(/[\r\n]/).forEach(function (str) {

            //检查IF标签配对

            str.split(IF_FLAG).forEach(function (_str, i, arr) {

                if (IF_FLAG.test(_str)) {
                    //匹配IF语句
                    if (/AMS_FLAG_IFAMS_OPERATION_SUCCESS/.test(_str)) {
                        html.push(_str.replace(/AMS_FLAG_IFAMS_OPERATION_SUCCESS--(.+?)--AMS_OPERATION_SUCCESS/g, 'if $1 {'));
                    } else if (/AMS_FLAG_ELSEIFAMS_OPERATION_SUCCESS/.test(_str)) {
                        html.push(_str.replace(/AMS_FLAG_ELSEIFAMS_OPERATION_SUCCESS--(.+?)--AMS_OPERATION_SUCCESS/, '} else if $1 { '));
                    } else if (_str === 'AMS_FLAG_ELSE') {
                        html.push(_str.replace(/AMS_FLAG_ELSE/, '} else {'));
                    } else if (_str === 'AMS_FLAG_ENDIF') {
                        html.push(_str.replace(/AMS_FLAG_ENDIF/gm, '}'));
                    }
                    //匹配Each语句
                    else if (/AMS_FLAG_EACH/.test(_str)) {
                        html.push(_str.replace(/AMS_FLAG_EACH\((.+)[\s]+in[\s]+([^\s]+)\)/, '$2.forEach(function($1){ '));
                    } else if (_str === 'AMS_FLAG_ENDEACH') {
                        html.push(_str.replace(/AMS_FLAG_ENDEACH/gm, '});'));
                    }
                    //匹配占位符
                    else if (/AMS_PLACEHOLDER_START/.test(_str)) {
                        html.push(_str.replace(/AMS_PLACEHOLDER_START--(.+?)--AMS_PLACEHOLDER_END/, 'AMS_ECHO($1);'));
                    }
                    //匹配JS语句
                    else if (/AMS_FLAG_JS/.test(_str)) {
                        _str.match(/AMS_FLAG_JS(.+?)AMS_FLAG_ENDJS/);
                        html.push(_str.replace(/AMS_FLAG_JS(.+?)AMS_FLAG_ENDJS/, '(function(){\r\n' + decodeURIComponent(RegExp.$1) + '\r\n})();'));
                    }//匹配VAR变量声明行数
                    else if (/AMS_VAR_START/.test(_str)) {
                        html.push(_str.replace(/AMS_VAR_START(.+?)AMS_VAR_END/, '$1'));
                    }
                } else {
                    if (_str.length > 0) html.push('AMS_RENDER.push("' + _str.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '");');
                }
                if (_str.length > 0) html.push('\r\n');
                if (i === arr.length - 1) html.push('AMS_RENDER.push("\\r\\n");');
            });

            html.push('\r\n');
        });

        return html.join('');

    }

    if (typeof define === 'function') {
        define('template', function (require, exports, module) {
            exports.render = render;
        })
    } else {
        window.render = render;
    }
})();
