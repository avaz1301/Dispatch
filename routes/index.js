var express = require('express');
var router = express.Router();
var dispatch = require('../controllers/dispatch');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/gather', function(req,res){
	dispatch.initializeMatching(req.res);
});

module.exports = router;
