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
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        
    }
};


var map, mapOptions, currentLocation, currentLocationMarker, Marker, GeoMarker, watchId;

function loadMapScript() {
	//console.log("LOAD SCRIPT");
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.id = "googleMaps"
	script.src = "https://maps.googleapis.com/maps/api/js?sensor=false&callback=initializeMap";
	document.body.appendChild(script);
}

function initializeMap(mapOptions) {
	//console.log("INITIALIZE");
	var myLatlng = new google.maps.LatLng(currentLocation.coords.latitude, currentLocation.coords.longitude);
	var mapOptions = {
		center : myLatlng,
		zoom : 16,
		enableHighAccuracy: true,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	//document.getElementById('coords').innerHTML = myLatlng.toString();
	
	map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
	
	 var markerOpts = {
		'icon': {
		    'url': 'img/gpsloc.png',
		    'size': new google.maps.Size(34, 34),
		    'scaledSize': new google.maps.Size(17, 17),
		    'origin': new google.maps.Point(0, 0),
		    'anchor': new google.maps.Point(8, 8)
		    }
		};
	
	GeoMarker = new GeolocationMarker(map, markerOpts);
	/*Marker = new google.maps.Marker({
        position: myLatlng,
        map: map});*/
	/*GeoMarker.setMarkerOptions({visible: true, position: myLatlng, opacity: 1.0});
	GeoMarker.setCircleOptions({fillColor: '#808080'});*/
	//GeoMarker.setMinimumAccuracy(50);

	google.maps.event.addListenerOnce(GeoMarker, 'position_changed', function() {
		//alert("Position Changed");
		document.getElementById('coords').innerHTML = myLatlng.toString();
		map.setCenter(this.getPosition());
		map.fitBounds(this.getBounds());
	});
	
	google.maps.event.addListener(GeoMarker, 'geolocation_error', function(e) {
		alert('There was an error obtaining your position. Message: ' + e.message);
	});
	
	GeoMarker.setMap(map);
	
	//watchId = navigator.geolocation.watchPosition(centerMap); 
}

function onError(){
	
}

function onSuccess(position) {
	currentLocation = position;
	if (!map) {
		loadMapScript();
	}
}

function init(){
	navigator.geolocation.getCurrentPosition(onSuccess, onError);
}


/*function centerMap(location)
{
	var myLatlng = new google.maps.LatLng(currentLocation.coords.latitude,currentLocation.coords.longitude);
	map.setCenter(myLatlng);
	map.setZoom(16);

	//Marker.setPosition(myLatlng);
	alert(myLatlng.toString());
	document.getElementById('coords').innerHTML = myLatlng.toString(); 

	//navigator.geolocation.clearWatch(watchId);
}*/

var sesion, pagina;
function iniciarSesion(){
	sesion = true;
	if(pagina){
		console.log(pagina);
		//$.mobile.changePage(pagina);
	}
}

function terminarSesion(){
	sesion = false;
}

function validarSesion(page){
	pagina = page;
	if(sesion == true){
		$.mobile.changePage("#solicitar-servicio");
	}else{
		$.mobile.changePage("#login");
	}
}

function enviar(){
	console.log(currentLocation.coords.latitude +","+ currentLocation.coords.longitude);
}