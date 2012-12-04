/**
 * Created with JetBrains WebStorm.
 * User: 松松
 * Date: 12-11-30
 * Time: 下午7:47
 * To change this template use File | Settings | File Templates.
 */

(function () {

    'use strict';

    /*!
     * Cross-Browser Split 1.1.1
     * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
     * Available under the MIT License
     * ECMAScript compliant, uniform cross-browser split method
     */

    /**
     * Splits a string into an array of strings using a regex or string separator. Matches of the
     * separator are not included in the result array. However, if `separator` is a regex that contains
     * capturing groups, backreferences are spliced into the result each time `separator` is matched.
     * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
     * cross-browser.
     * @param {String} str String to split.
     * @param {RegExp|String} separator Regex or string to use for separating the string.
     * @param {Number} [limit] Maximum number of items to include in the result array.
     * @returns {Array} Array of substrings.
     * @example
     *
     * // Basic use
     * split('a b c d', ' ');
     * // -> ['a', 'b', 'c', 'd']
     *
     * // With limit
     * split('a b c d', ' ', 2);
     * // -> ['a', 'b']
     *
     * // Backreferences in result array
     * split('..word1 word2..', /([a-z]+)(\d+)/i);
     * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
     */
    var split;

// Avoid running twice; that would break the `nativeSplit` reference
    split = split || function (undef) {

        var nativeSplit = String.prototype.split,
            compliantExecNpcg = /()??/.exec("")[1] === undef, // NPCG: nonparticipating capturing group
            self;

        self = function (str, separator, limit) {
            // If `separator` is not a regex, use `nativeSplit`
            if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
                return nativeSplit.call(str, separator, limit);
            }
            var output = [],
                flags = (separator.ignoreCase ? "i" : "") +
                    (separator.multiline ? "m" : "") +
                    (separator.extended ? "x" : "") + // Proposed for ES6
                    (separator.sticky ? "y" : ""), // Firefox 3+
                lastLastIndex = 0,
            // Make `global` and avoid `lastIndex` issues by working with a copy
                separator = new RegExp(separator.source, flags + "g"),
                separator2, match, lastIndex, lastLength;
            str += ""; // Type-convert
            if (!compliantExecNpcg) {
                // Doesn't need flags gy, but they don't hurt
                separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
            }
            /* Values for `limit`, per the spec:
             * If undefined: 4294967295 // Math.pow(2, 32) - 1
             * If 0, Infinity, or NaN: 0
             * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
             * If negative number: 4294967296 - Math.floor(Math.abs(limit))
             * If other: Type-convert, then use the above rules
             */
            limit = limit === undef ?
                -1 >>> 0 : // Math.pow(2, 32) - 1
                limit >>> 0; // ToUint32(limit)
            while (match = separator.exec(str)) {
                // `separator.lastIndex` is not reliable cross-browser
                lastIndex = match.index + match[0].length;
                if (lastIndex > lastLastIndex) {
                    output.push(str.slice(lastLastIndex, match.index));
                    // Fix browsers whose `exec` methods don't consistently return `undefined` for
                    // nonparticipating capturing groups
                    if (!compliantExecNpcg && match.length > 1) {
                        match[0].replace(separator2, function () {
                            for (var i = 1; i < arguments.length - 2; i++) {
                                if (arguments[i] === undef) {
                                    match[i] = undef;
                                }
                            }
                        });
                    }
                    if (match.length > 1 && match.index < str.length) {
                        Array.prototype.push.apply(output, match.slice(1));
                    }
                    lastLength = match[0].length;
                    lastLastIndex = lastIndex;
                    if (output.length >= limit) {
                        break;
                    }
                }
                if (separator.lastIndex === match.index) {
                    separator.lastIndex++; // Avoid an infinite loop
                }
            }
            if (lastLastIndex === str.length) {
                if (lastLength || !separator.test("")) {
                    //output.push("");
                }
            } else {
                output.push(str.slice(lastLastIndex));
            }
            return output.length > limit ? output.slice(0, limit) : output;
        };

        // For convenience
        String.prototype.split = function (separator, limit) {
            return self(this, separator, limit);
        };

        return self;

    }();


    var placeholderFlag = [
        [/\\#if/gm , /AMS_IF_COMMENT/gm , '#if'],
        [/\\#elseif/gm , /AMS_ELSEIF_COMMENT/gm , '#elseif'],
        [/\\#else/gm , /AMS_ELSE_COMMENT/gm , '#else'],
        [/\\#each/gm , /AMS_EACH_COMMENT/gm , '#each'],
        [/\\#end/gm , /AMS_END_COMMENT/gm , '#end'],
        [/\\#var/gm , /AMS_VAR_COMMENT/gm , '#var'],
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
            var _tpl = tpl.substring(0, tpl.indexOf('#end') + 4);

            var _str = '';
            if (flagRe.test(_tpl)) {
                var point = [];

                for (var i = 0; i < flag.length; i++) {
                    var s = flag[i];
                    var _p = _tpl.lastIndexOf(s);
                    if (_p > -1) point.push(_p)
                }

                _tpl = _tpl.substring(Math.max.apply(null, point));
                flagRe.test(_tpl);
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
                _str = _tpl.substring(0, _tpl.length - 4) + 'AMS_UNOPENED_END';
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
    function transportJS(value) {
        var _jsRe = /AMS_FLAG_JS([\s\S]+?)AMS_FLAG_ENDJS/gm;
        var match = value.match(_jsRe);
        if (match) {
            for (var i = 0; i < match.length; i++) {
                var str = match[i];
                str.match(_jsRe);
                var $1 = RegExp.$1;
                value = value.replace(str, 'AMS_FLAG_JS' + encodeURIComponent($1) + 'AMS_FLAG_ENDJS');
            }
        }
        return value
    }


    function render(value, data) {

        var tpl = translateIF(value);
        var html = [
            '(function(){ \r\n "use strict";\r\n',
            'var AMS_RENDER=[];\r\n',
            'function echo(s){AMS_RENDER.push(s);}\r\n'
        ];
        html.push('var AMS_DATA=' + '' + JSON.stringify(data) + ';\r\n');
        for (var k in data) {
            if (data.hasOwnProperty(k)) {
                html.push('var ' + k + ' = AMS_DATA.' + k + ';\r\n');
            }
        }

        tpl = transportJS(tpl);

        tpl = transportOperation(tpl);

        tpl = revertProtection(tpl);

        if (/AMS_OPERATION--/gm.test(tpl)) {
            //throw('Syntax Error')
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
            'AMS_PLACEHOLDER_START' + '--(?:.+?)--' + 'AMS_PLACEHOLDER_END' + '|' +
            'AMS_FLAG_JS(?:.+?)AMS_FLAG_ENDJS' + '|' +
            'AMS_VAR_START(?:var.+)AMS_VAR_END' + '|' +
            'AMS_FLAG_ELSE|AMS_FLAG_ENDIF|AMS_FLAG_ENDEACH)', 'gm');

        var forEachRe = /AMS_FLAG_EACH\((.+?)[\s]+in[\s]+([^\s]+)\)/;

        //开始转换为JS
        var _tpl = tpl.split(/[\r\n]/);
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
                            return '(function(){\r\n' +
                                //如果存在forEach中第3个形参
                                ($1[2] ? 'var ' + $1[2] + '=' + $2 + ';' : '') + '\r\n' +
                                'for(var ' + i + '=0;' + i + '<' + arr + '.length;' + i + '++){\r\n' +
                                'var ' + $1[0] + '=' + arr + '[' + i + '];\r\n';

                        }));
                    } else if (_str === 'AMS_FLAG_ENDEACH') {
                        html.push(_str.replace(/AMS_FLAG_ENDEACH/gm, '}})();'));
                    }
                    //匹配占位符
                    else if (/AMS_PLACEHOLDER_START/.test(_str)) {
                        html.push(_str.replace(/AMS_PLACEHOLDER_START--(.+?)--AMS_PLACEHOLDER_END/, 'echo($1);'));
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
            }

            html.push('\r\n')
        }

        html.push("return AMS_RENDER.join('');");
        html.push('})();');
        //return html.join('');

        return  eval(html.join(''));

    }

    if (typeof define === 'function') {
        define('template', function (require, exports, module) {
            exports.render = render;
        })
    } else {
        window.render = render;
    }
})();


