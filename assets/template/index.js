/**
 * Created with JetBrains WebStorm.
 * User: 松松
 * Date: 12-11-30
 * Time: 下午7:47
 * To change this template use File | Settings | File Templates.
 */

define(function (require, exports, module) {

    'use strict';

    var split = require('./split').split;

    var JSON = require('./json2').JSON;

    var cache = [
        []
    ];

    var placeholderFlag = [
        [/\\#if/gm , /AMS_IF_COMMENT/gm , '#if'],
        [/\\#elseif/gm , /AMS_ELSEIF_COMMENT/gm , '#elseif'],
        [/\\#else/gm , /AMS_ELSE_COMMENT/gm , '#else'],
        [/\\#each/gm , /AMS_EACH_COMMENT/gm , '#each'],
        [/\\#end/gm , /AMS_END_COMMENT/gm , '#end'],
        [/\\#run/gm , /AMS_RUN_COMMENT/gm , '#run'],
        [/\\#js/gm , /AMS_JS_COMMENT/gm , '#js'],
        [/\\#\{/, /AMS_VARIABLE_COMMENT/, '#{'],
        [/\$/gmi, /AMS_RE/gm, '$'],
        [/\\\)/gmi, /AMS_CLOSE/gm, ')']
    ];


    /**
     * code fragment
     * */
    function temporaryProtection(tpl) {

        for (var i = 0; i < placeholderFlag.length; i++) {
            var o = placeholderFlag[i];
            tpl = tpl.replace(o[0], o[1].source)
        }

        //转换JS代码块
        tpl = tpl.replace(/#js([\s\S]*?)#end/gm, 'AMS_FLAG_JS$1AMS_FLAG_ENDJS');

        return tpl
    }

    function revertProtection(tpl) {

        for (var i = 0; i < placeholderFlag.length; i++) {
            var o = placeholderFlag[i];
            tpl = tpl.replace(o[1], o[2])
        }

        return tpl
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
            var _tpl = tpl.match(/[\s\S]+?#end/)[0];

            var _str = '';
            if (/#(if|each|js)/gm.test(_tpl)) {
                var point = [];

                for (var i = 0; i < flag.length; i++) {
                    var s = flag[i];
                    var _p = _tpl.lastIndexOf(s);
                    if (_p > -1) point.push(_p)
                }

                _tpl = _tpl.substring(Math.max.apply(null, point));
                var c = _tpl.match(flagRe);
                var $1 = c[0].substring(1);
                var _a = '', _b = '';
                if ($1 == "if") {
                    _a = 'AMS_FLAG_IF';
                    _b = 'AMS_FLAG_ENDIF';
                } else if ($1 == "each") {
                    _a = 'AMS_FLAG_EACH';
                    _b = 'AMS_FLAG_ENDEACH';
                } else if ($1 == "js") {
                    _a = 'AMS_FLAG_JS';
                    _b = 'AMS_FLAG_ENDJS';
                }
                _str = _tpl.replace(flagPart, _a + '$1' + _b);
                if ($1 === 'if') _str = replaceElse(_str);
                tpl = tpl.replace(_tpl, _str);
            } else {
                _str = _tpl.substring(0, _tpl.length - 4) + 'echo("#e"+"nd")';
                tpl = tpl.replace(_tpl, _str);
            }
            _translateIf();
        }

        _translateIf();

        //接下来分析模板
        function replaceEcho(_value) {
            var re = /[\\]+#\{([^}]+)\}/gm;
            tpl = _value.replace(re, 'AMS_VARIABLE_COMMENT$1}');
            tpl = tpl.replace(/#\{([^}]+)\}/gm, 'AMS_PLACEHOLDER_START--$1--AMS_PLACEHOLDER_END')
        }

        replaceEcho(tpl);

        return tpl;
    }

//寻找变量值
    function transportOperation(tpl) {

        var re = /(AMS_FLAG_IF|AMS_FLAG_ELSEIF){1}(?:[\s]*([^)]+?\)))(.*?)(?=AMS_FLAG_ELSEIF|AMS_FLAG_ELSE|AMS_FLAG_ENDIF|AMS_FLAG_EACH|AMS_FLAG_JS|[\r\n])/gm;
        tpl = tpl.replace(re, '$1AMS_OPERATION--$2--AMS_OPERATION$3');

        return tpl;
    }

//转换JS代码块
    function transportJS(tpl) {
        var _jsRe = /AMS_FLAG_JS(?:[\s\S]+?)AMS_FLAG_ENDJS/gm;
        var match = tpl.match(_jsRe);
        if (match) {
            for (var i = 0; i < match.length; i++) {
                var str = match[i];
                var _s = str.match(/AMS_FLAG_JS([\s\S]+?)AMS_FLAG_ENDJS/);
                if (!_s) continue;
                tpl = tpl.replace(str, 'AMS_FLAG_JS' + encodeURIComponent(_s[1]) + 'AMS_FLAG_ENDJS');
            }
        }
        return tpl
    }

    function transportVar(tpl) {
        return tpl.replace(/#run(.+?)$/gm, 'AMS_RUN_START$1AMS_RUN_END')
    }


    //检查IF标签配对
    var OPEN_IF = [
        'AMS_FLAG_IFAMS_OPERATION',
        'AMS_FLAG_ELSEIFAMS_OPERATION'
    ];

    var CLOSE_IF = 'AMS_OPERATION';
    var IF_FLAG = new RegExp('' +
        '(' +
        OPEN_IF[0] + '--(?:.+?)--' + CLOSE_IF + '|' +
        OPEN_IF[1] + '--(?:.+?)--' + CLOSE_IF + '|' +
        'AMS_FLAG_EACH(?:\\([^)]+?\\))|' +
        'AMS_PLACEHOLDER_START' + '--(?:.+?)--' + 'AMS_PLACEHOLDER_END|' +
        'AMS_FLAG_JS(?:.+?)AMS_FLAG_ENDJS|' +
        'AMS_RUN_START(?:.+?)AMS_RUN_END|' +
        'AMS_FLAG_ELSE|AMS_FLAG_ENDIF|AMS_FLAG_ENDEACH)', 'gm');

    var forEachRe = /AMS_FLAG_EACH\((.+?)[\s]+in[\s]+([^\s]+)\)/;


    function render(value, data) {

        var tpl;
        var isCache = false;
        var html;

        for (var c = 0; c < cache.length; c++) {
            var _cache = cache[c];
            if (value === _cache[0]) {
                html = _cache[1];
                isCache = true;
                break;
            }
        }

        //头文件每次都更新
        var head = [
            '(function(){ \r\n "use strict";\r\n',
            'var AMS_RENDER=[];\r\n',
            'function echo(s){AMS_RENDER.push(s);}\r\n'
        ];

        head.push('var AMS_DATA=' + '' + JSON.stringify(data) + ';\r\n');
        for (var k in data) {
            if (data.hasOwnProperty(k)) {
                head.push('var ' + k + ' = AMS_DATA.' + k + ';\r\n');
            }
        }

        //开始转换为JS
        var _tpl;

        //如果缓存中无值
        if (isCache === false) {

            html = [];

            tpl = translateIF(value);
            tpl = transportJS(tpl);
            tpl = transportOperation(tpl);
            tpl = revertProtection(tpl);
            tpl = transportVar(tpl);

            _tpl = tpl.split(/[\r\n]/);


            for (var l = 0; l < _tpl.length; l++) {
                var str = _tpl[l];

                //检查IF标签配对
                var arr = split(str, IF_FLAG);
                for (var i = 0; i < arr.length; i++) {
                    var _str = arr[i];
                    if (IF_FLAG.test(_str)) {
                        //匹配IF语句
                        if (/AMS_FLAG_IFAMS_OPERATION/.test(_str)) {
                            html.push(_str.replace(/AMS_FLAG_IFAMS_OPERATION--(.+?)--AMS_OPERATION/g, 'if $1 {'));
                        } else if (/AMS_FLAG_ELSEIFAMS_OPERATION/.test(_str)) {
                            html.push(_str.replace(/AMS_FLAG_ELSEIFAMS_OPERATION--(.+?)--AMS_OPERATION/, '} else if $1 { '));
                        } else if (_str === 'AMS_FLAG_ELSE') {
                            html.push(_str.replace(/AMS_FLAG_ELSE/, '} else {'));
                        } else if (_str === 'AMS_FLAG_ENDIF') {
                            html.push(_str.replace(/AMS_FLAG_ENDIF/gm, '}'));
                        }
                        //匹配Each语句
                        else if (/AMS_FLAG_EACH/.test(_str)) {
                            html.push(_str.replace(forEachRe, function (_str) {
                                var match = _str.match(forEachRe);
                                var $1 = match[1].split(',');
                                var $2 = match[2];
                                var i = $1.length > 1 ? $1[1] : 'index';

                                var arr = $1[2] ? $1[2] : $2;
                                //模拟ES5 中forEach的参数定义
                                return '' +
                                    //如果存在forEach中第3个形参
                                    ($1[2] ? 'var ' + $1[2] + '=' + $2 + ';' : '') + '\r\n' +
                                    'for(var ' + i + '=0;' + i + '<' + arr + '.length;' + i + '++){\r\n' +
                                    'var ' + $1[0] + '=' + arr + '[' + i + '];\r\n';

                            }));
                        } else if (_str === 'AMS_FLAG_ENDEACH') {
                            html.push(_str.replace(/AMS_FLAG_ENDEACH/gm, '};'));
                        }
                        //匹配占位符
                        else if (/AMS_PLACEHOLDER_START/.test(_str)) {
                            html.push(_str.replace(/AMS_PLACEHOLDER_START--(.+?)--AMS_PLACEHOLDER_END/, 'echo($1);'));
                        }
                        //匹配JS语句
                        else if (/AMS_FLAG_JS/.test(_str)) {
                            _str.match(/AMS_FLAG_JS(.+?)AMS_FLAG_ENDJS/);
                            html.push(_str.replace(/AMS_FLAG_JS(.+?)AMS_FLAG_ENDJS/, decodeURIComponent(_str.match(/AMS_FLAG_JS(.+?)AMS_FLAG_ENDJS/)[1]) + '\r\n'));
                        }//匹配RUN
                        else if (/AMS_RUN_START/.test(_str)) {
                            html.push(_str.replace(/AMS_RUN_START(.+?)AMS_RUN_END/, '$1'));
                        }
                    } else {
                        if (_str.length > 0) html.push('AMS_RENDER.push("' + _str.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '");');
                    }
                    if (_str.length > 0) html.push('\r\n');
                    if (i === arr.length - 1) html.push('AMS_RENDER.push("\\r\\n");');
                }

                html.push('\r\n');

            }

            cache.push([value, html.join('')]);
        }

        return  eval(head.join('') + '' + (isCache ? html : html.join('')) + "\r\n return AMS_RENDER.join('');\r\n})();");

    }

    if (exports) {
        exports.render = render;
    } else {
        window.render = render;
    }

});

