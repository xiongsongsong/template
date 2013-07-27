/**
 * Created with JetBrains WebStorm.
 * User: 松松
 * Date: 13-5-7
 * Time: 下午2:05
 * To change this template use File | Settings | File Templates.
 */

define(function () {

    describe('注释', function () {

        it('避免被解析', function () {
            trim(render('\\#{item}', {})).should.to.equal('#{item}')
        });

        it('避免被显示', function () {
            trim(render('##{item}', {})).should.to.equal('')
        });
        it('不显示的注释：干扰', function () {
            trim(render('##{item}#{item}', {item: "test"})).should.to.equal('')
        });
        it('不显示的注释：注释仅仅影响单行', function () {
            trim(render('##{item}\r\n#{item}', {item: "test"})).should.to.equal('test')
        });
        it('不显示的注释：不生效的注释', function () {
            trim(render('#{item}##{item}', {item: "test"})).should.to.equal('test#test')
        });
        it('不显示的注释：行前带空', function () {
            trim(render('   \t\r\n##{item}123\r\n456', {item: "test"})).should.to.equal('456')
        });
        it('不显示的注释：连续空白换行', function () {
            trim(render('   \t\r\n##{item}123\r\n##456\r\n#{item}\r\n##{item}', {item: "123"})).should.to.equal('123')
        });

    })

});