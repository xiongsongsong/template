# 语法简单，易用的JavaScript模板引擎

```javascript

var obj={name:'template',data:['sea','js'] };

template('#{k} #each(item in data) #{item} #end' , obj);
```
## 特点

* 使用简单
* 嵌套
* 内建缓存

## 语法

### #{name}
```javascript
template('#{name}' , {name:"template"});
```

### #if
```javascript
var tpl='#if(year==2012) 龙年 #elseif(year===2013) 蛇年 #else >_< #end'

### #each
```javascript

var obj={ arr:['2012','2013'] }
var tpl='#each(item in arr) #{item}年 #end' //输出：2012年 2013年
var tpl='#each(item,i in arr) #{index+1}:#{item}年 #end' //输出：1:2012年 2:2013年
```

### #run
仅支持单行javascript语句
```javascript
 #run alert('hello');
 #run var a=123;
```
### 注释，在关键字前方加 \ 即可

### #js

 ####js  #end 之间可放置JavaScript代码

```javascript
  #js
    var name="template";
    echo (name);
  #end
```
请注意，echo可在当前位置直接输出变量值。

```javascript
\#each...
#if(a>123) \#elseif(..) #end
```