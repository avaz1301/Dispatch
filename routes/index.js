var express = require('express');
var router = express.Router();
var dispatch = require('../controllers/dispatch');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/gather', function(req,res){
	console.log('THIS IS IN ROUTE');
	dispatch.initializeMatching();
});

module.exports = router;
