---

````js
//一般放置在页尾：
seajs.use(['template'], function(template) {
   template('#{k} #each(item,index in data) #{item} #end',{k:v,data:['a','b'] });
});
````
