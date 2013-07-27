/**
 * Created with JetBrains WebStorm.
 * User: 松松
 * Date: 13-5-7
 * Time: 上午11:45
 * To change this template use File | Settings | File Templates.
 */
define(function () {
    describe('#if中的地雷', function () {

        it('#if中的括号：请特别注意反斜杠的运用，由于做不来词法分析，故if中涉及多个括号运算时，) 统一请更改为\\\\)，（最后一个除外）', function () {
            trim(render('#if(2>(1+0\\) && 1>(0\\))(pass)#end', {n: 2})).should.to.equal('(pass)')
        });
    })


});