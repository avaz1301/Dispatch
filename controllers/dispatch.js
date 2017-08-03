"use strict"
var axios = require('axios');

var droneSpeed    = 20 //drone speed in km/h
var depotLat      = -37.816218;
var depotLong     = 144.964068;
var droneList     = [];
var occDroneList  = [];
var freeDroneList = [];
var packageList   = [];
var paired_list   = [];
var unpaired_list = [];

var initializeMatching = function(){
	retrieveDrones();
}

//fetch random drone list from API
var retrieveDrones = function(){
	axios.get('https://codetest.kube.getswift.co/drones')
	.then(function(res){
		droneList = res.data;
		// console.log('#Drones '+droneList.length);
		droneList.forEach(function(d){
			(d.packages.length>0)?occDroneList.push(d):freeDroneList.push(d);
		});
		console.log('OCC '+occDroneList.length);
		console.log('free '+freeDroneList.length);
		retrievePackages();
	})
	.catch(function(err){
		console.log(err);
	});
	return droneList;
}

//fetch random package list from API
var retrievePackages = function(){
	axios.get('https://codetest.kube.getswift.co/packages')
	.then(function(res){
		packageList=res.data;
		console.log('#Packages '+packageList.length)
		matchPackage();
	})
	.catch(function(err){
		console.log(err);
	});
	return packageList;
}

var matchPackage = function(){
	//first find a free drone to pair with
	packageList.forEach(function(p){
		console.log("PID: "+p.packageId);
		var match = false;
		for (var i = freeDroneList.length - 1; i >= 0; i--) {
			console.log("START FREE LIST");
			match = isMatch(freeDroneList[i],p);
			if(match){
				paired_list.push({
					"droneId": freeDroneList.splice(i, 1)[0].droneId,
					"packageId": p.packageId
				});
				break;
			}
		}
		if(freeDroneList.length <= 0){
			match = false;
			console.log("START OCC LIST");
			for (var i = occDroneList.length - 1; i >= 0; i--) {
				match = isOccMatch(occDroneList[i],p);
				if(match){
					paired_list.push({
						"droneId": occDroneList.splice(i, 1)[0].droneId,
						"packageId": p.packageId
					});
					break;
				}
			}
		}
		if(!match){unpaired_list.push({"packageId": p.packageId})}
		console.log("\n");
	});
	console.log(JSON.stringify(paired_list));
	console.log("\n");
	console.log(JSON.stringify(unpaired_list));	
	return {
		"paired_list": paired_list,
		"unpaired_list": unpaired_list
	}
	//if no free drones pair with quickest occupied drone
}

var isOccMatch = function(drone, pack){
	var flag     = false;
	var ttl_dist = distanceBetweenPointsKm(drone.location.latitude, drone.location.longitude, drone.packages[0].destination.latitude, drone.packages[0].destination.longitude) 
		+ distanceBetweenPointsKm(drone.packages[0].destination.latitude, drone.packages[0].destination.longitude, depotLat, depotLong) 
		+ distanceBetweenPointsKm(depotLat, depotLong, pack.destination.latitude, pack.destination.longitude);
	var now      = Math.floor(new Date().getTime()/1000);
	var del_time = now + calculateTransportTime(ttl_dist);
	(del_time < pack.deadline)? flag = true : flag = false;
	if(flag){
		console.log("DISTANCE: "+dist+"\nTIME: "+now+"\nARRIVAL: "+del_time+"\nDEADLINE: "+pack.deadline+"\n");
	}else{
		console.log("NOT MATCH:\n ARRIVAL: "+del_time + "\nDEADLINE: "+pack.deadline+"\n");
	}
	return flag;
}

var isMatch = function(drone, pack){
	var flag     = false;
	var dist     = distanceBetweenPointsKm(drone.location.latitude, drone.location.longitude, pack.destination.latitude, pack.destination.longitude);
	var now      = Math.floor(new Date().getTime()/1000);
	var del_time = now + calculateTransportTime(dist);
	(del_time < pack.deadline)? flag = true : flag = false;
	if(flag){
		console.log("DISTANCE: "+dist+"\nTIME: "+now+"\nARRIVAL: "+del_time+"\nDEADLINE: "+pack.deadline+"\n");
	}else{
		console.log("NOT MATCH:\n ARRIVAL: "+del_time + "\nDEADLINE: "+pack.deadline+"\n");
	}
	return flag;
}

var convertUnixTime = function(unix_timestamp){
	var date = new Date(unix_timestamp*1000);
	console.log(date);
}

var calculateTransportTime = function(dist){
	return Math.floor((dist/droneSpeed)*3600); // km/(km/hr) => returns time in sec
}

//:::  Worldwide cities and other features databases with latitude longitude  :::
//:::  are available at http://www.geodatasource.com             
var distanceBetweenPointsKm = function(lat1, long1, lat2, long2){
	var radlat1  = lat1 * Math.PI/180;
	var radlat2  = lat2 * Math.PI/180;
	var theta    = long1-long2;
	var radtheta = theta * Math.PI/180;
	var distance = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	distance     = Math.acos(distance);
	distance     = distance * 180/Math.PI;
	distance     = distance * 60 * 1.1515;
	distance     = distance * 1.609344;
	return distance; //distance in km
}

module.exports = {
	initializeMatching: initializeMatching,
	retrieveDrones: retrieveDrones,
	retrievePackages:retrievePackages
}