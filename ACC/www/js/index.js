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
        var iOS7 = window.device
            && window.device.platform
            && window.device.platform.toLowerCase() == "ios"
            && parseFloat(window.device.version) >= 7.0;

        if (iOS7) {
            StatusBar.hide();
        }

        navigator.splashscreen.hide();

        showLoader();
        setHeader();

        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }
};

var map, mapOptions, currentLocation, currentLocationMarker, Marker, GeoMarker, watchId;
var sesion, pagina;

function setHeader(){    
    var user = getCache("user");
    if(user != undefined){
    	$('#contenedor_nombre').html(user.first_name);
    	$('#contenedor_placa').html(user.placas);
        $('#contenedor_placa').show();
    	
    	$('#boton-cerrar-sesion').show();
    }else{
    	$('#boton-cerrar-sesion').hide();
        $('#contenedor_placa').show();
    }
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

    hideLoader();
	
	trafficLayer = new google.maps.TrafficLayer();
}

function onError(){
	showAlert('Error', 'Hubo un error al cargar el mapa. Intenta nuevamente');
}

function onSuccess(position) {
	currentLocation = position;
	if (!map) {
		loadMapScript();
	}
}

function solicitarServicio(pagina){
    hideMenu();
	setCache("servicio", pagina);
	
	var user = getCache("user");
	if(user != undefined){
        showServicios();
	} else {
        if(sesion != undefined || sesion != null || sesion != ""){
            var title = "¿Es socio de ACC?";
            var message = 'Presiona "Si" para iniciar sesion o presiona "No" para continuar como invitado.';
            showDialog(
                title,
                message,
                function(){
                    $.mobile.changePage($('#login'));
                },
                function(){
                    showServicios();
                }
            );
        }
	}
}

function hideMenu(){
    $('.menu').hide();
}

function exitMenu(e) {
    if ($(e.target).hasClass('menu') && $(e.target).hasClass('dismissable') ) {
        hideMenu();
    }
}

function showMenu() {
    hideMenu();
    $('#menu-principal').show();
}

function showEmergencias() {
    hideMenu();
    $('#menu-emergencias').show();
}

function showServicios() {
    hideMenu();
    $('#menu-servicio').show();
}

function showMenuLateral(){
	$('#panel-menu-lateral').panel('open');
}

function hideMenuLateral(){
	$('#panel-menu-lateral').panel('close');
}

function showAlert(title, message) {
    var popUp = '<div data-role="popup" id="popupAlert" data-overlay-theme="b" data-theme="a" data-dismissible="true">' +
                    '<div data-role="header" data-theme="a">' +
                        '<h1>' + title + '</h1>' +
                    '</div>' +
                    '<div class="popup-content">' +
                        '<p>' + message + '</p>' +
                    '</div>' +
                '</div>';

    $(popUp).appendTo($.mobile.pageContainer);

    $('#popupAlert').trigger('create');

    $('#popupAlert').popup({
        afterclose: function( event, ui ) {
            $('#popupAlert').remove();
        },
        transition: 'pop'
    });
    $('#popupAlert').popup('open');
    $('.overlay').show();
}

function showDialog(title, message, acceptFunction, cancelFunction) {
    var popUp = '<div data-role="popup" id="popupDialog" data-overlay-theme="b" data-theme="a" data-dismissible="false">' +
                    '<div data-role="header" data-theme="a">' +
                        '<h1>' + title + '</h1>' +
                    '</div>' +
                    '<div class="popup-content">' +
                        '<p>' + message + '</p>' +
                        '<div class="confirmation-buttons">' +
                            '<a href="#" class="cancel" data-role="button" data-inline="true" data-theme="a">No</a>' +
                            '<a href="#" class="ok" data-role="button" data-inline="true" data-theme="a">Si</a>' +
                        '</div>'+
                    '</div>' +
                '</div>';

    $(popUp).appendTo($.mobile.pageContainer);

    $('#popupDialog').trigger('create');

    $('#popupDialog').popup({
        afterclose: function( event, ui ) {
            $('#popupDialog').remove();
        },
        transition: 'pop'
    });

    $('#popupDialog a.ok').off('click');
    $('#popupDialog a.ok').on('click', function(){
        acceptFunction();
        $('#popupDialog').popup('close');
    });

    $('#popupDialog a.cancel').off('click');
    $('#popupDialog a.cancel').on('click', function(){
        cancelFunction();
        $('#popupDialog').popup('close');
    });

    $('#popupDialog').popup('open');
}

function enviarSolicitudServicio(){
	console.log(currentLocation.coords.latitude +","+ currentLocation.coords.longitude);
	hideMenu();
    
    var servicio = getCache("servicio");

    /*var data = {
     "nombre": $('#servicio_nombre').html(),
     "telefono": $('#servicio_telefono').html(),
     "placas": $('#servicio_placas').html(),
     "servicio": servicio
     };*/

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
                showAlert('Error', response.message);
            }
        },
        error: function(error) {
            showAlert('Error', 'No se pudo solicitar el servicio. Intenta nuevamente.');
            hideLoader();
        }
    });
}

function logIn(documentType, documentId, password) {

    documentType = documentType || $('#login-tipo-identificacion').val();
    documentId = documentId || $('#login-identificacion').val();
    password = password || $('#login-password').val();

    var rememberMe = $("#login-remember-me").is(':checked');

    /*var data = {
        "document_type": documentType,
        "document_id": documentId,
        "password": password
    };*/

    var data = {
        "document_type": 'CC',
        "document_id": '123',
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
                	window.localStorage.rememberMe = rememberMe;
                	//console.log("LOGIN rememberMe: "+ window.localStorage.rememberMe);
                	setCache('user', response.user);
                }
                window.scrollTo(0,0);
                $.mobile.changePage($('#dashboard'), {transition: 'none'});
                
                setHeader();
                $('#menu-lateral').show();
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
                setHeader();
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
