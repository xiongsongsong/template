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
        },
        arr: []
    };

    for (var i = 0; i < 1000; i++) {
        user.arr.push(Math.random());
    }


    describe('占位符', function () {

        it('测试单个占位符', function () {
            trim(render('#{name}', user)).should.to.equal(user.name)
        });


        it('字符串截取', function () {
            trim(render('#{name.substring(0,3)}', user)).should.to.equal('tem')
        });

        it('字符串长度', function () {
            trim(render('#{name.length}', user)).should.to.equal('8');
        });

        it('数组长度', function () {
            trim(render('#{green.like.length}', user)).should.to.equal('3');
        });

        it('自定义函数', function () {
            trim(render('#{func(name)}', {name: "arale", func: function (s) {
                return s.split('').join('|');
            }})).should.to.equal('a|r|a|l|e');
        });
    })


});