/**
 * Created with JetBrains WebStorm.
 * User: xiongsongsong
 * Date: 12-11-18
 * Time: 下午3:04
 * To change this template use File | Settings | File Templates.
 */


var jsondata =

{"data":[
    {"name":"<b>王恺放</b>", "age":23, "msg":"四川的人儿<b>啊啊啊啊</b>"},
    {"name":"李四", "age":66, "msg":"敏感词"},
    {"name":"李四", "age":66, "msg":"敏感词"},
    {"name":"李四", "age":66, "msg":"敏感词"}
]}

var name;

var age;

var msg;

html.push('%20%20%20%20%3Cams%3Acustom%3E')

html.push('%0A%20%20%20%20%20%20%20%20%3Cul%3E')

jsondata.data.forEach(function (item, index, arr) {

    var name = encodeURIComponent(item["name"])

    var age = encodeURIComponent(item["age"])

    var msg = encodeURIComponent(item["msg"])

    var first = (index == 0)

    var last = (index == arr.length - 1)

    var odd = (index % 2 == 0)

    html.push('%0A%20%20%20%20%20%20%20%20%20%20%20%20%E5%A7%93%E5%90%8D')

    html.push((function () {
        return typeof (name) !== 'undefined' ? name : ''
    })())

    html.push('%20%E5%B9%B4%E9%BE%84%EF%BC%9A11%5C%5C%5C%23%23%23%20')

    html.push((function () {
        return typeof (age) !== 'undefined' ? age : ''
    })())

    html.push('%E5%B2%8133%20%E4%BD%93%E9%87%8D%EF%BC%9A')

    html.push((function () {
        return typeof (abc) !== 'undefined' ? abc : ''
    })())

    html.push('%20%E7%AC%AC%E4%BA%8C%E6%AD%A4%E5%B9%B4%E9%BE%84%EF%BC%9A')

    html.push((function () {
        return typeof (age) !== 'undefined' ? age : ''
    })())

    html.push('%EF%BC%81%E8%BF%98%E6%9C%89%E5%90%97%EF%BC%9F')

    if (first) {

        html.push('%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3E%E7%AC%AC%E4%B8%80%E4%B8%AA%3C%2Fli%3E')

    } else if (odd) {

        html.push('%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3E%E5%81%B6%E7%AB%96%E8%A1%8C%3C%2Fli%3E')

    } else if (!odd) {

        html.push('%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3E%E5%A5%87%E6%95%B0%E8%A1%8C%3C%2Fli%3E')

    }

    if (last) {

        html.push('%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3E%E6%9C%80%E5%90%8E%E4%B8%80%E4%B8%AA%3C%2Fli%3E')

    }

})

html.push('%0A%20%20%20%20%20%20%20%20%3C%2Ful%3E')

html.push('%0A%20%20%20%20%3C%2Fams%3Acustom%3E')

html.push('%0A')

alert(decodeURIComponent(html.join("")))