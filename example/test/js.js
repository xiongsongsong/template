/**
 * Created with JetBrains WebStorm.
 * User: 松松
 * Date: 13-5-7
 * Time: 下午1:50
 * To change this template use File | Settings | File Templates.
 */
define(function () {
    describe('#js', function () {

        it('多行JS', function () {
            trim(tpl('#js\r\n  var a=1235;\r\necho(a);  #end', {name: 123})).should.to.equal('1235')
        });
    })

});