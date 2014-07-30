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

var map, mapOptions, currentLocation, currentLocationMarker, Marker, GeoMarker, watchId;
var trafficLayer,
    showingtrafficLayer = false;

var sesion, pagina;
var followMe = true;

var discountMarkers =  new Array(),
    gasMarkers = new Array(),
    parkingMarkers = new Array(),
    funMarkers = new Array();

var showingDiscount = false,
    showingGas = false,
    showingParking = false,
    showingFun = false;

var markerConstants = {
    'DISCOUNTS' : 1,
    'GAS' : 2,
    'PARKING' : 3,
    'FUN' : 4
}


window.sessionStorage.previousPage = 'dashboard';

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
        showLoader();

        document.addEventListener("backbutton", onBackKeyDown, false);
        function onBackKeyDown(e) {
            e.preventDefault();
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError);


        $("#panel-menu-lateral").panel({ swipeClose: false });

        $("#panel-menu-lateral").panel({
            open: function( event, ui ) {
                $('#dashboard-header').slideUp(100);
                $('#dashboard-footer').slideUp(100);
            },
            close: function( event, ui ) {
                $('#dashboard-header').slideDown(100);
                $('#dashboard-footer').slideDown(100);
            }
        });

        $('.acc-btn-back').click(function() {
            window.scrollTo(0,0);
            $.mobile.changePage($('#' + $(this).attr('previous-page')));
        });
    }
};

$(document).on('click', '#map_canvas a[target="_blank"]', function(e){
    e.preventDefault();
    var url = $(this).attr('href');

    if( /Android/.test(navigator.appVersion) ){
        navigator.app.loadUrl(url, { openExternal:true });
    }else{
        window.open(url, '_system');
    }
});

$(document).on('pagebeforeshow', '#dashboard', function(){
    setHeader();
});

$(document).on('pageshow', '#dashboard', function(){
    $('#dashboard-header').slideDown(100);
});

$(document).on('pagebeforeshow', '#mi-cuenta', function(){
    var user = getCache("user");
    if(user == undefined){
        $.mobile.changePage($('#login'));
    }else{
    	//var num_socio = user.num_socio;
    	var nombre = user.first_name + " " + user.last_name;
    	//var vencimiento = user.vence;
    	
    	//$("#num-socio").html(num_socio);
    	$("#mi-cuenta-nombre").html(nombre);
    	//$("#vencimiento").html(vencimiento);
    }
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

/** Loader **/

function showLoader() {
    $('.overlay').show();
    $('#loader').show();
}

function hideLoader() {
    $('.overlay').hide();
    $('#loader').hide();
}


/** Funciones de Google Maps **/

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
		zoom : 4,
        minZoom: 4,
        maxZoom: 16,
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

    /*google.maps.event.addListener(GeoMarker, 'position_changed', function() {
        GeoMarker.setCircleOptions({'visible':false});
        map.panTo(GeoMarker.getPosition());
        GeoMarker.setCircleOptions({'visible':true});
    });*/

    // Limitamos el panning a las máximas coordenadas del mundo
    /*var allowedBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(85, -180),
        new google.maps.LatLng(-85, 180)
    );
    var lastValidCenter = map.getCenter();

    google.maps.event.addListener(map, 'center_changed', function() {
        console.log(map.getCenter());
        if (allowedBounds.contains(map.getCenter())) {
            // still within valid bounds, so save the last valid position
            lastValidCenter = map.getCenter();
            return;
        }

        // not valid anymore => return to last valid position
        alert('a')
        map.panTo(lastValidCenter);
    });*/
	
	trafficLayer = new google.maps.TrafficLayer();
    hideLoader();
}

function onError() {
	showAlert('Error', 'Hubo un error al cargar el mapa. Intenta nuevamente');
}

function onSuccess(position) {
	currentLocation = position;
	if (!map) {
		loadMapScript();
	}
}

function clearForm(formId) {
    var form = $('#' + formId);
    form.find('input[type="text"]').each(function(){
       $(this).val('');
    });
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
    clearForm('menu-servicio-form');
    
    var user = getCache('user');
    if(user != undefined){
    	$("#servicio-nombre").val(user.first_name);
    	/*$("#servicio-telefono").val(user.telefono);
    	$("#servicio-placas").val(user.placas);*/
    	
    	/*var vehiculos = user.vehicles;
    	if (vehiculos){
    		var str = '<select id="plate" onchange="changePlate('+$(this).val()+')">';
    		str += '<option value="">Otra placa</option>';
    		for(vehicle in vehiculos){
    			str += '<option value="'+vehicle+'">'+vehicle+'</option>';
    		}
    		str += '</select>';
    		console.log(str);
    	}*/
    	
    }
    
    $('#menu-servicio').show();

    $("#menu-servicio-form").validate({
        errorPlacement: function(error, element) {
            error.appendTo(element.parent().after());
        }/*,
        rules: {
        	servicio_placas: {
    	      minlenght:6, 
    	      maxlength: 6
    	    }
        }*/
    }).reset();
}

function toggleFollowMe(){

    if (followMe) {
        google.maps.event.clearListeners(map, 'position_changed');
        followMe = false;
        alert('don\'t follow me!');
    } else {
        google.maps.event.addListener(GeoMarker, 'position_changed', function() {
            GeoMarker.setCircleOptions({'visible':false});
            map.panTo(GeoMarker.getPosition());
            GeoMarker.setCircleOptions({'visible':true});
            followMe = true;
        });
        alert('follow me!');
    }
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


/** Funciones de sesión del usuario **/

function logIn(documentType, documentId, password) {

    documentType = documentType || $('#login-tipo-identificacion').val();
    documentId = documentId || $('#login-identificacion').val();
    password = password || $('#login-password').val();

    var rememberMe = $("#login-remember-me").is(':checked');

    var data = {
        "document_type": documentType,
        "document_id": documentId,
        "password": password
    };

    /*var data = {
        "document_type": 'CC',
        "document_id": '12345',
        "password": '00000000'
    };*/

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
                $.mobile.changePage($('#' + window.sessionStorage.previousPage), {transition: 'none'});
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

/** Funciones del dashboard **/

function setHeader(){
    var user = getCache("user");
    if(user != undefined){
        $('#contenedor_nombre').html(user.first_name);
        $('#contenedor_placa').html(user.placas);
        $('#contenedor_placa').show();

        $('#boton-cerrar-sesion').show();
    }else{
        $('#contenedor_nombre').html('invitado(a)');
        $('#boton-cerrar-sesion').hide();
        $('#contenedor_placa').show();
    }
}


/** Funciones del menu lateral **/

function showMenuLateral(){
    $('#panel-menu-lateral').panel('open');
}

function hideMenuLateral(){
    $('#panel-menu-lateral').panel('close');
}

function showMiPerfil(){
    var user = getCache("user");
    if(user == undefined){
        window.sessionStorage.previousPage = 'mi-cuenta';
        $.mobile.changePage($('#login'));
    } else {
        $.mobile.changePage($('#mi-cuenta'));
    }
}

function showPrincipal(){
    $( "#panel-menu-lateral" ).panel('close');
    $.mobile.changePage($('#dashboard'));
}


/** Funciones del menu emergente **/

/** Solicitud de servicio **/

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
                    window.sessionStorage.previousPage = 'dashboard';
                    $.mobile.changePage($('#login'));
                },
                function(){
                    showServicios();
                }
            );
        }
    }
}

function changePlate(value){
    $("#mi-cuenta-placa").val(value);
}

function enviarSolicitudServicio(){
    //console.log(currentLocation.coords.latitude +","+ currentLocation.coords.longitude);
    if ( $("#menu-servicio-form").valid() ){
        hideMenu();

        var servicio = getCache("servicio");
        var is_guest = true;
        var user_id;
        var user = getCache('user');
        if(user != undefined){
            is_guest = false;
            user_id = user.id;
        }

        var data = { "roadside_assistance": {
            "name": $('#servicio_nombre').val(),
            "phone_number": $('#servicio_telefono').val(),
            "plate_number": $('#servicio_placas').val(),
            "assistance_type": servicio,
            "lat": currentLocation.coords.latitude,
            "long": currentLocation.coords.longitude,
            "is_guest": is_guest,
            "user_id": user_id
        }};

        /*var data = {
         "nombre": "Alberto",
         "telefono": "12345678",
         "placas": "ABC-123",
         "servicio": servicio
         };*/
        removeCache("servicio");

        showLoader();
        $.ajax({
            type: "POST",
            url: "http://166.78.117.195/roadside_assistances.json",
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
                console.log(error.responseText);
                showAlert('Error', 'No se pudo solicitar el servicio. Intenta nuevamente.');
                hideLoader();
            }
        });
    }
}


/** Tráfico **/

function toggleTrafficLayer(){
	hideMenu();
	if(showingtrafficLayer == true){
		trafficLayer.setMap(null);
	}else{
		trafficLayer.setMap(map);
	}
    showingtrafficLayer = !showingtrafficLayer;
}


/** Marcadores **/

function showMarkers(markerType, newMarkers){
    var markers = new Array();

	$.each(newMarkers, function(index, value) {
		var myLatlng = new google.maps.LatLng(value.lat, value.long);
		var marker = new google.maps.Marker({
		    position: myLatlng,
		    map: map,
		    optimized: false,
		    title: value.name
		});
        markers.push(marker);
    });

    switch (markerType) {
        case markerConstants.DISCOUNTS:
            discountMarkers = markers;
            break;
        case markerConstants.GAS:
            gasMarkers = markers;
            break;
        case markerConstants.PARKING:
            parkingMarkers = markers;
            break;
        case markerConstants.FUN:
            funMarkers = markers;
            break;
        default:
            break;
    }
}

function hideMarkers(markerType){
    var markers = new Array();

    switch (markerType) {
        case markerConstants.DISCOUNTS:
            markers = discountMarkers;
            break;
        case markerConstants.GAS:
            markers = gasMarkers;
            break;
        case markerConstants.PARKING:
            markers = parkingMarkers;
            break;
        case markerConstants.FUN:
            markers = funMarkers;
            break;
        default:
            break;
    }

	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
}

/** Descuentos **/

function getDiscounts(){
    showLoader();
    $.ajax({
        type: "GET",
        url: " http://166.78.117.195/locations.json?type_id=" + markerConstants.DISCOUNTS,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            hideLoader();
            showMarkers(markerConstants.DISCOUNTS, response);
        },
        error: function(error) {
            hideLoader();
            showAlert('Error', 'Hubo un error al obtener los descuentos cercanos.');
        }
    });
}

function toggleDiscounts(){
	hideMenu();
	if(showingDiscount == true){
		hideMarkers(markerConstants.DISCOUNTS);
	}else{
        getDiscounts();
	}
    showingDiscount = !showingDiscount;
}


/** Parqueaderos **/

function getParking(){
    showLoader();
    $.ajax({
        type: "GET",
        url: " http://166.78.117.195/locations.json?type_id=" + markerConstants.PARKING,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            hideLoader();
            showMarkers(markerConstants.PARKING, response);
        },
        error: function(error) {
            hideLoader();
            showAlert('Error', 'Hubo un error al obtener los parqueaderos cercanos.');
        }
    });
}

function toggleParking(){
    hideMenu();
    if(showingParking == true){
        hideMarkers(markerConstants.PARKING);
    }else{
        getParking();
    }
    showingParking = !showingParking;
}

/** Gasolineras **/

function getGas(){
    showLoader();
    $.ajax({
        type: "GET",
        url: " http://166.78.117.195/locations.json?type_id=" + markerConstants.GAS,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            hideLoader();
            showMarkers(markerConstants.GAS, response);
        },
        error: function(error) {
            hideLoader();
            showAlert('Error', 'Hubo un error al obtener las gasolineras cercanos.');
        }
    });
}

function toggleGas(){
    hideMenu();
    if(showingGas == true){
        hideMarkers(markerConstants.GAS);
    }else{
        getGas();
    }
    showingGas = !showingGas;
}

/** Diversión **/

function getFun(){
    showLoader();
    $.ajax({
        type: "GET",
        url: " http://166.78.117.195/locations.json?type_id=" + markerConstants.FUN,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            hideLoader();
            showMarkers(markerConstants.FUN, response);
        },
        error: function(error) {
            hideLoader();
            showAlert('Error', 'Hubo un error al obtener los puntos de diversión cercanos.');
        }
    });
}

function toggleFun(){
    hideMenu();
    if(showingFun == true){
        hideMarkers(markerConstants.FUN);
    }else{
        getFun();
    }
    showingFun = !showingFun;
}


/** Funciones para persitencia de datos **/

function setCache(key, value) {
    if (window.localStorage.rememberMe == "true") {
        window.localStorage.setItem(key, JSON.stringify(value));
    } else {
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