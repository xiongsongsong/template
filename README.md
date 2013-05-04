# template

---

语法简洁、回归自然，易用的JavaScript模板引擎。

---

## API

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


#### #each

\#each同ES5中arr.forEach中fn的参数定义，比如:#each(obj,index,arr in [1,2,3,4,5])。

```javascript
template('#each(item in arr)#{item}#end',{arr:['a','r','a','l','e']}); //output: arale
template('#each(n in arr)#if(n%2==0)#{n}#end#end',{arr:[1,2,3,4,5,6]}); //output: 246

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

小心地雷：请特别留心模板#each示例中，i、j这两个变量为何要分别设置，因为#each本质使用for实现的。

````html

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

<h2>模板中提供的if else</h2>

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
````

#### 转义

>使用反斜杠
>\\#if | \\#each | \\#end ...


* IE6也兼容


## todo
* 增加缓存功能
* 模板注释
