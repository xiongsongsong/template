define(function (require, exports, module) {

    var template = require('../../src/template');

    String.prototype.rtrim = function () {
        return this.replace(/(^\s*)(\s*$)/g, '');
    }

    describe("empty string", function () {
        it("empty string", function () {
            expect(template('', {})).toBe('');
        });
        it("empty coment", function () {
            expect(template('\\#if', {}).trim()).toBe('#if');
        });
        it("empty line", function () {
            expect(template('\r\n\r\n', {}).trim()).toBe('');
        });
    });

    describe("#{name}", function () {
        it("template('#{age}', {age:23}", function () {
            expect(template('#{age}', {age:23}).trim()).toBe('23');
        });


    });

    describe("#if", function () {
        it("template('#if(num>21)true#end'", function () {
            expect(template('#if(num>21)true#end', {num:22}).trim()).toBe('true');
        });

        it("template('#if(num>13)>13#elseif(num<13)'", function () {
            expect(template('#if(num>13)>13#elseif(num<13)<13#end', {num:12}).trim()).toBe('<13');
        });

        it("template('#if(1>2) #elseif(2>3)#else1#end'", function () {
            expect(template('#if(1>2) #elseif(2>3)#else 1 #end', {}).trim()).toBe('1');
        });

        it("#each #if(item%2===0)#{item}#end", function () {
            expect(template('#js var a=[1,2,3,4,5,6]#end' +
                '#each(item in a)' +
                '#if(item%2===0)#{item}#end' +
                '#end', {}).trim()).toBe('246');
        });
    });

    describe("#each", function () {
        it("#each arr", function () {
            expect(template('#each(item,index in arr)#{item}#end', {arr:['a', 'b']}).trim()).toBe('ab');
        });

        it("#each item", function () {
            expect(template('#each(item,index in arr)#{index}#end', {arr:['a', 'b']}).trim()).toBe('01');
        });

        it("#each index", function () {
            expect(template('#each(item,index in arr)#{index+1}#end', {arr:['a', 'b']}).trim()).toBe('12');
        });
    });

    describe("#run", function () {
        it("echo('tpl')", function () {
            expect(template('#run echo("tpl")', {}).trim()).toBe('tpl');
        });

        it("#run var _arr=['d'','e''];", function () {
            expect(template('#run var _arr=["d","e"];\r\n#each(item in _arr)#{item}#end', {}).trim()).toBe('de');
        });

        it("#run var _arr=['d'','e''];", function () {
            expect(template('#run var _arr=["d","e"];\r\n#each(item in _arr)#{item}#end', {}).trim()).toBe('de');
        });
    });

    describe("#js", function () {

        it("#js var n=100; #end#js echo(n) #end", function () {
            expect(template('#js var n=100; #end#js echo(n) #end', {}).trim()).toBe('100');
        });
    });



});

