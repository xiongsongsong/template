/**
 * Created with JetBrains WebStorm.
 * User: xiongsongsong
 * Date: 12-11-25
 * Time: 下午4:57
 * To change this template use File | Settings | File Templates.
 */
exports.convert = function (value,jsondata) {
    var htmlTpl = value.split(/$/gmi);
    var literal = /[\\]?#\{([^\}]+)\}/gmi;

    var html = [];
    var template = [];

    function echo(str) {
        var literalResult = str.match(literal);
        if (literalResult) {
            literalResult.forEach(function (r, index) {
                template.push("html.push('" + encodeURIComponent(str.substring(0, str.indexOf(r))) + "')");
                var variable = r.match(/{([^}]+)\}/)[1];
                //假设用户对一个不存在的变量进行
                if (r.indexOf('\\') > -1) {
                    template.push("html.push('" + encodeURIComponent(r.substring(r.indexOf('\\') + 1)) + "')");
                } else {
                    template.push("html.push((function(){ return typeof (" + variable + ")!=='undefined' ? " + variable + ":''  })( ))");
                }
                str = str.substring(str.indexOf(r) + r.length);
                if (index == literalResult.length - 1 && str.length > 0) {
                    template.push("html.push('" + encodeURIComponent(str) + "')")
                }
            });
        } else {
            template.push("html.push('" + encodeURIComponent(str) + "')");
        }
    }

    template.push('var jsondata=');
    template.push('' + JSON.stringify(jsondata) + '');

    var keyArr = Object.keys(jsondata.data[0]);

    keyArr.forEach(function (key) {
        template.push('var ' + key + ';');
    });

    htmlTpl.forEach(function (item, index) {
        var comment = /^[\s]*##/;
        var escape = /^[\s]*[\\]+[\s]*(#[\s\S]*)/;
        //JMS注释
        if (comment.test(item)) return;

        //转义
        if (escape.test(item)) {
            template.push(RegExp.$1);
            return
        }

        //优先替换script


        var _item = item.match(/^[\s]*#[\s]*(each|if|elseif|else|endif|end)((.)*)$/);
        if (_item) {
            switch (RegExp.$1) {

                case 'each':
                    template.push('jsondata.data.forEach(function(item,index,arr){');
                    keyArr.forEach(function (key) {
                        template.push('var ' + key + '=encodeURIComponent(item["' + key + '"])');
                    });
                    //魔术变量
                    template.push('var first =  (index == 0)');
                    template.push('var last = (index == arr.length - 1)');
                    template.push('var odd = (index % 2 == 0)');

                    break;
                case 'if':
                    template.push(RegExp.$1 + RegExp.$2 + '{');
                    break;
                case 'elseif':
                    template.push('}else if' + RegExp.$2 + '{');
                    break;
                case 'else':
                    template.push('}else{');
                    break;
                case 'endif':
                    template.push('}');
                    break;
                case 'end':
                    template.push('})');
                    break;
            }
        } else {
            echo(item);
        }
    });

    return template.join('\r\n');
}