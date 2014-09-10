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
var followMe = false;

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

var markerActivity = {
    'discounts' : {
        'loadSuccess': false,
        'loadAttemp': false
    },
    'gas' : {
        'loadSuccess': false,
        'loadAttemp': false
    },
    'parking' : {
        'loadSuccess': false,
        'loadAttemp': false
    },
    'fun' : {
        'loadSuccess': false,
        'loadAttemp': false
    }
}


window.sessionStorage.acc_previousPage = 'dashboard';

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

        if (getCache('acc_rememberMe')) {
            logIn(true);
        } else {
            setUserName();
            navigator.geolocation.getCurrentPosition(onSuccess, onError);
        }

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

        $("#panel-menu-lateral").panel('open');

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


$(document).on('pagebeforeshow', '#sign-up', function(){
    clearSignUp();

    $("#sign-up-form").validate({
        errorPlacement: function(error, element) {
            error.appendTo(element.parent().parent().after());
        }
    }).resetForm();
});

$(document).on('pagebeforeshow', '#dashboard', function(){
    autosetPicoYPlaca();
});

$(document).on('pageshow', '#dashboard', function(){
    $('#dashboard-header').slideDown(100);
});

$(document).on('pagebeforeshow', '#profile', function(){
    var user = getCache('acc_user');

    clearProfile();

    $('#profile .profile-name').html(user.first_name + ' ' + user.last_name);
    $('#profile .profile-email').html(user.email);

    if (user.is_member) {
        var vehicleHTML = '<b>Mis vehículos</b><hr class="separator">';

        if (user.vehicles.length) {
            vehicleHTML += '<p>';

            for (var i=0; i<user.vehicles.length; i++) {
                var date = createDateFromMysql(user.vehicles[i].soat_date);
                vehicleHTML += '<div class="vehicle-item">' +
                    '<div class="vehicle-info">' +
                    '<div>Placas: ' + user.vehicles[i].plate_number + '</div>' +
                    '<div>Vencimiento SOAT: ' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + '</div>' +
                    '</div>' +
                    '<div class="vehicle-actions">' +
                    '<div class="delete-btn icon-cancel-circle" onclick="confirmDeleteVehicle(\'' + user.vehicles[i].plate_number + '\')"></div>' +
                    '</div>' +
                    '</div><hr>';
            }

            vehicleHTML += '</p>';
        } else {
            vehicleHTML += 'Actualmente no cuentas con vehículos registrados';
        }

        $('#profile .profile-vehicles').html(vehicleHTML);
    } else {
        var becomeMember = '<b>Hazte miembro de ACC</b><hr class="separator">'+
                '<p>Hemos detectado que no eres miembro de ACC, para volverte miembro por favor comunicate con nosotros.</p>' +
                '<p><a id="btn_call_acc" data-role="button" href="tel:0314895050" rel="external">Llamar a ACC</a></p>';

        $('#profile .profile-vehicles').html(becomeMember);

        $('#btn_call_acc').button();
    }


});

$(document).on('pageshow', '#lista-descuentos', function(){
    getDescuentos();
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
		zoom : 16,
        minZoom: 6,
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

    // Activamos la función follow me
    toggleFollowMe();

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
        map.panTo(lastValidCenter);
    });*/
	
	trafficLayer = new google.maps.TrafficLayer();

    // Obtenemos todos los puntos de interes

    getAllMarkers();

    if(isCache('acc_PicoYPlaca')){
        autosetPicoYPlaca();
    } else {
        showPicoYPlaca();
    }
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
    
    $("#menu-servicio-form").validate({
        errorPlacement: function(error, element) {
            error.appendTo(element.parent().after());
        }
    }).resetForm();
    
    
    var user = getCache('acc_user');
    if(user != undefined){
    	$("#servicio_nombre").val(user.first_name + " " + user.last_name);
    	
    	var vehiculos = user.vehicles;

    	if (vehiculos && vehiculos.length && user.is_member){
    		var str = '<select id="plate" class="required" onchange="changePlate()">';
    		str += '<option value="">Selecciona una placa</option>';
    		for(var i in vehiculos){
    			str += '<option value="' + vehiculos[i].plate_number + '">' + vehiculos[i].plate_number + '</option>';
    		}
    		str += '<option value="otra">Ingresa otra placa</option>';
    		str += '</select>';
    		
    		$('#servicio_placas').hide();
    		$('#servicio_placas_container').html(str);
            $('#servicio_placas_container').selectmenu();
    	}
    }
    
    $('#menu-servicio').show();

    $("#menu-servicio-form").validate({
        errorPlacement: function(error, element) {
            error.appendTo(element.parent().after());
        },
        rules: {
        	servicio_placas: {
    	      minlength:6, 
    	      maxlength: 6
    	    }
        }
    }).reset();
}

function toggleFollowMe(){
    if (followMe) {
        $('#btn-follow-me').removeClass('active');
        google.maps.event.clearListeners(GeoMarker, 'position_changed');
    } else {
        $('#btn-follow-me').addClass('active');
        google.maps.event.addListener(GeoMarker, 'position_changed', function() {
            GeoMarker.setCircleOptions({'visible':false});
            map.panTo(GeoMarker.getPosition());
            GeoMarker.setCircleOptions({'visible':true});
        });
    }
    followMe = !followMe;
}

function showAlert(title, message, onCloseFunction) {
    var popUp = '<div data-role="popup" id="popupAlert" data-overlay-theme="b" data-theme="a" data-dismissible="true">' +
                    '<div data-role="header" data-theme="a">' +
                        '<h1>' + title + '</h1>' +
                    '</div>' +
                    '<div class="ui-content">' +
                        '<p>' + message + '</p>' +
                    '</div>' +
                '</div>';

    $(popUp).appendTo($.mobile.pageContainer);

    $('#popupAlert').trigger('create');

    $('#popupAlert').popup({
        afterclose: function( event, ui ) {
            $('#popupAlert').remove();
            if (onCloseFunction !== undefined){
                onCloseFunction();
            }
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
                    '<div class="ui-content">' +
                        '<p>' + message + '</p>' +
                        '<br>' +
                        '<div class="confirmation-buttons">' +
                            '<a href="#" class="ok" data-role="button" data-theme="a">Iniciar sesión</a>' +
                            '<a href="#" class="cancel" data-role="button" data-theme="a">Continuar como invitado</a>' +
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

function logIn(autologin) {
    showLoader();

    var data = {}

    if (autologin == false) {
        var rememberMe = $("#login-remember-me").is(':checked');

        data = {
            "document_type": $('#login-tipo-identificacion').val(),
            "document_id": $('#login-identificacion').val(),
            "password": $('#login-password').val()
        };

        /*data = {
            "document_type": 'CC',
            "document_id": '12345',
            "password": '00000000'
        };*/

        $.ajax({
            type: "POST",
            url: "http://166.78.117.195/login",
            data: data,
            dataType: "json",
            success: function(response) {
                if (response.success == true) {
                    hideLoader();
                    if(typeof(Storage)!=="undefined") {
                        window.localStorage.acc_rememberMe = rememberMe;
                        setCache('acc_user', response.user);
                    }
                    window.scrollTo(0,0);
                    $.mobile.changePage($('#' + window.sessionStorage.acc_previousPage), {transition: 'none'});
                } else {
                    hideLoader();
                    showAlert('Iniciar sesión', response.message);
                }
                setUserName();
            },
            error: function(error) {
                setUserName();
                showAlert('Iniciar sesión', 'Hubo un error al iniciar la sesión. Intenta nuevamente.');
                hideLoader();
            }
        });
    } else {
        var user = getCache('acc_user');
        data = {
            "user_id": user.id,
            "auth_token" : user.authentication_token
        };

        $.ajax({
            type: "POST",
            url: "http://166.78.117.195/login",
            data: data,
            dataType: "json",
            success: function(response) {
                hideLoader();
                if (response.success == true) {
                    setCache('acc_user', response.user);
                } else {
                    clearCache();
                    showAlert('Iniciar sesión', response.message);
                }
                setUserName();
                navigator.geolocation.getCurrentPosition(onSuccess, onError);
            },
            error: function(error) {
                hideLoader();
                clearCache();
                showAlert('Iniciar sesión', 'Hubo un error al iniciar la sesión. Intenta nuevamente.');
                setUserName();
                navigator.geolocation.getCurrentPosition(onSuccess, onError);
            }
        });
    }
}

function logOut() {
    showLoader();

    var user = getCache('acc_user');

    if (user != undefined && user != null) {
        var data = {
            "user_id": user.id,
            "auth_token": user.authentication_token
        };
        $.ajax({
            type: "POST",
            url: "http://166.78.117.195/logout",
            data: data,
            dataType: "json",
            success: function(response) {
                hideLoader();
                clearCache();
                setUserName();
                window.scrollTo(0,0);
                $('#boton-cerrar-sesion').hide();
                $.mobile.changePage($('#dashboard'), {transition: 'none'});
            },
            error: function(error) {
                setUserName();
                showAlert('Cerrar sesión', 'Ocurrió un error al intentar cerrar la sesión. Intenta nuevamente.');
                hideLoader();
            }
        });
    } else {
        hideLoader();
        clearCache();
        setUserName();
        window.scrollTo(0,0);
        $('#boton-cerrar-sesion').hide();
        $.mobile.changePage($('#dashboard'), {transition: 'none'});
    }


}


/** Funciones de registro **/
function clearSignUp() {
    $('#sign_up_document_type').val('');
    $('#sign_up_document_type').selectmenu();
    $('#sign_up_document_type').selectmenu('refresh', true);
    $('#sign_up_document_id').val('');
    $('#sign_up_first_name').val('');
    $('#sign_up_last_name').val('');
    $('#sign_up_second_last_name').val('');
    $('#sign_up_phone').val('');
    $('#sign_up_email').val('');
    $('#sign_up_vehicle_plates').val('');
}

function signUp() {
    if ($("#sign-up-form").valid()){

        showAlert('Registro',
                  'Hemos recibido tus solicitud. Nos pondremos en contacto contigo a la brevedad.',
                  function() {
                      window.scrollTo(0,0);
                      $.mobile.changePage($('#dashboard'));
                  }
        );

        /*var data = {
            "utf8": "V",
            "user": {
                "first_name": $('#sign_up_first_name').val(),
                "last_name": $('#sign_up_last_name').val(),
                "document_type": $('#sign_up_document_type').val(),
                "document_id": $('#sign_up_document_id').val(),
                "is_member": false,
                "agreement_id": $('#sign_up_agreement').val(),
                "password": $('#sign_up_password').val(),
                "password_confirmation": $('#sign_up_password_confirmation').val(),
                "email": $('#sign_up_email').val()
            }
        };

        if ($("#sign_up_add_vehicle").is(':checked')) {
            if ($('#sign_up_vehicle_owner').is(':checked')) {
                data.vehicle = {
                    "plate_number": $('#sign_up_vehicle_plates').val().toUpperCase(),
                    "soat_date": $('#sign_up_vehicle_soat').val(),
                    "document_type_owner": $('#sign_up_document_type').val(),
                    "document_id_owner": $('#sign_up_document_id').val()
                };
            } else {
                data.vehicle = {
                    "plate_number": $('#sign_up_vehicle_plates').val().toUpperCase(),
                    "soat_date": $('#sign_up_vehicle_soat').val(),
                    "document_type_owner": $('#sign_up_vehicle_document_type').val(),
                    "document_id_owner": $('#sign_up_vehicle_document_id').val()
                };
            }
        }

        showLoader();
        $.ajax({
            type: "POST",
            url: "http://166.78.117.195/users.json",
            data: data,
            dataType: "json",
            success: function(response) {
                if (response.success == true) {
                    hideLoader();
                    showAlert('Registro',
                        response.message,
                        function(){
                            window.scrollTo(0,0);
                            $.mobile.changePage($('#login'), {transition: 'none'});
                        }
                    );
                } else {
                    hideLoader();
                    showAlert('Registro', response.message);
                }
            },
            error: function(error) {
                hideLoader();

                if (error.status && error.status == 401) {
                    showAlert('Error',
                        error.responseJSON.error,
                        function() {
                            window.scrollTo(0,0);
                            $.mobile.changePage($('#login'), {transition: 'none'});
                        }
                    );
                } else {
                    showAlert('Registro', 'Ocurrió un error al intentar registrarte. Intenta nuevamente.');
                }
            }
        });*/
    }
}


/** Funciones del menu lateral **/

function setUserName(){
    var user = getCache("acc_user");
    if(user != undefined){
        $('#contenedor_nombre').html(user.first_name.split(' ')[0]);
        $('#boton-cerrar-sesion').show();

        if(user.is_member) {
            $('#btn_sign_up').hide();
        } else {
            $('#btn_sign_up').show();
        }
    }else{
        $('#contenedor_nombre').html('invitado(a)');
        $('#boton-cerrar-sesion').hide();
        $('#btn_sign_up').show();
    }
}

function showMenuLateral(){
    $('#panel-menu-lateral').panel('open');
}

function hideMenuLateral(){
    $('#panel-menu-lateral').panel('close');
}


/** Mi cuenta **/

function showProfile(){
    var user = getCache("acc_user");

    if (user == undefined){
        window.sessionStorage.acc_previousPage = 'profile';
        $.mobile.changePage($('#login'));
    } else {
        $.mobile.changePage($('#profile'));
    }
}

function clearProfile() {
    $('#profile .profile-picture').html('');
    $('#profile .profile-name').html('');
    $('#profile .profile-email').html('');
    $('#profile .profile-vehicles').html('');
}

/** Funciones del menu emergente **/


function solicitarServicio(pagina){
    hideMenu();
    setCache("acc_servicio", pagina);

    var user = getCache("acc_user");
    if(user != undefined){
        showServicios();
    } else {
        if(sesion != undefined || sesion != null || sesion != ""){
            var title = "¿Eres socio de ACC?";
            var message = 'Si eres socio puedes iniciar sesión, si aun no lo eres puedes continuar como invitado.';
            showDialog(
                title,
                message,
                function(){
                    window.sessionStorage.acc_previousPage = 'dashboard';
                    $.mobile.changePage($('#login'));
                },
                function(){
                    showServicios();
                }
            );
        }
    }
}

function changePlate(){
	if($("#plate").val() == "otra"){
		$('#servicio_placas').show();
		$("#servicio_placas").val("");
		$("#servicio_placas").prop('disabled', false);
	}else{
		$('#servicio_placas').hide();
		$("#servicio_placas").prop('disabled', true);
		$("#servicio_placas").val($("#plate").val()+"");
	}
}

function enviarSolicitudServicio(){
    if ( $("#menu-servicio-form").valid() ){
        hideMenu();

        var servicio = getCache("acc_servicio");
        var is_guest = true;
        var user_id;
        var user = getCache('acc_user');
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

        removeCache("acc_servicio");

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
                showAlert('Error', 'No se pudo solicitar el servicio. Intenta nuevamente.');
                hideLoader();
            }
        });
    }
}


/** Tráfico **/

function toggleTrafficLayer(event){
	hideMenu();
	if(showingtrafficLayer == true){
        $(event.target).closest('.menu-button').removeClass('active');
		trafficLayer.setMap(null);
	}else{
		trafficLayer.setMap(map);
        $(event.target).closest('.menu-button').addClass('active');
	}
    showingtrafficLayer = !showingtrafficLayer;
}


documentType = $('#login-tipo-identificacion').val();
documentId = $('#login-identificacion').val();
password = $('#login-password').val();

    var data = {
        "document_type": documentType,
        "document_id": documentId,
        "password": password
    };

/** Marcadores **/

function getAllMarkers() {
    showLoader();
    $.ajax({
        type: "GET",
        url: "http://166.78.117.195/locations.json?type_id=" + markerConstants.DISCOUNTS,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            markerActivity.discounts.loadAttemp = true;
            markerActivity.discounts.loadSuccess = true;
            generateMarkers(markerConstants.DISCOUNTS, response);
            checkHideLoader();
        },
        error: function(error) {
            markerActivity.discounts.loadAttemp = true;
            checkHideLoader();
        }
    });

    $.ajax({
        type: "GET",
        url: "http://166.78.117.195/locations.json?type_id=" + markerConstants.GAS,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            markerActivity.gas.loadAttemp = true;
            markerActivity.gas.loadSuccess = true;
            generateMarkers(markerConstants.GAS, response);
            checkHideLoader();
        },
        error: function(error) {
            markerActivity.gas.loadAttemp = true;
            checkHideLoader();
        }
    });

    $.ajax({
        type: "GET",
        url: "http://166.78.117.195/locations.json?type_id=" + markerConstants.PARKING,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            markerActivity.parking.loadAttemp = true;
            markerActivity.parking.loadSuccess = true;
            generateMarkers(markerConstants.PARKING, response);
            checkHideLoader();
        },
        error: function(error) {
            markerActivity.parking.loadAttemp = true;
            checkHideLoader();
        }
    });

    $.ajax({
        type: "GET",
        url: "http://166.78.117.195/locations.json?type_id=" + markerConstants.FUN,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            markerActivity.fun.loadAttemp = true;
            markerActivity.fun.loadSuccess = true;
            generateMarkers(markerConstants.FUN, response);
            checkHideLoader();
        },
        error: function(error) {
            markerActivity.fun.loadAttemp = true;
            checkHideLoader();
        }
    });
}

function checkHideLoader() {
    if (markerActivity.discounts.loadAttemp && markerActivity.gas.loadAttemp && markerActivity.parking.loadAttemp && markerActivity.fun.loadAttemp) {
        hideLoader();
    }
}

var infowindow;
function generateMarkers(markerType, newMarkers){

    var iconURL = '';
    switch (markerType) {
        case markerConstants.DISCOUNTS:
            iconURL = 'img/markers/pin-descuentos.png';
            break;
        case markerConstants.GAS:
            iconURL = 'img/markers/pin-gas.png';
            break;
        case markerConstants.PARKING:
            iconURL = 'img/markers/pin-parqueaderos.png';
            break;
        case markerConstants.FUN:
            iconURL = 'img/markers/pin-diversion.png';
            break;
        default:
            break;
    }

    var markers = new Array();

    $.each(newMarkers, function(index, value) {
        var myLatlng = new google.maps.LatLng(value.lat, value.long);
        var contentString = '';
        var nombre = value.name;
        if(nombre != undefined){
            contentString += '<p>'+nombre+'</p>';
        }
        var direccion = value.address;
        if(direccion != undefined){
            contentString += '<p>'+direccion+'</p>';
        }
        var telefono = value.phone;
        if(telefono != undefined){
            contentString += '<p>Tel: <a href="tel:031'+telefono+'">'+telefono+'</a></p>';
        }
        var description = value.description;
        if(description != undefined){
            contentString += '<p>'+description+'</p>';
        }
        var icon = {
            url: iconURL,
            scaledSize: new google.maps.Size(20, 33)
        };

        var marker = new google.maps.Marker({
            position: myLatlng,
            optimized: false,
            title: value.name,
            html: contentString,
            map: null,
            icon: icon
        });

        infowindow = new google.maps.InfoWindow({
            content: "",
            maxWidth: 150
        });
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(this.html);
            infowindow.open(map,marker);
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

function showMarkers(markerType){
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
        markers[i].setMap(map);
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
            markerActivity.discounts.loadSuccess = true;
            generateMarkers(markerConstants.DISCOUNTS, response);
            showMarkers(markerConstants.DISCOUNTS);
            hideLoader();
        },
        error: function(error) {
            showAlert('Error', 'Hubo un error al obtener los puntos de descuentos cercanos.');
            hideLoader();
        }
    });
}

function toggleDiscounts(){
	hideMenu();
	if (showingDiscount == true) {
        $(event.target).closest('.menu-button').removeClass('active');
        hideMarkers(markerConstants.DISCOUNTS);
	} else {
        $(event.target).closest('.menu-button').addClass('active');

        if (markerActivity.discounts.loadSuccess) {
            showMarkers(markerConstants.DISCOUNTS);
        } else {
            getDiscounts();
        }
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
            markerActivity.parking.loadSuccess = true;
            generateMarkers(markerConstants.PARKING, response);
            showMarkers(markerConstants.PARKING);
            hideLoader();
        },
        error: function(error) {
            showAlert('Error', 'Hubo un error al obtener los parqueaderos cercanos.');
            hideLoader();
        }
    });
}

function toggleParking(){
    hideMenu();
    if (showingParking == true) {
        $(event.target).closest('.menu-button').removeClass('active');
        hideMarkers(markerConstants.PARKING);
    } else {
        $(event.target).closest('.menu-button').addClass('active');

        if (markerActivity.parking.loadSuccess) {
            showMarkers(markerConstants.PARKING);
        } else {
            getParking();
        }
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
            markerActivity.gas.loadSuccess = true;
            generateMarkers(markerConstants.GAS, response);
            showMarkers(markerConstants.GAS);
            hideLoader();
        },
        error: function(error) {
            showAlert('Error', 'Hubo un error al obtener las gasolineras cercanos.');
            hideLoader();
        }
    });
}

function toggleGas(){
    hideMenu();
    if (showingGas == true) {
        $(event.target).closest('.menu-button').removeClass('active');
        hideMarkers(markerConstants.GAS);
    } else {
        $(event.target).closest('.menu-button').addClass('active');

        if (markerActivity.gas.loadSuccess) {
            showMarkers(markerConstants.GAS);
        } else {
            getGas();
        }
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
            markerActivity.fun.loadSuccess = true;
            generateMarkers(markerConstants.FUN, response);
            showMarkers(markerConstants.FUN);
            hideLoader();
        },
        error: function(error) {
            showAlert('Error', 'Hubo un error al obtener las puntos de diversión cercanos.');
            hideLoader();
        }
    });
}

function toggleFun(){
    hideMenu();
    if (showingFun == true) {
        $(event.target).closest('.menu-button').removeClass('active');
        hideMarkers(markerConstants.FUN);
    } else {
        $(event.target).closest('.menu-button').addClass('active');

        if (markerActivity.fun.loadSuccess) {
            showMarkers(markerConstants.FUN);
        } else {
            getFun();
        }
    }
    showingFun = !showingFun;
}


/** Funciones para persitencia de datos **/

function setCache(key, value) {
    if (window.localStorage.acc_rememberMe == "true") {
        window.localStorage.setItem(key, JSON.stringify(value));
    } else {
        window.sessionStorage.setItem(key, JSON.stringify(value));
    }
}

function getCache(key) {
    if (window.localStorage.acc_rememberMe == "true") {
        return JSON.parse(window.localStorage.getItem(key));
    } else {
        return JSON.parse(window.sessionStorage.getItem(key));
    }
}

function isCache(key) {
    return window.localStorage.getItem(key) !== null && window.localStorage.getItem(key) !== undefined;
}

function removeCache(key) {
    if (window.localStorage.acc_rememberMe == "true") {
        window.localStorage.removeItem(key);
    } else {
        window.sessionStorage.removeItem(key);
    }
}

function clearCache() {
    removeCache('acc_user');
    removeCache('acc_servicio');
    removeCache('acc_rememberMe');
}

/** Funciones generales **/

function createDateFromMysql(mysql_string) {
    if(typeof mysql_string === 'string')
    {
        var t = mysql_string.split(/[-:.T]/);

        //when t[3], t[4] and t[5] are missing they defaults to zero
        return new Date(t[0], t[1] - 1, t[2], t[3] || 0, t[4] || 0, t[5] || 0);
    }
    return null;
}

function numberLetterPattern(e) {
    var key;
    var keychar;

    if (window.event)
        key = window.event.keyCode;
    else if (e)
        key = e.which;
    else
        return true;
    keychar = String.fromCharCode(key);
    keychar = keychar.toLowerCase();

// control keys
    if ((key==null) || (key==0) || (key==8) ||
        (key==9) || (key==13) || (key==27) )
        return true;

// alphas and numbers
    else if ((("abcdefghijklmnopqrstuvwxyz0123456789").indexOf(keychar) > -1))
        return true;
    else
        return false;
}

function numberPattern(e) {
    var key;
    var keychar;

    if (window.event)
        key = window.event.keyCode;
    else if (e)
        key = e.which;
    else
        return true;
    keychar = String.fromCharCode(key);
    keychar = keychar.toLowerCase();

// control keys
    if ((key==null) || (key==0) || (key==8) ||
        (key==9) || (key==13) || (key==27) )
        return true;

// alphas and numbers
    else if ((("0123456789").indexOf(keychar) > -1))
        return true;
    else
        return false;
}


$(document).on('pagebeforeshow', '#help', function(){
	$("#help-carousel").owlCarousel({
		itemsTablet: [$(window).width(),1], //1 items between device.width and 0
		itemsMobile : false
	});
});

function showDashboard(){
	$.mobile.changePage($('#dashboard'));
}

function showHelp(){
	$.mobile.changePage($('#help'));
}

function goToSignUp(){
    $.mobile.changePage($('#sign-up'));
}

function goToDescuentos(){
    $.mobile.changePage($('#lista-descuentos'));
}

function getDescuentos(){
	showLoader();

    $.ajax({
        type: "GET",
        url: "http://166.78.117.195/perks.json",
        dataType: "json",
        success: function(response) {
            hideLoader();
            if(isCache('descuentos')){
            	removeCache('descuentos');
            }
            showDescuentos(response);
        },
        error: function(error) {
        	showAlert('Error', 'Hubo un error al obtener los descuentos.');
            hideLoader();
        }
    });
	
}

function showDescuentos(response){
	setCache('descuentos', response);
	var contentString = '';
	$.each(response, function(index, value) {
		contentString += '<li data-role="collapsible" data-iconpos="right" data-inset="false">' +
                                '<h2>' + value.name + '</h2>' +
                                '<div>' +
                                    '<div class="logo">' +
                                        '<img src="img/descuentos/tellantas.png"/>' +
                                    '</div>' +
                                    '<div class="description">' +
                                        value.description +
                                    '</div>' +
                                '</div>' +
                            '</li>';
	});
	
	$('#contenido-lista-descuentos').html(contentString);
    $('#contenido-lista-descuentos li').collapsible();
    $('#contenido-lista-descuentos li').removeClass($.mobile.activeBtnClass);
    $('#contenido-lista-descuentos').listview('refresh');
}

function showPicoYPlaca(){
    $('#pico-y-placa-ciudad').selectmenu();
	hideMenu();
	$('#menu-pico-y-placa').show();
}

function setPicoYPlaca(){
	var ciudad = $('#pico-y-placa-ciudad').val();

    $.ajax({
        type: "GET",
        url: "http://166.78.117.195/acc/pico_placa.json?ciudad=" + ciudad,
        data: data,
        dataType: "json",
        success: function(response) {
            window.localStorage.setItem('acc_PicoYPlaca', JSON.stringify(response.pico_placa));
            $('#contenedor_placa').html(response.pico_placa);
            hideLoader();
            hideMenu();
        },
        error: function(error) {
            showAlert('Pico y placa', 'No se pudo obtener la información de pico y placa. Intenta nuevamente.');
            hideLoader();
        }
    });
}

function autosetPicoYPlaca(){
    var ciudad = JSON.parse(window.localStorage.getItem('acc_PicoYPlaca'));
    $('#contenedor_placa').html(ciudad);
}