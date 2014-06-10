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
			//$.mobile.changePage($('#dashboard'), {transition: 'none'});
		}
		
        if(device.platform=="iPhone"){
        	StatusBar.overlaysWebView(false);
        }
             
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
                $('#view-my-ride .name').html(ride.name);
                $('#view-my-ride .date').html(ride.date);
                $('#view-my-ride .time').html(ride.time);
				$('#view-my-ride .from').html(ride.from);
				$('#view-my-ride .to').html(ride.to);

                var seats = '';
                var availableSeats = ride.availableSeats;
                var takenSeats = ride.takenSeats;

                for(var i=0; i<availableSeats; i++) {
                    if(i<takenSeats) {
                        seats += '<img src="img/person.png"/>';
                    } else {
                        seats += '<img src="img/person_grey.png"/>';
                    }
                }

                $('#view-my-ride .seats').html(seats);

                $('#view-my-ride .notes').html(ride.notes);

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
                $('#view-next-ride .name').html(ride.name);
                $('#view-next-ride .date').html(ride.date);
                $('#view-next-ride .time').html(ride.time);
                $('#view-next-ride .from').html(ride.from);
                $('#view-next-ride .to').html(ride.to);

                var seats = '';
                var availableSeats = ride.availableSeats;
                var takenSeats = ride.takenSeats;

                for(var i=0; i<availableSeats; i++) {
                    if(i<takenSeats) {
                        seats += '<img src="img/person.png"/>';
                    } else {
                        seats += '<img src="img/person_grey.png"/>';
                    }
                }

                $('#view-my-ride .seats').html(seats);

                $('#view-next-ride .notes').html(ride.notes);
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
                $('#view-ride .name').html(ride.name);
                $('#view-ride .date').html(ride.date);
                $('#view-ride .time').html(ride.time);
                $('#view-ride .from').html(ride.from);
                $('#view-ride .to').html(ride.to);

                var seats = '';
                var availableSeats = ride.availableSeats;
                var takenSeats = ride.takenSeats;

                for(var i=0; i<availableSeats; i++) {
                    if(i<takenSeats) {
                        seats += '<img src="img/person.png"/>';
                    } else {
                        seats += '<img src="img/person_grey.png"/>';
                    }
                }

                $('#view-my-ride .seats').html(seats);

                $('#view-ride .notes').html(ride.notes);
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
			//myRides.push({'from':'New Ride', 'to':'Mi casa'});
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
	//$.mobile.loading('hide');
}

function getDashboard() {
	showLoader();
	myRides = [
        {
            'id': 1,
            'name': 'Juan Camilo Pinzón',
            'from': 'Calle 20',
            'to': 'Bocayá',
            'date': '6 Junio',
            'time': '18:00',
            'availableSeats': 4,
            'takenSeats': 1,
            'notes': 'Camioneta negra afuera de la oficina'
        },
        {
            'id': 2,
            'name': 'Diego Miramontes',
            'from': 'Calle 40',
            'to': 'Av Carrera',
            'date': '6 Junio',
            'time': '19:00',
            'availableSeats': 4,
            'takenSeats': 2,
            'notes': 'No hago paradas'
        }
	];
	nextRides = [
        {
            'id': 3,
            'name': 'Ricardo Rosas',
            'from': 'Las Américas',
            'to': 'Ciudad de Calí',
            'date': '7 Junio',
            'time': '10:00',
            'availableSeats': 4,
            'takenSeats': 2,
            'notes': 'Nos vemos en la puerta de acceso al estacionamiento C, segundo nivel'
        },
        {
            'id': 4,
            'name': 'Juan Camilo Pinzón',
            'from': 'Av Carrera',
            'to': 'Calle 49',
            'date': '7 Junio',
            'time': '21:00',
            'availableSeats': 4,
            'takenSeats': 3,
            'notes': 'No se permite fumar'
        }
	];
}

function updateDashboard() {
	clearDashboard();
	var myRidesList = $('#list-my-rides');
	
	myRidesList.append($('<li data-role="list-divider" >Mis viajes publicados</li>'));
	for(var i=0; i<myRides.length; i++) {
		html = '<li class="ui-nodisc-icon" ride-id="' + myRides[i].id + '"><a>' + myRides[i].from + ' - ' + myRides[i].to + '</a></li>';
		myRidesList.append($(html));
	}
	
	myRidesList.listview('refresh');
	
	var nextRidesList = $('#list-next-rides');
	
	nextRidesList.append($('<li data-role="list-divider" >Viajes a los que apliqué</li>'));
	for(var i=0; i<nextRides.length; i++) {
		html = '<li class="ui-nodisc-icon" ride-id="' + nextRides[i].id + '"><a>' + nextRides[i].from + ' - ' + nextRides[i].to + '</a></li>';
		nextRidesList.append($(html));
	}
	
	nextRidesList.listview('refresh');

    hideLoader();
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
            'name': 'Juan Camilo Pinzón',
            'from': 'Calle 20',
            'to': 'Bocayá',
            'date': '6 Junio',
            'time': '18:00',
            'availableSeats': 4,
            'takenSeats': 3,
            'notes': 'Camioneta negra afuera de la oficina'
		},
		{
            'id': 2,
            'name': 'Diego Miramontes',
            'from': 'Calle 40',
            'to': 'Av Carrera',
            'date': '6 Junio',
            'time': '19:00',
            'availableSeats': 4,
            'takenSeats': 2,
            'notes': 'No hago paradas'
		},
		{
            'id': 3,
            'name': 'Ricardo Rosas',
            'from': 'Las Américas',
            'to': 'Ciudad de Calí',
            'date': '7 Junio',
            'time': '10:00',
            'availableSeats': 4,
            'takenSeats': 4,
            'notes': 'Nos vemos en la puerta de acceso al estacionamiento C, segundo nivel'
		},
        {
            'id': 4,
            'name': 'Juan Camilo Pinzón',
            'from': 'Av Carrera',
            'to': 'Calle 49',
            'date': '7 Junio',
            'time': '21:00',
            'availableSeats': 4,
            'takenSeats': 1,
            'notes': 'No se permite fumar'
        }
	];
}

function updateAllRides() {
	clearAllRides();
	var allRidesList = $('#list-all-rides');
	
	allRidesList.append($('<li data-role="list-divider" >Todos los viajes</li>'));
	for(var i=0; i<allRides.length; i++) {
		html = '<li ride-id="' + allRides[i].id + '"><a>' + allRides[i].from + ' - ' + allRides[i].to + '</a></li>';
		allRidesList.append($(html));
	}
	
	allRidesList.listview('refresh');
	
	hideLoader();
}

function clearAllRides() {
	var allRidesList = $('#list-all-rides');

	allRidesList.html('');
}


/*funciones para persitencia de datos*/

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

function validaDatos(){
	var id = $('#id').val();
	var pass = $('#pass').val();
	//si el usuario ingreso datos de login
	/*if((id != null && id != undefined && id != "") && (pass != null && pass != undefined && pass != "")){ 
		if(isCache('id') && isCache(pass)){
			//si ya existen id y pass en la memoria pero se debe volver a iniciar sesion
			var storedId = getCache('id');
			var storedPass = getCache('pass');
			if((id == storedID) && (pass == storedPass)){
				//login correcto
				$.mobile.changePage($('#dashboard'), {transition: 'slide'});
			}else{
				//login incorrecto
				console.log("Verifica tu id y contrase�a");
			}
		}else{
			//si no existen id y pass en la memoria
			setCache("id", id);
			setCache("pass", pass);
			$.mobile.changePage($('#dashboard'), {transition: 'slide'});
		}		
	}else{
		console.log("Ingresa tu id y contrase�a");
	}*/
}

function addRide() {
    //myRides.push({'from':'New Ride', 'to':'Mi casa'});
    updateDashboard();
    $.mobile.changePage($('#dashboard'), {transition: 'slide', reverse: 'true'});
}

function acceptRide() {
    //myRides.push({'from':'New Ride', 'to':'Mi casa'});
    updateDashboard();
    $.mobile.changePage($('#dashboard'), {transition: 'slide', reverse: 'true'});
}

