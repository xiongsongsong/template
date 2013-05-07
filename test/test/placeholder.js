/**
 * Created with JetBrains WebStorm.
 * User: 松松
 * Date: 13-5-7
 * Time: 上午11:45
 * To change this template use File | Settings | File Templates.
 */
define(function () {

    var user = {
        name: 'template',
        green: {
            rgb: '#00ff00',
            like: ['#00ee00', '#00dddd', '#00cc00']
        }
    };

    describe('占位符', function () {

        it('测试单个占位符', function () {
            trim(tpl('#{name}', user)).should.to.equal(user.name)
        });

        it('字符串截取', function () {
            trim(tpl('#{name.substring(0,3)}', user)).should.to.equal('tem')
        });

        it('字符串长度', function () {
            trim(tpl('#{name.length}', user)).should.to.equal('8');
        });

        it('数组长度', function () {
            trim(tpl('#{green.like.length}', user)).should.to.equal('3');
        });
    })


});