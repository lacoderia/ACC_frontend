/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        StatusBar.overlaysWebView(false);
                
        $(document).on('pageinit', '#dashboard', function(){ 
			getDashboard();
			updateDashboard();
		});

		$(document).on('pageinit', '#search-ride', function(){ 
			getAllRides();
			updateAllRides();
		});
		
		$(document).on('pagebeforeshow', "#view-my-ride", function (event, data) {
    		var rideId = sessionStorage.rideId;
    		var ride = null;
    		
    		for(var i=0; i<myRides.length; i++) {
				if(myRides[i].id == rideId) {
					ride = myRides[i];
				}
			}
			
			if(ride != null) {
				$('#view-my-ride .view-my-ride-from').html(ride.from);
				$('#view-my-ride .view-my-ride-to').html(ride.to);
				$('#view-my-ride .view-my-ride-time').html(ride.time);
			} else {
				$.mobile.changePage($('#dashboard'), {transition: 'slide'});
				alert('There was an error retrieving the ride details.');
			}
		});

		$(document).on('pagebeforeshow', "#view-next-ride", function (event, data) {
    		var rideId = sessionStorage.rideId;
    		var ride = null;
    		
    		for(var i=0; i<nextRides.length; i++) {
				if(nextRides[i].id == rideId) {
					ride = nextRides[i];
				}
			}
			
			if(ride != null) {
				$('#view-next-ride .view-next-ride-from').html(ride.from);
				$('#view-next-ride .view-next-ride-to').html(ride.to);
				$('#view-next-ride .view-next-ride-time').html(ride.time);
			} else {
				$.mobile.changePage($('#dashboard'), {transition: 'slide'});
				alert('There was an error retrieving the ride details.');
			}
		});

		$(document).on('pagebeforeshow', "#view-ride", function (event, data) {
    		var rideId = sessionStorage.rideId;
    		var ride = null;
    		
    		for(var i=0; i<allRides.length; i++) {
				if(allRides[i].id == rideId) {
					ride = allRides[i];
				}
			}
			
			if(ride != null) {
				$('#view-ride .view-ride-from').html(ride.from);
				$('#view-ride .view-ride-to').html(ride.to);
				$('#view-ride .view-ride-time').html(ride.time);
			} else {
				$.mobile.changePage($('#dashboard'), {transition: 'slide'});
				alert('There was an error retrieving the ride details.');
			}
		});

		$(document).on('click', '#list-my-rides li', function(event, ui) {
			if(!$(this).attr('data-role')) {
				sessionStorage.rideId = $(this).attr('ride-id');
				$.mobile.changePage($('#view-my-ride'), {transition: 'slide'}); 
			}
		});
		
		$(document).on('click', '#list-next-rides li', function(event, ui) {
			if(!$(this).attr('data-role')) {
				sessionStorage.rideId = $(this).attr('ride-id');
				$.mobile.changePage($('#view-next-ride'), {transition: 'slide'}); 
			}
		});

		$(document).on('click', '#list-all-rides li', function(event, ui) {
			if(!$(this).attr('data-role')) {
				sessionStorage.rideId = $(this).attr('ride-id');
				$.mobile.changePage($('#view-ride'), {transition: 'slide'}); 
			}
		});
		
		$('#btn-add-ride').click(function() {
			myRides.push({'from':'New Ride', 'to':'Mi casa'});
			updateDashboard();
		    $.mobile.changePage($('#dashboard'), {transition: 'slide', reverse: 'true'}); 
		});
		
    }
};


var myRides = new Array();
var nextRides = new Array();
var allRides = new Array();

function showLoader() {
	$.mobile.loading('show');
}

function hideLoader() {
	$.mobile.loading('hide');
}

function getDashboard() {
	showLoader();
	myRides = [
		{
			'id': 1,
			'from': 'Mi casa', 
			'to': 'Tu casa',
			'time': '12:00'
		}
	];
	nextRides = [
		{
			'id': 2,
			'from': 'Mi casa', 
			'to': 'Tu casa',
			'time': '8:00'
		}
	];
}

function updateDashboard() {
	clearDashboard();
	var myRidesList = $('#list-my-rides');
	
	myRidesList.append($('<li data-role="list-divider" >Mis viajes publicados</li>'));
	for(var i=0; i<myRides.length; i++) {
		html = '<li ride-id="' + myRides[i].id + '"><a>' + myRides[i].from + '</a></li>';
		myRidesList.append($(html));
	}
	
	myRidesList.listview('refresh');
	
	var nextRidesList = $('#list-next-rides');
	
	nextRidesList.append($('<li data-role="list-divider" >Viajes a los que apliqu&eacute;</li>'));
	for(var i=0; i<nextRides.length; i++) {
		html = '<li ride-id="' + nextRides[i].id + '"><a>' + nextRides[i].from + '</a></li>';
		nextRidesList.append($(html));
	}
	
	nextRidesList.listview('refresh');
	
	setTimeout(function(){hideLoader();}, 2000);
}

function clearDashboard() {
	var myRidesList = $('#list-my-rides');
	var nextRidesList = $('#list-next-rides');
	
	myRidesList.html('');
	nextRidesList.html('');
}

function getAllRides() {
	showLoader();
	allRides = [
		{
			'id': 1,
			'from': 'Mi casa', 
			'to': 'Tu casa',
			'time': '12:00'
		},
		{
			'id': 2,
			'from': 'Mi casa', 
			'to': 'Tu casa',
			'time': '21:00'
		},
		{
			'id': 3,
			'from': 'Mi casa', 
			'to': 'Tu casa',
			'time': '2:00'
		}
	];
}

function updateAllRides() {
	clearAllRides();
	var allRidesList = $('#list-all-rides');
	
	allRidesList.append($('<li data-role="list-divider" >Todos los viajes</li>'));
	for(var i=0; i<allRides.length; i++) {
		html = '<li ride-id="' + allRides[i].id + '"><a>' + allRides[i].from + '</a></li>';
		allRidesList.append($(html));
	}
	
	allRidesList.listview('refresh');
	
	hideLoader();
}

function clearAllRides() {
	var allRidesList = $('#list-all-rides');

	allRidesList.html('');
}
