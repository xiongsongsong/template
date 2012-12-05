define(function (require) {

    var template = require('../src/template');

    function trim(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }


    describe("empty string", function () {
        it("empty string", function () {
            expect(template('', {})).to.equal('');
        });
        it("empty coment", function () {
            expect(template('\\#if', {}).trim()).to.equal('#if');
        });
        it("empty line", function () {
            expect(template('\r\n\r\n', {}).trim()).to.equal('');
        });
    });

    describe("#{name}", function () {
        it("template('#{age}', {age:23}", function () {
            expect(template('#{age}', {age:23}).trim()).to.equal('23');
        });
        it("template('#{age}', {age:23}", function () {
            expect(template('#{name.substring(0,1)}', {name:'arale'}).trim()).to.equal('a');
        });


    });

    describe("#if", function () {
        it("template('#if(num>21)true#end'", function () {
            expect(template('#if(num>21)true#end', {num:22}).trim()).to.equal('true');
        });

        it("template('#if(num>13)>13#elseif(num<13)'", function () {
            expect(template('#if(num>13)>13#elseif(num<13)<13#end', {num:12}).trim()).to.equal('<13');
        });

        it("template('#if(1>2) #elseif(2>3)#else1#end'", function () {
            expect(template('#if(1>2) #elseif(2>3)#else 1 #end', {}).trim()).to.equal('1');
        });

        it("#each #if(item%2===0)#{item}#end", function () {
            expect(template('#if(n>1) n>1 #end', {n:2}).trim()).to.equal('n>1');
        });

        it("template('#if(n>1) n>1 #elseif(n<1) n<1 #else #{n} #end',{n:1})", function () {
            expect(template('#if(n>1) n>1 #elseif(n<1) n<1 #else #{n} #end', {n:1}).trim()).to.equal('1');
        });

        it("#each(item in arr) #{item} #end',{arr:['a','r','a','l','e']}", function () {
            expect(template('#each(item in arr)#{item}#end', {arr:['a', 'r', 'a', 'l', 'e']}).trim()).to.equal('arale');
        });
        it("#each(item in arr) #{item} #end',{arr:['a','r','a','l','e']}", function () {
            expect(template('#each(n in arr)#if(n%2==0)#{n}#end#end', {arr:[1, 2, 3, 4, 5, 6]}).trim()).to.equal('246');
        });

        it("#run var arr=[1,2,3];\r\n#each(n in arr)#{n}#end ", function () {
            expect(template('#run var arr=[1,2,3];\r\n#each(n in arr)#{n}#end').trim()).to.equal('123');
        });

        it("#js var arr=['a','r','a','l','e'];  echo (arr.join(''));  #end", function () {
            expect(template('#js var rrrrrr=["a","r","a","l","e"];   #end#js  echo (rrrrrr.join(""));  #end').trim()).to.equal('arale');
        });

        it("#each #if(item%2===0)#{item}#end", function () {
            expect(template('#js var a=[1,2,3,4,5,6]#end' +
                '#each(item in a)' +
                '#if(item%2===0)#{item}#end' +
                '#end', {}).trim()).to.equal('246');
        });
    });

    describe("#each", function () {
        it("#each arr", function () {
            expect(template('#each(item,index in arr)#{item}#end', {arr:['a', 'b']}).trim()).to.equal('ab');
        });

        it("#each item", function () {
            expect(template('#each(item,index in arr)#{index}#end', {arr:['a', 'b']}).trim()).to.equal('01');
        });

        it("#each index", function () {
            expect(template('#each(item,index in arr)#{index+1}#end', {arr:['a', 'b']}).trim()).to.equal('12');
        });

        it("\\#each(a,b as item)", function () {
            expect(template('\\#each(a,b as item)', {}).trim()).to.equal('#each(a,b as item)');
        });
    });

    describe("#run", function () {
        it("echo('tpl')", function () {
            expect(template('#run echo("tpl")', {}).trim()).to.equal('tpl');
        });

        it("\\#run var a=123", function () {
            expect(template('\\#run var a=123', {}).trim()).to.equal('#run var a=123');
        });

        it("#run var _arr=['d'','e''];", function () {
            expect(template('#run var _arr=["d","e"];\r\n#each(item in _arr)#{item}#end', {}).trim()).to.equal('de');
        });

        it("#run var _arr=['d'','e''];", function () {
            expect(template('#run var _arr=["d","e"];\r\n#each(item in _arr)#{item}#end', {}).trim()).to.equal('de');
        });
    });

    describe("#js", function () {

        it("#js var n=100; #end#js echo(n) #end", function () {
            expect(template('#js var n=100; #end#js echo(n) #end', {}).trim()).to.equal('100');
        });
    });


})
