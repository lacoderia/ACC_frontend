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
var trafficLayer, traffic_on = false;
var sesion, pagina;

function setHeader(){
	var head = '<div id="nombre_header"><p>Bienvenido </p></div>';
    
    var user = getCache("user");
    if(user != undefined){
    	head += '<div id="placa"><p>Pico y placa </p></div>';
    	$('#boton-cerrar-sesion').show();
    }else{
    	$('#boton-cerrar-sesion').hide();
    }
    
    var elemArray = document.getElementsByClassName('header');
    for(var i = 0; i < elemArray.length; i++){
        var elem = elemArray[i];
        elem.innerHTML = head;
    }
    
    if(user != undefined){
    	var nombre = "<p>" + user.first_name + "</p>";
    	//var placas = "<p>" + user.placas + "</p>";
		$("#nombre_header").append(nombre);
		//$('#contenedor_placa').append(placas);
    }
    
}

function initHeaderAndFooter(){
	
	setHeader();
    
	var foot = '<a onclick="showMenuLateral()" data-prefetch="true"><img src="img/Botones/menu-lateral.png"></a>';
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
	
	trafficLayer = new google.maps.TrafficLayer();
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

function validarSocio(page){
	hideMenu();
	pagina = page;
	
	setCache("servicio", pagina);
	
	$('#popupDialog').remove();
	var user = getCache("user");
	if(user != undefined){
		solicitarServicio();
	}else{
		setTimeout(function() {
			var message = 'Presiona "Si" para iniciar sesion o presiona "No" para continuar como invitado.';
			var title = "Es socio de ACC?";
			showAlert(title, message, {"true":"Si","false":"No", "true_func": 'redirige("#login")', "false_func": "solicitarServicio(true)"});
		}, timeOutAlert);
	}
}

function showEmergencias() {
	var menuEmergencias = '<div data-role="popup" id="popupDialog2" data-overlay-theme="none" data-theme="a" data-dismissible="true">'+
					'<a onclick=solicitarEmergencia("ambulancia") ><img src="img/Botones/ambulancia.png" /></a>'+
					'<a onclick=solicitarEmergencia("policia") ><img src="img/Botones/policia.png" /></a>'+
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
			    '<a href="" onclick="toggleTraffic()" data-prefetch="true"><img src="img/Botones/trafico.png" /></a>'+
			    '<a href="" data-prefetch="true"><img src="img/Botones/parqueaderos.png" /></a>'+
			    '<a href="" data-prefetch="true"><img src="img/Botones/gasolineras.png" /></a>'+
			    '<a href=""><img src="img/Botones/diversion.png" /></a>';

    $('#menu-principal').empty();
    $(menu).appendTo('#menu-principal');
    
    $('.overlay').addClass("dismissable");
    $('.overlay').show();
    $('#menu-principal').show();
    
}

function hideMenu(){
	var dismissable = $('.overlay').hasClass("dismissable");
	if(dismissable){
		$('.overlay').hide();
	}
    $('#menu-principal').hide();
}

function showMenuLateral(){
	$('#panel-menu-lateral').panel('open');
}

function hideMenuLateral(){
	$('#panel-menu-lateral').panel('close');
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
    
    				var user = getCache("user");
				    if(buttons && (user != undefined || user != null || user != "")){
				    	popUp += '<div class="popup-content">' +
				    	'<input type="button" onclick='+buttons['true_func']+' value="'+buttons['true']+'"/>'+
				    	'<input type="button" onclick='+buttons['false_func']+' value="'+buttons['false']+'"/>'+
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
    $('.overlay').removeClass("dismissable");
}

function hideAlert(){
	$('.overlay').hide();
	$('#popupAlert').remove();
}

function redirige(pagina){
	window.location=pagina;
}

function enviar(){
	if ( $("#solicitar-servicio-form").valid() ){
		console.log(currentLocation.coords.latitude +","+ currentLocation.coords.longitude);
		$('.overlay').hide();
	    $('#solicitar-servicio').hide();
	    
	    /*var data = {
	    		"nombre": $('#servicio_nombre').html(),
	    		"telefono": $('#servicio_telefono').html(),
	    		"placas": $('#servicio_placas').html(),
	    		"servicio": servicio
	    };*/
	    
	    var servicio = getCache("servicio");
	    var data = {
	    		"nombre": "Alberto",
	    		"telefono": "12345678",
	    		"placas": "ABC-123",
	    		"servicio": servicio
	    };
	    removeCache("servicio");
	    
	    showLoader();
	    $.ajax({
	        type: "POST",
	        url: "http://166.78.117.195/servicio",
	        data: data,
	        dataType: "json",
	        success: function(response) {
	            if (response.success == true) {
	                hideLoader();
	                
	                showAlert('Solicitud Realizada', response.message);
	                
	            } else {
	                hideLoader();
	                //showAlert('Error', 'Respuesta invalida: ' + response.message);
	            }
	        },
	        error: function(error) {
	            //showAlert('Error', 'No se pudo solicitar el servicio');
	        	showAlert("Solicitud Enviada", "Hemos recibido tu solicitud, en breve nos comunicaremos contigo");
	            hideLoader();
	        }
	    });
	}else{
		console.log("Form Invalid");
	}
    
}

function solicitarServicio(hay_alerta) {
	if(hay_alerta){
		$("#popupAlert").popup("close");
	}
	$.mobile.changePage("#dashboard");
	$('.overlay').removeClass("dismissable");
	$('.overlay').show();
	$('#solicitar-servicio').show();
}

function hideSolicitarServicio(){
	$('.overlay').addClass("dismissable");
	$('.overlay').hide();
    $('#solicitar-servicio').hide();
}

function continuarInvitado(){
	$.mobile.changePage($('#dashboard'), {transition: 'none'});
	solicitarServicio();
}

function logIn(documentType, documentId, password) {

    documentType = documentType || $('#login-tipo-identificacion').val();
    documentId = documentId || $('#login-identificacion').val();
    password = password || $('#login-password').val();

    var rememberMe = $("#login-remember-me").is(':checked');
    
    /*var data = {
        "document_type": 'CC',
        "document_id": '123',
        "password": '00000000'
    };*/
    
    var data = {
	    "document_type": documentType,
	    "document_id": documentId,
	    "password": password
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
                	window.localStorage.rememberMe = rememberMe;
                	//console.log("LOGIN rememberMe: "+ window.localStorage.rememberMe);
                	setCache('user', response.user);
                }
                window.scrollTo(0,0);
                $.mobile.changePage($('#dashboard'), {transition: 'none'});
                
                setHeader();
                $('#menu-lateral').show();
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
                $('#boton-cerrar-sesion').hide();
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
	//console.log("SET CACHE " + key + " , " + value);
	//console.log("localStorage(rememberMe) "+ window.localStorage.rememberMe);
	if (window.localStorage.rememberMe == "true") {
		//console.log("LOCAL");
		window.localStorage.setItem(key, JSON.stringify(value));
	} else {
		//console.log("SESION");
		window.sessionStorage.setItem(key, JSON.stringify(value));
	}
}

function getCache(key) {
  if (window.localStorage.rememberMe == "true") {
      return JSON.parse(window.localStorage.getItem(key));
  } else {
      return JSON.parse(window.sessionStorage.getItem(key));
  }
}

function isCache(key) {
  return window.localStorage.getItem(key) !== null && window.localStorage.getItem(key) !== undefined;
}

function removeCache(key) {
    if (window.localStorage.rememberMe == "true") {
        window.localStorage.removeItem(key);
    } else {
        window.sessionStorage.removeItem(key);
    }
}

function clearCache() {
    removeCache('user');
    removeCache('servicio');
    removeCache('rememberMe');
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
                setHeader();
                $.mobile.changePage($('#dashboard'), {transition: 'none'});
            }
        },
        error: function(error) {
            showAlert('Cerrar sesión', 'Ocurrió un error al intentar cerrar la sesión. Intenta nuevamente.');
            hideLoader();
        }
    });
}

$(document).on('pagebeforeshow', "#solicitar-servicio", function (event, data) {
	$("#solicitar-servicio-form").validate({
		errorPlacement: function(error, element) {
            error.appendTo(element.parent().parent().after());
        },
        rules: {
            servicio_nombre : {
            	required: true
            },
            servicio_telefono : {
            	required: true
            },
            servicio_placas : {
            	required: true
            }
        }
    }).resetForm();
});

function solicitarEmergencia(emergencia){
	setCache("Emergencia", emergencia);
	showAlert("Emergencia", "Deseas solicitar asistencia?", {"true":"Si", "false":"No", "true_func": 'llamar()', "false_func": "hideAlert()"});
	hideMenu();
}

function llamar(){
	var emergencia = getCache("Emergencia");
	hideAlert();
	if(emergencia == "ambulancia"){
		document.location.href = 'tel:+1-800-555-1234';
	}
	
	if(emergencia == "policia"){
		document.location.href = 'tel:+1-800-555-1234';
	}
}

$(document).on('pagebeforeshow', '#solicitar-servicio-form', function(){
    $("#solicitar-servicio-form").validate({
        errorPlacement: function(error, element) {
            error.appendTo(element.parent().parent().after());
        }
    });

});

jQuery.extend(jQuery.validator.messages, {
    required: "Este campo es requerido.",
    email: "Ingresa un email válido.",
    date: "Ingresa una fecha válida.",
    number: "Ingresa un número válido.",
    maxlength: jQuery.validator.format("No ingreses más de {0} caracteres."),
    minlength: jQuery.validator.format("Ingresa al menos {0} caracteres."),
    rangelength: jQuery.validator.format("Ingresa un valor de longitud entre {0} y {1}."),
    range: jQuery.validator.format("Ingresa un valor entre {0} y {1}."),
    max: jQuery.validator.format("Ingresa un valor menor o igual a {0}."),
    min: jQuery.validator.format("Ingresa un valor mayor o igual a {0}."),
    equalTo: jQuery.validator.format("El valor de la confirmación no es igual al de la contraseña.")
});

function toggleTraffic(){
	hideMenu();
	if(traffic_on == true){
		trafficLayer.setMap(null);
	}else{
		trafficLayer.setMap(map);
	}
	traffic_on = !traffic_on;
}
