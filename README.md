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
```javascript
template('#each(item in arr)#{item}#end',{arr:['a','r','a','l','e']}); //output: arale
template('#each(n in arr)#if(n%2==0)#{n}#end#end',{arr:[1,2,3,4,5,6]}); //output: 246

```

#### #run

单行javascript语句，需要独占一行，多行定义请用#js

```javascript
#run var arr=[1,2,3];
//之后可以在模板中直接使用
#each(n in arr) #{n} #end //output:123
```

#### #js

可以理解为html文件中的script标记

```javascript
#js
var arr=['a','r','a','l','e'];
echo (arr.join('')); // output:arale
#end
```

#### 模板清晰简洁

````html
#each(item in data)
    <dl>
        <dt>#{user[item.user_id]}</dt>
        <dd>
            #{item.content}
            <ul>
                #if(item.files)
                    #each(file,index,arr in item.files)
                        <li>#{index+1}: #{file}，一共有#{arr.length}个 </li>
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


## 性能 & 兼容性

* 内建缓存
* IE6也兼容


## todo
* 增加缓存功能
* 模板注释
