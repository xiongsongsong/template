# template

---

语法简洁、回归自然，易用的JavaScript模板引擎。

---

## API

test目录下也有下方的示例

```javascript
template('#{name}',{name:'arale'}); //output: arale
```

#### #{placeholder}

```javascript
template('#{name}',{name:'arale'}) //output: arale
template('#{name.substring(0,1)}',{name:'arale'})  //output: a
```

#### #if
```javascript
template('#if(n>1) n>1 #end',{n:2}) //output: n>1
template('#if(n>1) n>1 #elseif(n<1) n<1 #else #{n} #end',{n:1}); //output: 1
```

#### #if中的地雷

如果#if中 反括号有多个的情况，请按下方方式处理

```javascript

render('#if(2>(1+0\\) && 1>(0\\))(pass)#end', {n: 2}).should.to.equal('(pass)')

```

#### #each

\#each同ES5中arr.forEach中fn的参数定义，比如:#each(obj,index,arr in [1,2,3,4,5])。

```javascript
template('#each(item in arr)#{item}#end',{arr:['a','r','a','l','e']}); //output: arale
template('#each(n in arr)#if(n%2==0)#{n}#end#end',{arr:[1,2,3,4,5,6]}); //output: 246

```

#### 自定义方法 Helper

```javascript
render('#{ ubb ( name ) }', {name: "[IMG]a.gif[/IMG]", ubb: function (s) {
    return s.replace(/(?:\[IMG\])(.*)\[\/IMG\]/, '<img src="$1" />');
}}).should.to.equal('<img src="a.gif" />');
```

#### #run

书写单行任意JS代码，适合变量声明的场景。

```javascript
#run var arr=[1,2,3];
//之后可以在模板中直接使用
#each(n in arr) #{n} #end //output:123
```

#### #js

书写多行任意JS代码，适合复杂的场景。

```javascript
#js
var arr=['a','r','a','l','e'];
echo (arr.join('')); // output:arale
#end
```

### 一段模板展示

地雷：请特别留心模板#each示例中，i、j这两个变量为何要分别设置，因为#each本质使用for实现的。

````html

<h2>模板中提供的if else</h2>

#run var rand=Math.random();

#if(rand>.5)
    大于0.5
#else
    小于0.5
#end

<h2>\#each</h2>

#each(item,i in data)
<dl>
    <dt>第#{i+1}</dt>
    <ul>
        #if(item.files instanceof Array)
            #each(file,j,arr in item.files)
            <li>第 #{j+1} 个，总共#{arr.length}个</li>
            #end
        #end
    </ul>
    </dd>
</dl>
#end


<h2>\#run比较适合变量声明的场景</h2>
#run echo('系统时间：'+new Date().toLocaleString())
#run var hello="world";

<h2>\#js可以使用任何JS语法，适合做复杂的模板逻辑</h2>
#js
    var rand=Math.random();
    echo ('随机数：');
    echo (rand);
    if(rand>.5){
        echo('，大于.5')
    }else{
        echo('，小于.5')
}
#end


````

#### 转义

>使用反斜杠
>\\#if | \\#each | \\#end ...


* IE6也兼容

##历史

###1.1.0
* 增加模板注释，语法为 /^\s*##.*$/gmi
* 完善缓存功能，缓存模式下性能提高约50%