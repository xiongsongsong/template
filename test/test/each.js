/**
 * Created with JetBrains WebStorm.
 * User: 松松
 * Date: 13-5-7
 * Time: 下午1:25
 * To change this template use File | Settings | File Templates.
 */
define(function () {
    describe('#each', function () {

        it('#each', function () {
            trim(render('#each(item in arr)#{item}#end', {arr: ['a', 'b', 'c']})).should.to.equal('abc')
        });

        it('输出索引', function () {
            trim(render('#each(item,index in arr)第#{index+1}个#{item}#end', {arr: ['a', 'b', 'c']})).should.to.equal('第1个a第2个b第3个c')
        });

        it('输出原数组长度', function () {
            trim(render('#each(item,index,_arr in arr)#{_arr.length}#end', {arr: ['a', 'b', 'c']})).should.to.equal('333')
        });

        it('#each配合#if使用', function () {
            trim(render('#each(item,index,_arr in arr)#if(index+1%2==0)#end#if(index%2==0)偶#else奇#end#{index}#end', {arr: ['a', 'b', 'c', 'd']})).should.to.equal('偶0奇1偶2奇3')
        });
        it('#each嵌套', function () {
            trim(render('#each(item,i in arr)#{i}#each(item2,i in item)#{i}#end#end', {arr: [
                [1, 2],
                [3, 4, 5, 6, 7],
                [5, 6]
            ]})).should.to.equal('001101234201')
        });
        it('#each嵌套不声明index', function () {
            trim(render('#each(item in arr)#{index}#each(item2 in item)#{index}#end#end', {arr: [
                [1, 2],
                [3, 4, 5, 6, 7],
                [5, 6]
            ]})).should.to.equal('001101234201')
        });

    })

});