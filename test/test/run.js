/**
 * Created with JetBrains WebStorm.
 * User: 松松
 * Date: 13-5-7
 * Time: 下午1:40
 * To change this template use File | Settings | File Templates.
 */
define(function () {
    describe('#run', function () {

        it('任意单行JS语句', function () {
            trim(render('#run var a=123;', {name: 123})).should.to.equal('')
        });

        it('声明变量并打印值', function () {
            trim(render('#run var a=123; echo(a); ', {arr: ['a', 'b', 'c', 'd']})).should.to.equal('123')
        });

    })

});