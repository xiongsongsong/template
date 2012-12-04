# 语法简单，易用的JavaScript模板引擎

目前正在准备编写用例，估计本周内放出。

```javascript

var obj={k:'template',data:['sea','js'] };

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

###each

```javascript
var obj={ arr:['2012','2013'] }
var tpl='#each(item in arr) #{item}年 #end' //输出：2012年 2013年
var tpl='#each(item,i in arr) #{index+1}:#{item}年 #end' //输出：1:2012年 2:2013年
```

 #if、#each可互相嵌套

### #run

支持单行javascript语句，例如在模板中声明变量

```javascript
 #run var a=123;
```

### #js

 #js  #end 之间可放置JavaScript代码

```javascript
  #js
    var name="template";
    echo (name);
  #end
```
请注意，echo可在当前位置直接输出变量值。

#end

为了让模板更简洁一些，并没有提供 #endif  #endeach 之类的结束标志，而统一采用 #end，因此请注意标签配对。

### 注释，在关键字前方加 \ 即可
```javascript
\#each...
#if(a>123) \#elseif(..) #end
```

### 性能和兼容性

template内建缓存，所以性能不错。并且兼容IE6。

### 关于这个模板引擎

初因是想做一个CMS系统，因此首要考虑模板的语法选择。ejs语法臃肿，jade语法怪异，或心理作祟。后来便考虑借鉴velocity语法简洁的思想。
不知不觉就做了这么个库。

*借鉴了velocity的语法，例如 #if  #end配对.
*借鉴了jade的语法，例如 #{name}
*感谢seaJS和spm
*感谢Google