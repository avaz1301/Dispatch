var express = require('express');
var router = express.Router();
var dispatch = require('../controllers/dispatch');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/gather', function(req,res){
	//1.get drones, 2.get packages, 
	//3.match packagees to drones,
	//4.render results 
	dispatch.initializeMatching()
	.then(function(data){
		return dispatch.promiseDrone();
	}).then(function(data){
		return dispatch.promisePackage();
	}).then(function(data){
		return dispatch.promisematchPackage();
	}).then(function(data){
		//take resulting lists and render to page
		res.render('result', { list: data });
	}).catch(function(err){
		console.log("Error: "+err);
		res.status(500).send(err);
	})
});

router.get('/dispatch', function(req,res){
	//1.get drones, 2.get packages, 
	//3.match packagees to drones,
	//4.render results 
	dispatch.initializeMatching()
	.then(function(data){
		return dispatch.promiseDrone();
	}).then(function(data){
		return dispatch.promisePackage();
	}).then(function(data){
		return dispatch.promisematchPackage();
	}).then(function(data){
		//take resulting lists and render to page
		res.setHeader('Content-Type', 'application/json');
    	res.status(200).send(JSON.stringify({ data: data },null,3));
	}).catch(function(err){
		console.log("Error: "+err);
		res.status(500).send(err);
	})
});
module.exports = router;
