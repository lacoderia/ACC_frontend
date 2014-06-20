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
    	
    	var id = isCache('id');
		var pass = isCache('pass');
		if (id && pass){
			console.log('Existe id y pass');
			$.mobile.changePage($('#dashboard'), {transition: 'none'});
		}

        var iOS7 = window.device
            && window.device.platform
            && window.device.platform.toLowerCase() == "ios"
            && parseFloat(window.device.version) >= 7.0;

        if (iOS7) {
            StatusBar.overlaysWebView(false);
        }

        var imgLoad = imagesLoaded('#splash_container');

        imgLoad.on('always', function() {
            $('#splash_container img').show();
            var i = 0;
            var animation = setInterval(function(){
                if (i <= 5) {
                    $('#splash_container img[splash_frame="' + i + '"]').hide();
                    i++;
                } else {
                    clearInterval(animation);
                    $.mobile.changePage($('#login'), {transition: 'slide'});
                }
            }, 1000);
        });

		$(document).on('click', '.rides-list li', function(event, ui) {
			if(!$(this).attr('data-role')) {
				sessionStorage.rideId = $(this).attr('ride-id');
                sessionStorage.previousPage = 'dashboard'
				$.mobile.changePage($('#view-ride'), {transition: 'slide'});
			}
		});

        $(document).on('click', '.search-rides-list li', function(event, ui) {
            if(!$(this).attr('data-role')) {
                sessionStorage.rideId = $(this).attr('ride-id');
                sessionStorage.previousPage = 'search-ride'
                $.mobile.changePage($('#view-ride'), {transition: 'slide'});
            }
        });

        $('.acc-btn-back').click(function() {
            $.mobile.changePage($('#' + $(this).attr('previous-page')), {transition: 'slide', reverse: 'true'});
        });

        $('.acc-btn-menu').click(function() {
            $('#dashboard-menu').popup('open', {
                transition: 'slidedown',
                positionTo: '#acc-btn-menu'
            });
        });
    }
};

$(document).on('pagecreate', '#dashboard', function(){
    getDashboard();
});

$(document).on('pagebeforeshow', '#search-ride', function(){
    getAllRides();
});

$(document).on("pageshow", "#add-ride", function() {
    $("#add-ride-form").validate({

        errorPlacement: function(error, element) {
            if (element.attr("name") === "favcolor") {
                error.insertAfter($(element).parent());
            } else {
                error.insertAfter(element);
            }
        }

    });
});

$(document).on('pagebeforeshow', "#view-ride", function (event, data) {
    $('#bnt-back-view-ride').attr('previous-page', sessionStorage.previousPage)
    var rideId = sessionStorage.rideId;

    if (rideId) {
        getRideDetail(rideId);
    } else {
        alert('There was an error retrieving the ride details.');
    }
});

$(document).on('pagecontainertransition', function(){
    correctHeight();
});

$(document).on('resize', function(){
    correctHeight();
});

$(document).on('orientationchange', function(){
    correctHeight();
});

function correctHeight() {
    var screen = $.mobile.getScreenHeight(),
        header = $(".ui-header").hasClass("ui-header-fixed") ? $(".ui-header").outerHeight() - 1 : $(".ui-header").outerHeight(),
        footer = $(".ui-footer").hasClass("ui-footer-fixed") ? $(".ui-footer").outerHeight() - 1 : $(".ui-footer").outerHeight(),
        contentCurrent = $(".ui-content").outerHeight() - $(".ui-content").height(),
        content = screen - header - footer - contentCurrent;
    $(".ui-content").height(content);
}

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
    min: jQuery.validator.format("Ingresa un valor mayor o igual a {0}.")
});


var myUserId = 1;
var myAgreementId = 1;


var myRides = new Array();
var nextRides = new Array();
var allRides = new Array();

var months = new Array("Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic");

function showLoader() {
    $('.overlay').show();
    $('#loader').show();
}

function hideLoader() {
    $('.overlay').hide();
    $('#loader').hide();
}

// Funciones de Login

function validaDatos(){
    var id = $('#id').val();
    var pass = $('#pass').val();
    //si el usuario ingreso datos de login
    if((id != null && id != undefined && id != "") && (pass != null && pass != undefined && pass != "")){
        if(isCache('id') && isCache(pass)){
            //si ya existen id y pass en la memoria pero se debe volver a iniciar sesion
            var storedId = getCache('id');
            var storedPass = getCache('pass');
            if((id == storedID) && (pass == storedPass)){
                //login correcto
                $.mobile.changePage($('#dashboard'), {transition: 'slide'});
            }else{
                //login incorrecto
                console.log("Verifica tu id y contraseña");
            }
        }else{
            //si no existen id y pass en la memoria
            setCache("id", id);
            setCache("pass", pass);
            $.mobile.changePage($('#dashboard'), {transition: 'slide'});
        }
    }else{
        console.log("Ingresa tu id y contraseña");
    }
}

// Funciones de Dashboard

function getDashboard() {
	showLoader();

    $.ajax({
        type: "GET",
        url: "http://166.78.117.195/carpool/index.json?user_id=" + myUserId,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            myRides = response.my_rides;
            nextRides = response.rides;

            updateDashboard();
            hideLoader();
        },
        error: function(error) {
            hideLoader();
            alert('There was an error retrieving the dashboard data.');
        }
    });

}

function clearDashboard() {
	var myRidesList = $('#list-my-rides');
	var nextRidesList = $('#list-next-rides');
	
	myRidesList.html('');
	nextRidesList.html('');
}

function updateDashboard() {
    clearDashboard();
    var myRidesList = $('#list-my-rides');

    myRidesList.append($('<li data-role="list-divider" >Mis viajes publicados</li>'));
    for(var i=0; i<myRides.length; i++) {
        html = '<li class="ui-nodisc-icon" ride-id="' + myRides[i].id + '"><a>' + myRides[i].origin + ' - ' + myRides[i].destination + '</a></li>';
        myRidesList.append($(html));
    }

    myRidesList.listview('refresh');

    var nextRidesList = $('#list-next-rides');

    nextRidesList.append($('<li data-role="list-divider" >Viajes a los que apliqué</li>'));
    for(var i=0; i<nextRides.length; i++) {
        html = '<li class="ui-nodisc-icon" ride-id="' + nextRides[i].id + '"><a>' + nextRides[i].origin + ' - ' + nextRides[i].destination + '</a></li>';
        nextRidesList.append($(html));
    }

    nextRidesList.listview('refresh');
}

// Funciones de Búsqueda de viajes

function getAllRides() {
    showLoader();

    $.ajax({
        type: "GET",
        url: "http://166.78.117.195/rides/available.json?user_id=" + myUserId,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            clearAllRides();
            var allRidesList = $('#list-all-rides');
            allRidesList.append($('<li data-role="list-divider" >Todos los viajes</li>'));

            if(response.rides) {
                allRides = response.rides;

                if (allRides.length) {
                    for(var i=0; i<allRides.length; i++) {
                        var html = '<li class="ui-nodisc-icon" ride-id="' + allRides[i].id + '"><a>' + allRides[i].origin + ' - ' + allRides[i].destination + '</a></li>';
                        allRidesList.append($(html));
                    }
                } else {
                    allRidesList.append($('<li></li>'));

                }
            } else {
                allRidesList.append($('<li></li>'));
            }

            allRidesList.listview('refresh');

            hideLoader();
        },
        error: function(error) {
            hideLoader();
            alert('There was an error retrieving the rides data.');
        }
    });
}

function clearAllRides() {
	var allRidesList = $('#list-all-rides');

	allRidesList.html('');
}

// Funciones de Detalle de viaje

function getRideDetail(rideId) {
    showLoader();
    $.ajax({
        type: "GET",
        url: "http://166.78.117.195/rides/" + rideId + "/detail.json",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            clearViewRide();
            if(response.id) {
                var ride = response;
                console.log(response);
                $('#view-ride .name').html(ride.owner.first_name + ' ' + ride.owner.last_name);

                var date = createDateFromMysql(ride.ride_when);

                $('#view-ride .date').html(date.getDate() + ' ' + months[date.getMonth()]);
                $('#view-ride .time').html(("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2));
                $('#view-ride .time').html(ride.time);
                $('#view-ride .origin').html(ride.origin);
                $('#view-ride .destination').html(ride.destination);

                var seats = '';
                var availableSeats = ride.seats;
                var takenSeats = ride.users.length;

                for(var i=0; i<availableSeats; i++) {
                    if(i<takenSeats) {
                        seats += '<img src="img/person.png"/>';
                    } else {
                        seats += '<img src="img/person_grey.png"/>';
                    }
                }

                $('#view-ride .seats').html(seats);
                $('#view-ride .cost').html('$' + ride.cost.toFixed(2));
                $('#view-ride .notes').html(ride.notes);

                var showAcceptRideButton = true;

                // El usuario es el creador del viaje
                if (myUserId == ride.owner.id) {
                    showAcceptRideButton = false;
                } else {
                    // El viaje va lleno
                    if (takenSeats >= availableSeats) {
                        showAcceptRideButton = false;
                    } else {
                        // El usuario ya aceptó el viaje
                        for (var i=0; i < ride.users.length; i++) {
                            if (ride.users[i].id == myUserId) {
                                showAcceptRideButton = false;
                            }
                        }
                    }
                }

                if (showAcceptRideButton) {
                    $('#btn-accept-ride').show();
                }
                hideLoader();
            } else {
                $.mobile.changePage($('#dashboard'), {transition: 'slide'});
                hideLoader();
                alert('There was an error retrieving the ride details.');
            }
        },
        error: function(error) {
            $.mobile.changePage($('#dashboard'), {transition: 'slide'});
            hideLoader();
            alert('There was an error retrieving the ride details.');
        }
    });
}

function clearViewRide() {
    $('#view-ride .name').html('');
    $('#view-ride .date').html('');
    $('#view-ride .time').html('');
    $('#view-ride .origin').html('');
    $('#view-ride .destination').html('');
    $('#view-ride .seats').html('');
    $('#view-ride .notes').html('');
}

//Funciones de Añadir viaje

function addRide() {

    if ($("#add-ride-form").valid()){
        var ride = {
            "ride": {
                "agreement_id": myAgreementId,
                "user_id": myUserId,
                "ride_when": $('#add-ride-datetime').val(),
                "cost": $('#add-ride-cost').val(),
                "seats": $('#add-ride-seats').val(),
                "origin": $('#add-ride-origin').val(),
                "destination": $('#add-ride-destination').val(),
                "notes": $('#add-ride-notes').val()
            }
        };

        showLoader();
        $.ajax({
            type: "POST",
            url: "http://166.78.117.195/rides.json",
            data: ride,
            dataType: "json",
            success: function(response) {
                if (response.id) {
                    // agregamos el viaje al arreglo de viajes
                    myRides.push(response);
                    updateDashboard();
                    hideLoader();
                    alert('El viaje se agregó con éxito');
                } else {
                    hideLoader();
                    alert('El viaje no se pudo agregar');
                }

                $.mobile.changePage($('#dashboard'), {transition: 'slide', reverse: 'true'});
            },
            error: function(error) {
                hideLoader();
                alert('El viaje no se pudo agregar');
            }
        });
    }
}

function acceptRide() {
    updateDashboard();
    $.mobile.changePage($('#dashboard'), {transition: 'slide', reverse: 'true'});
}


// Funciones para persitencia de datos

//guarda un par key - value
function setCache(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

//obtiene el valor de key
function getCache(key) {
  return JSON.parse(window.localStorage.getItem(key));
}

//true si key existe, false en otro caso
function isCache(key) {
  return window.localStorage.getItem(key) !== null && window.localStorage.getItem(key) !== undefined;
}

//elimina key 
function removeCache(key) {
  window.localStorage.removeItem(key);
}

// Funciones generales

function createDateFromMysql(mysql_string) {
    if(typeof mysql_string === 'string')
    {
        var t = mysql_string.split(/[-:.T]/);

        //when t[3], t[4] and t[5] are missing they defaults to zero
        return new Date(t[0], t[1] - 1, t[2], t[3] || 0, t[4] || 0, t[5] || 0);
    }
    return null;
}
