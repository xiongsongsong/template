/**
 * Created with JetBrains WebStorm.
 * User: xiongsongsong
 * Date: 12-12-4
 * Time: 下午11:10
 * To change this template use File | Settings | File Templates.
 */

define(function (require, exports, module) {
    var jasmineEnv = jasmine.getEnv();

    jasmineEnv.updateInterval = 1000;

    var htmlReporter = new jasmine.HtmlReporter();

    jasmineEnv.addReporter(htmlReporter);

    jasmineEnv.specFilter = function (spec) {
        return htmlReporter.specFilter(spec);
    };

    var currentWindowOnload = window.onload;

    window.onload = function () {
        if (currentWindowOnload) {
            currentWindowOnload();
        }
        execJasmine();
    };

    function execJasmine() {
        jasmineEnv.execute();
    }


    require('./SpecHelper.js');

})