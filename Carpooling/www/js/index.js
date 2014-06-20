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

        /*var iOS7 = window.device
            && window.device.platform
            && window.device.platform.toLowerCase() == "ios"
            && parseFloat(window.device.version) >= 7.0;

        if (iOS7) {
            StatusBar.hide();
        }*/

        setTimeout(function() {
            navigator.splashscreen.hide();
            StatusBar.hide();
        }, 2000);

        var imgLoad = imagesLoaded('#splash_container');

        imgLoad.on('always', function() {
            $('#splash_container img').show();
            var i = 0;
            var animation = setInterval(function(){
                if (i <= 4) {
                    $('#splash_container img[splash_frame="' + i + '"]').hide();
                    i++;
                } else {
                    clearInterval(animation);
                    $.mobile.changePage($('#login'), {transition: 'slide'});
                }
            }, 1000);
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

$(document).on('pagebeforeshow', "#sign-up", function (event, data) {
    clearSignUp();
    getAgreements();

    $("#sign-up-form").validate({
        errorPlacement: function(error, element) {
            error.insertAfter($(element).parent());
        }
    });
});

$(document).on('pagecreate', '#profile', function(){
    var user = JSON.parse(localStorage.user);
    $('#profile-name').html(user.name);
    //$('#profile-picture').attr('src', user.picture);
});

$(document).on('pagecreate', '#dashboard', function(){
    getDashboard();

});

$(document).on('pagebeforeshow', '#search-ride', function(){
    getAllRides();
});

$(document).on("pageshow", "#add-ride", function() {
    clearAddRide();

    $("#add-ride-form").validate({

        errorPlacement: function(error, element) {
            error.insertAfter($(element).parent());
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

var myRides = new Array();
var nextRides = new Array();
var allRides = new Array();

var months = new Array("Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic");
var days = new Array("Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo");

function showLoader() {
    $('.overlay').show();
    $('#loader').show();
}

function hideLoader() {
    $('.overlay').hide();
    $('#loader').hide();
}

// Funciones de Login

function logIn() {


    //$('#popupBasic').popup('open', {transition: 'pop'});

    var data = {
        "document_type": $('#login-tipo-identificacion').val(),
        "document_id": $('#login-identificacion').val(),
        "password": $('#login-password').val()
    };

    /*var data = {
        "document_type": 'CC',
        "document_id": '88167911',
        "password": '12345678'
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
                    localStorage.user = JSON.stringify(response.user);
                }
                console.log(localStorage.user);
                $.mobile.changePage($('#dashboard'), {transition: 'none'});
            }
        },
        error: function(error) {
            if (error.status == '401') {
                alert('Los datos introducidos son incorrectos');
            } else {
                alert('Ocurrió un error durante el inicio de sesión, intenta nuevamente');
            }
            hideLoader();
        }
    });
}

function logOut() {
    showLoader();

    var user = JSON.parse(localStorage.user);
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
                delete localStorage.user;
                $.mobile.changePage($('#login'), {transition: 'none'});
            }
        },
        error: function(error) {
            alert('Ocurrió un error al intentar cerrar la sesión');
            hideLoader();
        }
    });
}

// Funciones de Sign-up

function clearSignUp() {
    $('#sign-up-agreement').val('');
    $('#sign-up-first-name').val('');
    $('#sign-up-last-name').val('');
    $('#sign-up-email').val('');
    $('#sign-up-licence-plates').val('');
    $('#sign-up-password').val('');
    $('#sign-up-password-confirmation').val('');
}

function getAgreements() {
    showLoader();

    $.ajax({
        type: "GET",
        url: "http://166.78.117.195/agreements.json?min=true",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            var agreements = response;

            for (var i=0; i<agreements.length; i++){
                $('#sign-up-agreement').append('<option value="' + agreements[i].id + '">' + agreements[i].name + '</option>');
            }
            hideLoader();
        },
        error: function(error) {
            hideLoader();
            alert('There was an error retrieving the agreements.');
        }
    });
}

function signUp() {
    if ($("#sign-up-form").valid()){
        var data = {

        };

        showLoader();
        $.ajax({
            type: "POST",
            url: "http://166.78.117.195/XXXXX.json",
            data: data,
            dataType: "json",
            success: function(response) {
                if (response.id) {
                    hideLoader();
                    alert('');
                } else {
                    hideLoader();
                    alert('');
                }
            },
            error: function(error) {
                hideLoader();
                alert('');
            }
        });
    }
}

// Funciones de Profile

function getPicture() {
    navigator.camera.getPicture(
        function(imageData) {
            var image = document.getElementById('profile-picture');
            image.src = "data:image/jpeg;base64," + imageData;
        },
        function() {

        },
        {
            quality: 50,
            sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
            encodingType: navigator.camera.EncodingType.PNG,
            mediaType: navigator.camera.MediaType.PICTURE,
            destinationType: navigator.camera.DestinationType.DATA_URL,
            targetWidth: 200,
            targetHeight: 200
        }
    );
}

// Funciones de Dashboard

function getDashboard() {
	showLoader();

    var user = JSON.parse(localStorage.user);
    $.ajax({
        type: "GET",
        url: "http://166.78.117.195/carpool/index.json?user_id=" + user.id,
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

    if (myRides.length > 0) {
        var dateText = '';

        for(var i=0; i<myRides.length; i++) {
            var date = createDateFromMysql(myRides[i].ride_when);
            var myRideDateText = days[date.getDay()-1] + ' ' + date.getDate() + ' ' + months[date.getMonth()];

            if (myRideDateText != dateText) {
                myRidesList.append($('<li data-role="list-divider" class="date-divider">' + myRideDateText + '</li>'));
                dateText = myRideDateText;
            }

            var html = '<li class="ui-nodisc-icon"><a onclick="showRideDetail(' + myRides[i].id + ', \'dashboard\')">' + myRides[i].origin + ' - ' + myRides[i].destination + '</a></li>';
            myRidesList.append($(html));
        }
    } else {
        myRidesList.append($('<li>No hay viajes disponibles</li>'));
    }

    myRidesList.listview('refresh');

    var nextRidesList = $('#list-next-rides');

    nextRidesList.append($('<li data-role="list-divider">Mis viajes reservados</li>'));

    if (nextRides.length > 0) {
        var dateText = '';

        for(var i=0; i<nextRides.length; i++) {
            var date = createDateFromMysql(nextRides[i].ride_when);
            var nextRideDateText = days[date.getDay()-1] + ' ' + date.getDate() + ' ' + months[date.getMonth()];

            if (nextRideDateText != dateText) {
                nextRidesList.append($('<li data-role="list-divider" class="date-divider">' + nextRideDateText + '</li>'));
                dateText = nextRideDateText;
            }

            var html = '<li class="ui-nodisc-icon"><a onclick="showRideDetail(' + nextRides[i].id + ', \'dashboard\')">' + nextRides[i].origin + ' - ' + nextRides[i].destination + '</a></li>';
            nextRidesList.append($(html));
        }
    } else {
        nextRidesList.append($('<li>No hay viajes disponibles</li>'));
    }

    nextRidesList.listview('refresh');
}

// Funciones de Búsqueda de viajes

function getAllRides() {
    showLoader();
    $('#search-ride .ui-content').hide();

    var user = JSON.parse(localStorage.user);
    $.ajax({
        type: "GET",
        url: "http://166.78.117.195/rides/available.json?user_id=" + user.id,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            allRides = response.rides;
            updateAllRides();
            $('#search-ride .ui-content').show();
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

function updateAllRides(){
    clearAllRides();
    var allRidesList = $('#list-all-rides');
    allRidesList.append($('<li data-role="list-divider" >Viajes disponibles</li>'));

    if (allRides.length > 0) {
        var dateText = '';

        for(var i=0; i<allRides.length; i++) {
            var date = createDateFromMysql(allRides[i].ride_when);
            var rideDateText = days[date.getDay()-1] + ' ' + date.getDate() + ' ' + months[date.getMonth()];

            if (rideDateText != dateText) {
                allRidesList.append($('<li data-role="list-divider" class="date-divider">' + rideDateText + '</li>'));
                dateText = rideDateText;
            }

            var html = '<li class="ui-nodisc-icon"><a onclick="showRideDetail(' + allRides[i].id + ', \'search-ride\')">' + allRides[i].origin + ' - ' + allRides[i].destination + '</a></li>';
            allRidesList.append($(html));
        }
    } else {
        allRidesList.append($('<li>No hay viajes disponibles</li>'));
    }

    allRidesList.listview('refresh');
}

// Funciones de Detalle de viaje

function showRideDetail(rideId, previousPage) {
    clearViewRide();
    if(typeof(Storage)!=="undefined") {
        sessionStorage.rideId = rideId;
        sessionStorage.previousPage = previousPage;
    }
    $.mobile.changePage($('#view-ride'), {transition: 'slide'});
}

function getRideDetail(rideId) {
    showLoader();
    $('#view-ride .ui-content').hide();
    $('#btn-accept-ride').hide();
    $('#btn-accept-ride').addClass('ui-disabled');

    var user = JSON.parse(localStorage.user);
    $.ajax({
        type: "GET",
        url: "http://166.78.117.195/rides/" + rideId + "/detail.json",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            if(response.id) {
                var ride = response;
                $('#view-ride .name').html(ride.owner.first_name + ' ' + ride.owner.last_name);

                var date = createDateFromMysql(ride.ride_when);

                $('#view-ride .date').html(date.getDate() + ' ' + months[date.getMonth()]);
                $('#view-ride .time').html(("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2));
                $('#view-ride .time').html(ride.time);
                $('#view-ride .origin').html(ride.origin);
                $('#view-ride .destination').html(ride.destination);

                var availableSeats = ride.seats;
                var takenSeats = ride.users.length;

                for(var i=0; i<availableSeats; i++) {
                    console.log(ride.users[i]);
                    if(i<takenSeats) {
                        if (ride.users[i].picture) {
                            $('#view-ride .passengers').append($('<div class="seat"><div class="picture-container"><img src="' + ride.users[i].picture + '"/></div><div>' + ride.users[i].email + '</div></div>'));
                        } else {
                            $('#view-ride .passengers').append($('<div class="seat"><div class="picture-container"><img src="img/profile/example.jpg"/></div><div>' + ride.users[i].email + '</div></div>'));
                        }
                    } else {
                        $('#view-ride .passengers').append($('<div class="seat"><div class="picture-container"><img src="img/person_grey.png"/></div><div>Disponible</div></div>'));
                    }
                }

                $('#view-ride .picture-container img').each(function() {
                    var image = $(this);
                    $("<img/>")
                        .attr("src", image.attr('src'))
                        .load(function () {
                            if(this.width > this.height) {
                                image.css('height', '40px');
                            } else {
                                image.css('width', '40px');
                            }
                        })
                        .error(function () {
                            image.css('height', '40px');
                            image.css('width', '40px');
                        });
                });



                $('#view-ride .cost').html('$' + ride.cost.toFixed(2));
                $('#view-ride .notes').html(ride.notes);

                var showAcceptRideButton = true;

                // El usuario es el creador del viaje
                if (user.id == ride.owner.id) {
                    showAcceptRideButton = false;
                } else {
                    // El viaje va lleno
                    if (takenSeats >= availableSeats) {
                        showAcceptRideButton = false;
                    } else {
                        // El usuario ya aceptó el viaje
                        for (var i=0; i < ride.users.length; i++) {
                            if (ride.users[i].id == user.id) {
                                showAcceptRideButton = false;
                            }
                        }
                    }
                }

                if (showAcceptRideButton) {
                    $('#btn-accept-ride').removeClass('ui-disabled');
                    $('#btn-accept-ride').show();
                }
                $('#view-ride .ui-content').show();
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
    $('#view-ride .passengers').html('');
    $('#view-ride .notes').html('');
}

//Funciones de Añadir viaje

function clearAddRide() {
    $('#add-ride-origin').val('');
    $('#add-ride-destination').val('');
    $('#add-ride-datetime').val('');
    $('#add-ride-seats').val('');
    $('#add-ride-cost').val('');
    $('#add-ride-notes').val('');
}

function addRide() {

    if ($("#add-ride-form").valid()){
        var user = JSON.parse(localStorage.user);
        var ride = {
            "ride": {
                "agreement_id": user.agreement_id,
                "user_id": user.id,
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

                    // ordenamos el arreglo de viajes por fecha
                    myRides.sort(function(a, b) {
                        if (a.ride_when.toLowerCase() < b.ride_when.toLowerCase())
                            return -1;
                        if (a.ride_when.toLowerCase() > b.ride_when.toLowerCase())
                            return 1;
                        return 0;
                    });

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
    showLoader();
    $('#btn-accept-ride').addClass('ui-disabled');

    var rideId = sessionStorage.rideId;
    var user = JSON.parse(localStorage.user);

    var data = {
        "user_id": user.id
    };

    $.ajax({
        type: "POST",
        url: "http://166.78.117.195/rides/" + rideId + "/book.json",
        data: data,
        dataType: "json",
        success: function(response) {
            if (response.success == true) {
                // eliminamos el viaje de la lista de viajes disponibles
                for (var i=0; i<allRides.length; i++) {
                    if (allRides[i].id == response.ride.id){
                        allRides.splice(i, 1);
                    }
                }

                // agregamos el viaje al arreglo de viajes a los que se subirá el usuario y luego lo reordenamos por fecha
                nextRides.push(response.ride);

                nextRides.sort(function(a, b) {
                    if (a.ride_when.toLowerCase() < b.ride_when.toLowerCase())
                        return -1;
                    if (a.ride_when.toLowerCase() > b.ride_when.toLowerCase())
                        return 1;
                    return 0;
                });

                updateDashboard();
                updateAllRides();
            }

            $('#btn-accept-ride').removeClass('ui-disabled');
            hideLoader();
            alert(response.message);
        },
        error: function(error) {
            $('#btn-accept-ride').removeClass('ui-disabled');
            hideLoader();
            alert('El viaje no se pudo reservar');
        }
    });


    updateDashboard();
    $.mobile.changePage($('#view-ride'), {transition: 'slide', reverse: 'true'});
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
