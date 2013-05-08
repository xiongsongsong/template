/**
 * Created with JetBrains WebStorm.
 * User: 松松
 * Date: 13-5-7
 * Time: 下午2:05
 * To change this template use File | Settings | File Templates.
 */

define(function () {

    describe('注释', function () {

        it('#{item}', function () {
            trim(render('\\#{item}', {})).should.to.equal('#{item}')
        });

    })

});