/**
 * Created with JetBrains WebStorm.
 * User: xiongsongsong
 * Date: 12-11-25
 * Time: 下午3:18
 * To change this template use File | Settings | File Templates.
 */

exports.init = function (app) {

    //Home
    app.get('/', function (req, res) {
        res.render('index')
    });

    //Create Page
    require('./create/').register(app);

};
