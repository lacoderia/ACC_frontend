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

var map, mapOptions, currentLocation, currentLocationMarker, Marker, GeoMarker, watchId, timeOutAlert=200;
var sesion, pagina;

function initHeaderAndFooter(){
	
	var head = '<div id="nombre"><p>Bienvenido </p><p>Juan</p></div>';
	head += '<div id="placa"><p>Pico y placa </p><p>1-3-5-7-9</p></div>';
	
	var elemArray = document.getElementsByClassName('header');
    for(var i = 0; i < elemArray.length; i++){
        var elem = elemArray[i];
        elem.innerHTML = head;
    }
    
	var foot = '<a href="#menu-lateral" data-transition="slide-to-right" data-prefetch="true"><img src="img/Botones/menu-lateral.png"></a>';
	foot += '<a onclick="showMenu()"><img src="img/Botones/menu-popup.png"></a>';
	var elemArray = document.getElementsByClassName('footer');
    for(var i = 0; i < elemArray.length; i++){
    	var elem = elemArray[i];
        elem.innerHTML = foot;
    }
    initMap();
}

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

function validarSesion(){
	sesion = setCache('user');
	if(sesion != undefined || sesion != null || sesion != ""){
		$.mobile.changePage("#solicitar-servicio");
	}else{
		$.mobile.changePage("#login");
	}
}

function validarSocio(page){
	hideMenu();
	pagina = page;
	$('#popupDialog').remove();
	setTimeout(function() {
		var message = 'Presiona "Si" para iniciar sesion o presiona "No" para continuar como invitado.';
		var title = "Es socio de ACC?";
		showAlert(title, message, {"true":"Si","false":"No"});
	}, timeOutAlert);
}

function showEmergencias() {
	var menuEmergencias = '<div data-role="popup" id="popupDialog2" data-overlay-theme="none" data-theme="a" data-dismissible="true">'+
					'<a><img src="img/Botones/ambulancia.png" /></a>'+
					'<a><img src="img/Botones/policia.png" /></a>'+
				'</div>';
	$('#menu-principal').empty();
	$(menuEmergencias).appendTo('#menu-principal');
}

function showMenu() {
    var menu = '<a href="" onclick=validarSocio("desvare") data-prefetch="true"><img src="img/Botones/desvare.png" /></a>'+
			    '<a href="" onclick=validarSocio("grua") data-prefetch="true"><img src="img/Botones/grua.png" /></a>'+
			    '<a href="" onclick="showEmergencias()" data-prefetch="true"><img src="img/Botones/emergencias.png" /></a>'+
			    '<a href=""><img src="img/Botones/acc.png" /></a>'+
			    '<a href="" data-prefetch="true"><img src="img/Botones/descuentos.png" /></a>'+
			    '<a href="" data-prefetch="true"><img src="img/Botones/trafico.png" /></a>'+
			    '<a href="" data-prefetch="true"><img src="img/Botones/parqueaderos.png" /></a>'+
			    '<a href="" data-prefetch="true"><img src="img/Botones/gasolineras.png" /></a>'+
			    '<a href=""><img src="img/Botones/diversion.png" /></a>';

    $('#menu-principal').empty();
    $(menu).appendTo('#menu-principal');
    
    $('.overlay').show();
    $('#menu-principal').show();
    
}

function hideMenu(){
	$('.overlay').hide();
    $('#menu-principal').hide();
}

function showAlert(title, message){
	showAlert(title, message, null);
}

function showAlert(title, message, buttons) {
	
    var popUp = '<div data-role="popup" id="popupAlert" data-overlay-theme="none" data-theme="a" data-dismissible="true">' +
                    '<div data-role="header" data-theme="a">' +
                        '<h1>' + title + '</h1>' +
                    '</div>' +
                    '<div class="popup-content">' +
                        '<p>' + message + '</p>' +
                    '</div>';
    
				    if(buttons && (sesion != undefined || sesion != null || sesion != "")){
				    	popUp += '<div class="popup-content">' +
				    	'<input type="button" onclick=redirige("#login") value="'+buttons['true']+'"/>'+
				    	'<input type="button" onclick=$("#popupAlert").popup("close") value="'+buttons['false']+'"/>'+
				    	'</div>';
				    }
				    
			popUp += '</div>';

    $(popUp).appendTo($.mobile.pageContainer);

    $('#popupAlert').trigger('create');

    $('#popupAlert').popup({
        afterclose: function( event, ui ) {
            $('#popupAlert').remove();
        },
        transition: 'pop'
    });
    $('#popupAlert').popup('open');
}

function redirige(pagina){
	window.location=pagina;
}

function enviar(){
	console.log(currentLocation.coords.latitude +","+ currentLocation.coords.longitude);
	$('.overlay').hide();
    $('#solicitar-servicio').hide();
}

function solicitarServicio() {
	
	$.mobile.changePage("#dashboard");
	
	$('.overlay').show();
    $('#solicitar-servicio').show();
}

function logIn(documentType, documentId, password) {

    documentType = documentType || $('#login-tipo-identificacion').val();
    documentId = documentId || $('#login-identificacion').val();
    password = password || $('#login-password').val();

    var rememberMe = $("#login-remember-me").is(':checked');

    var data = {
        "document_type": 'CC',
        "document_id": '12345',
        "password": '00000000'
    };

    showLoader();

    $.ajax({
        type: "POST",
        url: "http://166.78.117.195/login",
        data: data,
        dataType: "json",
        success: function(response) {
            if (response.success == true) {
                hideLoader();
                if(typeof(Storage)!=="undefined") {
                    localStorage.rememberMe = rememberMe;
                    setCache('user', response.user);
                }

                //$('#dashboard .ui-content').css('background-image', 'url(../img/company/chevron.jpg)');

                window.scrollTo(0,0);
                $.mobile.changePage($('#dashboard'), {transition: 'none'});
                //getDashboard();
                solicitarServicio();
            } else {
                hideLoader();
                showAlert('Iniciar sesión', response.message);
            }
        },
        error: function(error) {
            showAlert('Iniciar sesión', 'Hubo un error al iniciar la sesión. Intenta nuevamente.');
            hideLoader();
        }
    });
}

function logOut() {
    showLoader();

    var user = getCache('user');
    var data = {
        "auth_token": user.authentication_token
    };
    $.ajax({
        type: "POST",
        url: "http://166.78.117.195/logout",
        data: data,
        dataType: "json",
        success: function(response) {
            if (response.success == true) {
                hideLoader();
                clearCache();
                window.scrollTo(0,0);
                $.mobile.changePage($('#login'), {transition: 'none'});
            }
        },
        error: function(error) {
            showAlert('Cerrar sesión', 'Ocurrió un error al intentar cerrar la sesión. Intenta nuevamente.');
            hideLoader();
        }
    });
}

function showLoader() {
    $('.overlay').show();
    $('#loader').show();
}

function hideLoader() {
    $('.overlay').hide();
    $('#loader').hide();
}

//Funciones para persitencia de datos

function setCache(key, value) {
  if (isCache('rememberMe')) {
      window.localStorage.setItem(key, JSON.stringify(value));
  } else {
      window.sessionStorage.setItem(key, JSON.stringify(value));
  }

}

function getCache(key) {
  if (isCache('rememberMe')) {
      return JSON.parse(window.localStorage.getItem(key));
  } else {
      return JSON.parse(window.sessionStorage.getItem(key));
  }
}

function isCache(key) {
  return window.localStorage.getItem(key) !== null && window.localStorage.getItem(key) !== undefined;
}

function removeCache(key) {
    if (isCache('rememberMe')) {
        window.localStorage.removeItem(key);
    } else {
        window.sessionStorage.removeItem(key);
    }
}

function clearCache() {
    removeCache('user');
    removeCache('allRides');
    removeCache('rememberMe');
}
