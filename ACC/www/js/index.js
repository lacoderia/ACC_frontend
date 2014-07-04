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

function initHeaderAndFooter(){
	
	var head = '<div id="nombre"><p>Bienvenido </p><p>Juan</p></div>';
	head += '<div id="placa"><p>Pico y placa </p><p>1-3-5-7-9</p></div>';
	
	var elemArray = document.getElementsByClassName('header');
    for(var i = 0; i < elemArray.length; i++){
        var elem = elemArray[i];
        elem.innerHTML = head;
    }
	
	var foot = '<a href="#menu" data-transition="slide-to-right" data-prefetch="true"><img src="img/Botones/menu.png"></a><a><img src="img/Botones/share.png"></a>';
	var elemArray = document.getElementsByClassName('footer');
    for(var i = 0; i < elemArray.length; i++){
    	var elem = elemArray[i];
        elem.innerHTML = foot;
    }
}

var map, mapOptions, currentLocation, currentLocationMarker, Marker, GeoMarker, watchId;

function loadMapScript() {
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.id = "googleMaps"
	script.src = "https://maps.googleapis.com/maps/api/js?sensor=false&callback=initializeMap";
	document.body.appendChild(script);
}

function initializeMap(mapOptions) {
	
	var myLatlng = new google.maps.LatLng(currentLocation.coords.latitude, currentLocation.coords.longitude);
	var mapOptions = {
		center : myLatlng,
		zoom : 16,
		enableHighAccuracy: true,
		disableDefaultUI: true,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	
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
	GeoMarker.setMap(map);
	
	google.maps.event.trigger(map, 'resize');
	
	google.maps.event.addListener(GeoMarker, 'position_changed', function() {
		GeoMarker.setCircleOptions({'visible':false});
		map.panTo(GeoMarker.getPosition());
		GeoMarker.setCircleOptions({'visible':true});
	});
	
}

function onError(){
	
}

function onSuccess(position) {
	currentLocation = position;
	if (!map) {
		loadMapScript();
	}
}

function initMap(){
	navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

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