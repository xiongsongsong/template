/**
 * Created with JetBrains WebStorm.
 * User: 松松
 * Date: 13-5-7
 * Time: 上午11:45
 * To change this template use File | Settings | File Templates.
 */
define(function () {
    describe('#if分支', function () {
        it('#if', function () {
            trim(render('#if(n>2)n>2#end', {n: 3})).should.to.equal('n>2')
        });
        it('#if 带空格干扰', function () {
            trim(render('#if   ( n >  2 )    n>2    #end', {n: 3})).should.to.equal('n>2')
        });

        it('#if #else', function () {
            trim(render('#if(n>2)n>2#elsen<2#end', {n: 1})).should.to.equal('n<2')
        });

        it('#if #else空格干扰', function () {
            trim(render('#if   (  n > 2  ) n>2  #elsen<2 #end', {n: 1})).should.to.equal('n<2')
        });
        it('#if #elseif', function () {
            trim(render('#if   (  n > 2  ) #elseif(n===1)n=1 #elsen<2 #end', {n: 1})).should.to.equal('n=1')
        });

        it('#if多重分支', function () {
            trim(render('#if   (  n > 2  ) #elseif(n===1)n=1 #elseif(n===2) n=2 #elsen<2 #end', {n: 2})).should.to.equal('n=2')
        });

    })


});