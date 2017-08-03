var express = require('express');
var router = express.Router();
var Bluebird = require('bluebird');
var dispatch = require('../controllers/dispatch');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/gather', function(req,res){
	console.log('ROUTE B4 INIT');
	dispatch.initializeMatching(req.res);
	console.log('ROUTE AFTER INIT');
});






module.exports = router;
