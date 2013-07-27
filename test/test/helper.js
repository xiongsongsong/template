/**
 * Created with JetBrains WebStorm.
 * User: 松松
 * Date: 13-5-7
 * Time: 上午11:45
 * To change this template use File | Settings | File Templates.
 */
define(function () {

    describe('自定义方法 Helper', function () {

        it('自定义方法', function () {
            trim(render('#{ ubb ( name ) }', {name: "[IMG]a.gif[/IMG]", ubb: function (s) {
                return s.replace(/(?:\[IMG\])(.*)\[\/IMG\]/, '<img src="$1" />');
            }})).should.to.equal('<img src="a.gif" />');
        });
    })


});