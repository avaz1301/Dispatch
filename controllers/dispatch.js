"use strict"
var axios    = require('axios');
var Bluebird = require('bluebird');

var now;
var droneSpeed    = 20 //drone speed in km/h
var depotLat      = -37.816218;
var depotLong     = 144.964068;
var droneList     = [];
var occDroneList  = [];
var freeDroneList = [];
var packageList   = [];
var paired_list   = [];
var unpaired_list = [];

//start function call sequence to initialize and complete
//drone matching
var initializeMatching = function(){
	var promise = new Bluebird(function(resolve, reject){
		now = Math.floor(new Date().getTime()/1000); //time currently
		resetAll();
		resolve();
	})
	return promise;
}

//fetch random drone list from API
var promiseDrone = function(){
	//promise obj. resolves when drones are retrieves
	//returns drone list
	var promise = new Bluebird(function(resolve, reject){
		axios.get('https://codetest.kube.getswift.co/drones')
		.then(function(res){
			droneList = res.data;
			droneList.forEach(function(d){
				(d.packages.length>0)?occDroneList.push(d):freeDroneList.push(d);
			});
			console.log('# Occupied Drones: '+occDroneList.length);
			console.log('# Free Drones: '+freeDroneList.length);
			resolve(droneList);
		})
		.catch(function(err){ 
			console.log(err);
			reject(err);
		});
	})
	return promise;
}

//fetch random package list from API
var promisePackage = function(){
	//promise obj. resolves when packages are retrieves
	//returns package list
	var promise = new Bluebird(function(resolve, reject){
		axios.get('https://codetest.kube.getswift.co/packages')
		.then(function(res){
			packageList=res.data;
			console.log('# Packages: '+packageList.length)
			resolve(packageList);
		})
		.catch(function(err){
			console.log(err);
			reject(err);
		});
	})
	return promise;
}

var promisematchPackage = function(){
	var promise  = new Bluebird(function(resolve,reject){
		//first find a free drone to pair with
		packageList.forEach(function(p){
			var match = false;
			//check through list of free drones
			for(var i = freeDroneList.length - 1; i >= 0; i--) {
				match = isMatch(freeDroneList[i],p);
				if(match){
					//add matched drone/package to paired list, remove paired drone
					//from respective list
					paired_list.push({
						"droneId": freeDroneList.splice(i, 1)[0].droneId,
						"packageId": p.packageId
					});
					break;
				}
			}
			//if no free drones, pair with viable occupied drone
			if(!match && freeDroneList.length <= 0){
				match = false;
				//check through list of occupied drones
				for(var i = occDroneList.length - 1; i >= 0; i--) {
					match = isOccMatch(occDroneList[i],p);
					if(match){
						//add matched drone/package to paired list, remove paired drone
						//from respective list
						paired_list.push({
							"droneId": occDroneList.splice(i, 1)[0].droneId,
							"packageId": p.packageId
						});
						break;
					}
				}
			}
			if(!match){unpaired_list.push({"packageId": p.packageId})}
		});
		console.log(JSON.stringify(paired_list));
		console.log("\n");
		console.log(JSON.stringify(unpaired_list));	
		//return lists of paired and unpaired packages
		resolve({
			"paired_list": paired_list,
			"unpaired_list": unpaired_list
		});
	})
	return promise;
}

//isOccmatch checks if occupied drone can arrive at 
//the destination before package deadline
var isOccMatch = function(drone, pack){
	var ttl_dist = distanceBetweenPointsKm(drone.location.latitude, drone.location.longitude, drone.packages[0].destination.latitude, drone.packages[0].destination.longitude) 
		+ distanceBetweenPointsKm(drone.packages[0].destination.latitude, drone.packages[0].destination.longitude, depotLat, depotLong) 
		+ distanceBetweenPointsKm(depotLat, depotLong, pack.destination.latitude, pack.destination.longitude);
	return canDeliver(ttl_dist, pack);
}

//isMatch checks if free drone can arrive at 
//the destination before package deadline
var isMatch = function(drone, pack){
	var dist = distanceBetweenPointsKm(drone.location.latitude, drone.location.longitude, depotLat, depotLong);
	return canDeliver(dist, pack)
}

var canDeliver = function(dist, pack){
	var flag=false;
	var del_time = now + calculateTransportTime(dist);
	(del_time < pack.deadline)? flag = true : flag = false;
	return flag;
}

//calcTransportTime find time of transport for a given 
//distance by (distance/speed)
var calculateTransportTime = function(dist){
	// km/(km/hr) => returns time in sec
	return Math.floor((dist/droneSpeed)*3600); 
}

var convertUnixTime = function(unix_timestamp){
	var date = new Date(unix_timestamp*1000);
	console.log(date);
}

// The distanceBetweenPointsKm makes use of the haversine formula,
// which calculates the distance between two points on a sphere. 
// Source: http://www.geodatasource.com             
var distanceBetweenPointsKm = function(lat1, long1, lat2, long2){
	var radlat1  = lat1 * Math.PI/180;
	var radlat2  = lat2 * Math.PI/180;
	var theta    = long1-long2;
	var radtheta = theta * Math.PI/180;
	var distance = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	distance     = Math.acos(distance);
	distance     = distance * 180/Math.PI;
	distance     = distance * 60 * 1.1515;
	//convert distance to km
	distance     = distance * 1.609344;
	return distance; //returned in km
}

//reset all arrays for next dispatch call
var resetAll = function(){
	droneList     = []; 
	occDroneList  = [];
	freeDroneList = [];
	packageList   = [];
	paired_list   = [];
	unpaired_list = [];
}

module.exports = {
	initializeMatching: initializeMatching,
	promiseDrone: promiseDrone,
	promisePackage: promisePackage,
	promisematchPackage: promisematchPackage
}