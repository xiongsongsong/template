define("template/template/1.0.0/template-debug", [ "./split-debug", "./json2-debug" ], function(require, exports, module) {
    "use strict";
    var split = require("./split-debug").split;
    var JSON = require("./json2-debug").JSON;
    //#each中避免索引重名的一个辅助变量，自增
    var AMS_Index = 0;
    var placeholderFlag = [ [ /\\#if/gm, /AMS_IF_COMMENT/gm, "#if" ], [ /\\#elseif/gm, /AMS_ELSEIF_COMMENT/gm, "#elseif" ], [ /\\#else/gm, /AMS_ELSE_COMMENT/gm, "#else" ], [ /\\#each/gm, /AMS_EACH_COMMENT/gm, "#each" ], [ /\\#end/gm, /AMS_END_COMMENT/gm, "#end" ], [ /\\#run/gm, /AMS_RUN_COMMENT/gm, "#run" ], [ /\\#js/gm, /AMS_JS_COMMENT/gm, "#js" ], [ /\\#\{/, /AMS_VARIABLE_COMMENT/, "#{" ], [ /\$/gim, /AMS_RE/gm, "$" ], [ /\\\)/gim, /AMS_CLOSE/gm, ")" ] ];
    /**
     * code fragment
     * */
    function temporaryProtection(tpl) {
        for (var i = 0; i < placeholderFlag.length; i++) {
            var o = placeholderFlag[i];
            tpl = tpl.replace(o[0], o[1].source);
        }
        //转换JS代码块
        tpl = tpl.replace(/#js([\s\S]*?)#end/gm, "AMS_FLAG_JS$1AMS_FLAG_ENDJS");
        return tpl;
    }
    function revertProtection(tpl) {
        for (var i = 0; i < placeholderFlag.length; i++) {
            var o = placeholderFlag[i];
            tpl = tpl.replace(o[1], o[2]);
        }
        return tpl;
    }
    //替换#if  #end 之间的elseif 和 #else
    function replaceElse(str) {
        str = str.replace(/#(elseif)[\s]*(\([^)]+\)){1}/gm, "AMS_FLAG_ELSEIF$2");
        str = str.replace(/#else/gm, "AMS_FLAG_ELSE");
        //Revert TEMPBLOCK
        str = str.replace(/AMSTEMPBLOCKS==(.*)==/gm, "\\#$1");
        return str;
    }
    //RegExp object does not support lookbehind
    //so with the code below
    function translateIF(tpl) {
        tpl = temporaryProtection(tpl);
        var flag = [ "#if", "#each", "#js" ];
        var flagRe = /#(if|each|js)/gm;
        var flagPart = /(?:#if|#each|#js)([\s\S]+?)#end/gm;
        function _translateIf() {
            if (!/#end/.test(tpl)) return;
            var _tpl = tpl.match(/[\s\S]+?#end/)[0];
            var _str = "";
            if (/#(if|each|js)/gm.test(_tpl)) {
                var point = [];
                for (var i = 0; i < flag.length; i++) {
                    var s = flag[i];
                    var _p = _tpl.lastIndexOf(s);
                    if (_p > -1) point.push(_p);
                }
                _tpl = _tpl.substring(Math.max.apply(null, point));
                var c = _tpl.match(flagRe);
                var $1 = c[0].substring(1);
                var _a = "", _b = "";
                if ($1 == "if") {
                    _a = "AMS_FLAG_IF";
                    _b = "AMS_FLAG_ENDIF";
                } else if ($1 == "each") {
                    _a = "AMS_FLAG_EACH";
                    _b = "AMS_FLAG_ENDEACH";
                } else if ($1 == "js") {
                    _a = "AMS_FLAG_JS";
                    _b = "AMS_FLAG_ENDJS";
                }
                _str = _tpl.replace(flagPart, _a + "$1" + _b);
                if ($1 === "if") _str = replaceElse(_str);
                tpl = tpl.replace(_tpl, _str);
            } else {
                //_str = _tpl.substring(0, _tpl.length - 4) + "echo(\"#e\"+\"nd\")";
                _str = _tpl.substring(0, _tpl.length - 4);
                tpl = tpl.replace(_tpl, _str);
            }
            _translateIf();
        }
        _translateIf();
        //接下来分析模板
        function replaceEcho(_value) {
            var re = /[\\]+#\{([^}]+)\}/gm;
            tpl = _value.replace(re, "AMS_VARIABLE_COMMENT$1}");
            tpl = tpl.replace(/#\{([^}]+)\}/gm, "AMS_PLACEHOLDER_START--$1--AMS_PLACEHOLDER_END");
        }
        replaceEcho(tpl);
        return tpl;
    }
    //寻找变量值
    function transportOperation(tpl) {
        var re = /(AMS_FLAG_IF|AMS_FLAG_ELSEIF){1}(?:[\s]*([^)]+?\)))(.*?)(?=AMS_FLAG_ELSEIF|AMS_FLAG_ELSE|AMS_FLAG_ENDIF|AMS_FLAG_EACH|AMS_FLAG_JS|[\r\n])/gm;
        tpl = tpl.replace(re, "$1AMS_OPERATION--$2--AMS_OPERATION$3");
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
                tpl = tpl.replace(str, "AMS_FLAG_JS" + encodeURIComponent(_s[1]) + "AMS_FLAG_ENDJS");
            }
        }
        return tpl;
    }
    function transportVar(tpl) {
        tpl = tpl.replace(/^[\s]*#run(.+?)$/gm, "AMS_RUN_START$1AMS_RUN_END");
        return tpl;
    }
    //检查IF标签配对
    var OPEN_IF = [ "AMS_FLAG_IFAMS_OPERATION", "AMS_FLAG_ELSEIFAMS_OPERATION" ];
    var CLOSE_IF = "AMS_OPERATION";
    var IF_FLAG = new RegExp("" + "(" + OPEN_IF[0] + "--(?:.+?)--" + CLOSE_IF + "|" + OPEN_IF[1] + "--(?:.+?)--" + CLOSE_IF + "|" + "AMS_FLAG_EACH(?:\\([^)]+?\\))|" + "AMS_PLACEHOLDER_START" + "--(?:.+?)--" + "AMS_PLACEHOLDER_END|" + "AMS_FLAG_JS(?:.+?)AMS_FLAG_ENDJS|" + "AMS_RUN_START(?:.+?)AMS_RUN_END|" + "AMS_FLAG_ELSE|AMS_FLAG_ENDIF|AMS_FLAG_ENDEACH)", "gm");
    var forEachRe = /AMS_FLAG_EACH\((.+?)[\s]+in[\s]+([^\s]+)\)/;
    function render(value, AMS_DATA) {
        var tpl;
        var html;
        //头文件每次都更新
        var head = 'var AMS_RENDER=" ";\r\n;function echo(s){AMS_RENDER+=s;}\r\n';
        for (var k in AMS_DATA) {
            if (AMS_DATA.hasOwnProperty(k)) {
                //TODO：使用中括号
                head += "var " + k + " = AMS_DATA." + k + ";\r\n";
            }
        }
        //开始转换为JS
        var _tpl;
        //如果缓存中无值
        html = " ";
        tpl = translateIF(value);
        tpl = transportJS(tpl);
        tpl = transportOperation(tpl);
        tpl = transportVar(tpl);
        tpl = revertProtection(tpl);
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
                        html += _str.replace(/AMS_FLAG_IFAMS_OPERATION--(.+?)--AMS_OPERATION/g, "if $1 {");
                    } else if (/AMS_FLAG_ELSEIFAMS_OPERATION/.test(_str)) {
                        html += _str.replace(/AMS_FLAG_ELSEIFAMS_OPERATION--(.+?)--AMS_OPERATION/, "} else if $1 { ");
                    } else if (_str === "AMS_FLAG_ELSE") {
                        html += _str.replace(/AMS_FLAG_ELSE/, "} else {");
                    } else if (_str === "AMS_FLAG_ENDIF") {
                        html += _str.replace(/AMS_FLAG_ENDIF/gm, "}");
                    } else if (/AMS_FLAG_EACH/.test(_str)) {
                        html += _str.replace(forEachRe, function(_str) {
                            var match = _str.match(forEachRe);
                            var $1 = match[1].split(",");
                            var $2 = match[2];
                            //避免让嵌套的索引变量名重名，导致循环错误
                            var i = $1.length > 1 ? $1[1] : "index" + parseInt(Math.random() * 1e8, 10) + AMS_Index++;
                            //避免无休止的增长
                            if (AMS_Index > 999999999) AMS_Index = 0;
                            var arr = $1[2] ? $1[2] : $2;
                            //模拟ES5 中forEach的参数定义
                            return "" + (//如果存在forEach中第3个形参
                            $1[2] ? "var " + $1[2] + "=" + $2 + ";" : "") + "\r\n" + "for(var " + i + "=0;" + i + "<" + arr + ".length;" + i + "++){\r\n" + "var " + $1[0] + "=" + arr + "[" + i + "];\r\n";
                        });
                    } else if (_str === "AMS_FLAG_ENDEACH") {
                        html += _str.replace(/AMS_FLAG_ENDEACH/gm, "};");
                    } else if (/AMS_PLACEHOLDER_START/.test(_str)) {
                        html += _str.replace(/AMS_PLACEHOLDER_START--(.+?)--AMS_PLACEHOLDER_END/, "echo($1);");
                    } else if (/AMS_FLAG_JS/.test(_str)) {
                        _str.match(/AMS_FLAG_JS(.+?)AMS_FLAG_ENDJS/);
                        html += _str.replace(/AMS_FLAG_JS(.+?)AMS_FLAG_ENDJS/, decodeURIComponent(_str.match(/AMS_FLAG_JS(.+?)AMS_FLAG_ENDJS/)[1]) + "\r\n");
                    } else if (/AMS_RUN_START/.test(_str)) {
                        html += _str.replace(/AMS_RUN_START(.+?)AMS_RUN_END/, "$1");
                    }
                } else {
                    if (_str.length > 0) html += 'AMS_RENDER+="' + _str.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '";';
                }
                if (_str.length > 0) html += "\r\n";
                if (i === arr.length - 1) html += 'AMS_RENDER+="\\r\\n";';
            }
            html += "\r\n";
        }
        return eval(head + html);
    }
    if (module.exports) {
        module.exports = render;
    } else {
        window.template = template;
    }
});

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
define("template/template/1.0.0/split-debug", [], function(require, exports, module) {
    var split;
    // Avoid running twice; that would break the `nativeSplit` reference
    split = split || function(undef) {
        var nativeSplit = String.prototype.split, compliantExecNpcg = /()??/.exec("")[1] === undef, // NPCG: nonparticipating capturing group
        self;
        self = function(str, separator, limit) {
            // If `separator` is not a regex, use `nativeSplit`
            if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
                return nativeSplit.call(str, separator, limit);
            }
            var output = [], flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + (// Proposed for ES6
            separator.sticky ? "y" : ""), // Firefox 3+
            lastLastIndex = 0, // Make `global` and avoid `lastIndex` issues by working with a copy
            separator = new RegExp(separator.source, flags + "g"), separator2, match, lastIndex, lastLength;
            str += "";
            // Type-convert
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
            limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
            limit >>> 0;
            // ToUint32(limit)
            while (match = separator.exec(str)) {
                // `separator.lastIndex` is not reliable cross-browser
                lastIndex = match.index + match[0].length;
                if (lastIndex > lastLastIndex) {
                    output.push(str.slice(lastLastIndex, match.index));
                    // Fix browsers whose `exec` methods don't consistently return `undefined` for
                    // nonparticipating capturing groups
                    if (!compliantExecNpcg && match.length > 1) {
                        match[0].replace(separator2, function() {
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
                    separator.lastIndex++;
                }
            }
            if (lastLastIndex === str.length) {
                if (lastLength || !separator.test("")) {}
            } else {
                output.push(str.slice(lastLastIndex));
            }
            return output.length > limit ? output.slice(0, limit) : output;
        };
        // For convenience
        String.prototype.split = function(separator, limit) {
            return self(this, separator, limit);
        };
        return self;
    }();
    exports.split = split;
});

/*
 json2.js
 2012-10-08

 Public Domain.

 NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

 See http://www.JSON.org/js.html


 This code should be minified before deployment.
 See http://javascript.crockford.com/jsmin.html

 USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
 NOT CONTROL.


 This file creates a global JSON object containing two methods: stringify
 and parse.

 JSON.stringify(value, replacer, space)
 value       any JavaScript value, usually an object or array.

 replacer    an optional parameter that determines how object
 values are stringified for objects. It can be a
 function or an array of strings.

 space       an optional parameter that specifies the indentation
 of nested structures. If it is omitted, the text will
 be packed without extra whitespace. If it is a number,
 it will specify the number of spaces to indent at each
 level. If it is a string (such as '\t' or '&nbsp;'),
 it contains the characters used to indent at each level.

 This method produces a JSON text from a JavaScript value.

 When an object value is found, if the object contains a toJSON
 method, its toJSON method will be called and the result will be
 stringified. A toJSON method does not serialize: it returns the
 value represented by the name/value pair that should be serialized,
 or undefined if nothing should be serialized. The toJSON method
 will be passed the key associated with the value, and this will be
 bound to the value

 For example, this would serialize Dates as ISO strings.

 Date.prototype.toJSON = function (key) {
 function f(n) {
 // Format integers to have at least two digits.
 return n < 10 ? '0' + n : n;
 }

 return this.getUTCFullYear()   + '-' +
 f(this.getUTCMonth() + 1) + '-' +
 f(this.getUTCDate())      + 'T' +
 f(this.getUTCHours())     + ':' +
 f(this.getUTCMinutes())   + ':' +
 f(this.getUTCSeconds())   + 'Z';
 };

 You can provide an optional replacer method. It will be passed the
 key and value of each member, with this bound to the containing
 object. The value that is returned from your method will be
 serialized. If your method returns undefined, then the member will
 be excluded from the serialization.

 If the replacer parameter is an array of strings, then it will be
 used to select the members to be serialized. It filters the results
 such that only members with keys listed in the replacer array are
 stringified.

 Values that do not have JSON representations, such as undefined or
 functions, will not be serialized. Such values in objects will be
 dropped; in arrays they will be replaced with null. You can use
 a replacer function to replace those with JSON values.
 JSON.stringify(undefined) returns undefined.

 The optional space parameter produces a stringification of the
 value that is filled with line breaks and indentation to make it
 easier to read.

 If the space parameter is a non-empty string, then that string will
 be used for indentation. If the space parameter is a number, then
 the indentation will be that many spaces.

 Example:

 text = JSON.stringify(['e', {pluribus: 'unum'}]);
 // text is '["e",{"pluribus":"unum"}]'


 text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
 // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

 text = JSON.stringify([new Date()], function (key, value) {
 return this[key] instanceof Date ?
 'Date(' + this[key] + ')' : value;
 });
 // text is '["Date(---current time---)"]'


 JSON.parse(text, reviver)
 This method parses a JSON text to produce an object or array.
 It can throw a SyntaxError exception.

 The optional reviver parameter is a function that can filter and
 transform the results. It receives each of the keys and values,
 and its return value is used instead of the original value.
 If it returns what it received, then the structure is not modified.
 If it returns undefined then the member is deleted.

 Example:

 // Parse the text. Values that look like ISO date strings will
 // be converted to Date objects.

 myData = JSON.parse(text, function (key, value) {
 var a;
 if (typeof value === 'string') {
 a =
 /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
 if (a) {
 return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
 +a[5], +a[6]));
 }
 }
 return value;
 });

 myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
 var d;
 if (typeof value === 'string' &&
 value.slice(0, 5) === 'Date(' &&
 value.slice(-1) === ')') {
 d = new Date(value.slice(5, -1));
 if (d) {
 return d;
 }
 }
 return value;
 });


 This is a reference implementation. You are free to copy, modify, or
 redistribute.
 */
/*jslint evil: true, regexp: true */
/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
 call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
 getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
 lastIndex, length, parse, prototype, push, replace, slice, stringify,
 test, toJSON, toString, valueOf
 */
// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.
define("template/template/1.0.0/json2-debug", [], function(require, exports, module) {
    if (typeof JSON !== "object") {
        JSON = {};
    }
    (function() {
        "use strict";
        function f(n) {
            // Format integers to have at least two digits.
            return n < 10 ? "0" + n : n;
        }
        if (typeof Date.prototype.toJSON !== "function") {
            Date.prototype.toJSON = function(key) {
                return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null;
            };
            String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(key) {
                return this.valueOf();
            };
        }
        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, gap, indent, meta = {
            // table of character substitutions
            "\b": "\\b",
            "	": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            '"': '\\"',
            "\\": "\\\\"
        }, rep;
        function quote(string) {
            // If the string contains no control characters, no quote characters, and no
            // backslash characters, then we can safely slap some quotes around it.
            // Otherwise we must also replace the offending characters with safe escape
            // sequences.
            escapable.lastIndex = 0;
            return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
                var c = meta[a];
                return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
        }
        function str(key, holder) {
            // Produce a string from holder[key].
            var i, // The loop counter.
            k, // The member key.
            v, // The member value.
            length, mind = gap, partial, value = holder[key];
            // If the value has a toJSON method, call it to obtain a replacement value.
            if (value && typeof value === "object" && typeof value.toJSON === "function") {
                value = value.toJSON(key);
            }
            // If we were called with a replacer function, then call the replacer to
            // obtain a replacement value.
            if (typeof rep === "function") {
                value = rep.call(holder, key, value);
            }
            // What happens next depends on the value's type.
            switch (typeof value) {
              case "string":
                return quote(value);

              case "number":
                // JSON numbers must be finite. Encode non-finite numbers as null.
                return isFinite(value) ? String(value) : "null";

              case "boolean":
              case "null":
                // If the value is a boolean or null, convert it to a string. Note:
                // typeof null does not produce 'null'. The case is included here in
                // the remote chance that this gets fixed someday.
                return String(value);

              // If the type is 'object', we might be dealing with an object or an array or
                // null.
                case "object":
                // Due to a specification blunder in ECMAScript, typeof null is 'object',
                // so watch out for that case.
                if (!value) {
                    return "null";
                }
                // Make an array to hold the partial results of stringifying this object value.
                gap += indent;
                partial = [];
                // Is the value an array?
                if (Object.prototype.toString.apply(value) === "[object Array]") {
                    // The value is an array. Stringify every element. Use null as a placeholder
                    // for non-JSON values.
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || "null";
                    }
                    // Join all of the elements together, separated with commas, and wrap them in
                    // brackets.
                    v = partial.length === 0 ? "[]" : gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]";
                    gap = mind;
                    return v;
                }
                // If the replacer is an array, use it to select the members to be stringified.
                if (rep && typeof rep === "object") {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === "string") {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ": " : ":") + v);
                            }
                        }
                    }
                } else {
                    // Otherwise, iterate through all of the keys in the object.
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ": " : ":") + v);
                            }
                        }
                    }
                }
                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.
                v = partial.length === 0 ? "{}" : gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}";
                gap = mind;
                return v;
            }
        }
        // If the JSON object does not yet have a stringify method, give it one.
        if (typeof JSON.stringify !== "function") {
            JSON.stringify = function(value, replacer, space) {
                // The stringify method takes a value and an optional replacer, and an optional
                // space parameter, and returns a JSON text. The replacer can be a function
                // that can replace values, or an array of strings that will select the keys.
                // A default replacer method can be provided. Use of the space parameter can
                // produce text that is more easily readable.
                var i;
                gap = "";
                indent = "";
                // If the space parameter is a number, make an indent string containing that
                // many spaces.
                if (typeof space === "number") {
                    for (i = 0; i < space; i += 1) {
                        indent += " ";
                    }
                } else if (typeof space === "string") {
                    indent = space;
                }
                // If there is a replacer, it must be a function or an array.
                // Otherwise, throw an error.
                rep = replacer;
                if (replacer && typeof replacer !== "function" && (typeof replacer !== "object" || typeof replacer.length !== "number")) {
                    throw new Error("JSON.stringify");
                }
                // Make a fake root object containing our value under the key of ''.
                // Return the result of stringifying the value.
                return str("", {
                    "": value
                });
            };
        }
        // If the JSON object does not yet have a parse method, give it one.
        if (typeof JSON.parse !== "function") {
            JSON.parse = function(text, reviver) {
                // The parse method takes a text and an optional reviver function, and returns
                // a JavaScript value if the text is a valid JSON text.
                var j;
                function walk(holder, key) {
                    // The walk method is used to recursively walk the resulting structure so
                    // that modifications can be made.
                    var k, v, value = holder[key];
                    if (value && typeof value === "object") {
                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = walk(value, k);
                                if (v !== undefined) {
                                    value[k] = v;
                                } else {
                                    delete value[k];
                                }
                            }
                        }
                    }
                    return reviver.call(holder, key, value);
                }
                // Parsing happens in four stages. In the first stage, we replace certain
                // Unicode characters with escape sequences. JavaScript handles many characters
                // incorrectly, either silently deleting them, or treating them as line endings.
                text = String(text);
                cx.lastIndex = 0;
                if (cx.test(text)) {
                    text = text.replace(cx, function(a) {
                        return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                    });
                }
                // In the second stage, we run the text against regular expressions that look
                // for non-JSON patterns. We are especially concerned with '()' and 'new'
                // because they can cause invocation, and '=' because it can cause mutation.
                // But just to be safe, we want to reject all unexpected forms.
                // We split the second stage into 4 regexp operations in order to work around
                // crippling inefficiencies in IE's and Safari's regexp engines. First we
                // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
                // replace all simple value tokens with ']' characters. Third, we delete all
                // open brackets that follow a colon or comma or that begin the text. Finally,
                // we look to see that the remaining characters are only whitespace or ']' or
                // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
                if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
                    // In the third stage we use the eval function to compile the text into a
                    // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                    // in JavaScript: it can begin a block or an object literal. We wrap the text
                    // in parens to eliminate the ambiguity.
                    j = eval("(" + text + ")");
                    // In the optional fourth stage, we recursively walk the new structure, passing
                    // each name/value pair to a reviver function for possible transformation.
                    return typeof reviver === "function" ? walk({
                        "": j
                    }, "") : j;
                }
                // If the text is not JSON parseable, then a SyntaxError is thrown.
                throw new SyntaxError("JSON.parse");
            };
        }
    })();
    exports.JSON = JSON;
});
