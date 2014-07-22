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
        document.addEventListener("backbutton", onBackKeyDown, false);
        function onBackKeyDown(e) {
            e.preventDefault();
        }

        navigator.splashscreen.hide();

        var imgLoad = imagesLoaded('#splash_table');

        imgLoad.on('always', function() {
            var i = 0;
            var animation = setInterval(function(){
                if (i <= 4) {
                    $('.splash-cell img').hide()
                    $('.splash-cell img[splash_frame="' + i + '"]').show();
                    i++;
                } else {
                    clearInterval(animation);

                    if (getCache('rememberMe')) {
                        logIn(true);
                    } else {
                        window.scrollTo(0,0);
                        $.mobile.changePage($('#login'), {transition: 'slide'});
                    }
                }
            }, 1000);
        });

        $('#sign_up_add_vehicle').change(function(){
            if ($("#sign_up_add_vehicle").is(':checked')) {
                $('#sign-up-vehicle-form').show();
                if (!$("#sign_up_vehicle_owner").is(':checked')) {
                    $("#sign_up_vehicle_owner").click();
                }
                $('#sign_up_vehicle_document_type').addClass('required');
                $('#sign_up_vehicle_document_id').addClass('required');
                $('#sign_up_vehicle_plates').addClass('required');
                $('#sign_up_vehicle_soat').addClass('required');

                $("#sign-up-vehicle-form").validate({
                    errorPlacement: function(error, element) {
                        error.appendTo(element.parent().parent().after());
                    }
                }).reset();
            } else {
                $('#sign-up-vehicle-form').hide();
                $('#sign_up_vehicle_document_type').removeClass('required');
                $('#sign_up_vehicle_document_id').removeClass('required');
                $('#sign_up_vehicle_plates').removeClass('required');
                $('#sign_up_vehicle_soat').removeClass('required');

                $("#sign-up-vehicle-form").unbind('submit');
            }
        });

        $('#sign_up_vehicle_owner').change(function(){
            if ($("#sign_up_vehicle_owner").is(':checked')) {
                $('#sign_up_vehicle_document_type').parents('div[data-role="fieldcontainer"]').hide();
                $('#sign_up_vehicle_document_id').parents('div[data-role="fieldcontainer"]').hide();
            } else {
                $('#sign_up_vehicle_document_type').parents('div[data-role="fieldcontainer"]').show();
                $('#sign_up_vehicle_document_id').parents('div[data-role="fieldcontainer"]').show();

                if ($('#sign-up-vehicle-form label.error').filter(':visible').length) {
                    $("#sign-up-vehicle-form").valid();
                }
            }
        });

        $('#add_vehicle_owner').change(function(){
            if ($("#add_vehicle_owner").is(':checked')) {
                $('#add_vehicle_document_type').parents('div[data-role="fieldcontainer"]').hide();
                $('#add_vehicle_document_id').parents('div[data-role="fieldcontainer"]').hide();

                $('#add_vehicle_document_type').removeClass('required');
                $('#add_vehicle_document_id').removeClass('required');
            } else {
                $('#add_vehicle_document_type').parents('div[data-role="fieldcontainer"]').show();
                $('#add_vehicle_document_id').parents('div[data-role="fieldcontainer"]').show();

                $('#add_vehicle_document_type').addClass('required');
                $('#add_vehicle_document_id').addClass('required');

                if ($('#add-vehicle-form label.error').filter(':visible').length) {
                    $("#add-vehicle-form").valid();
                }
            }

            $("#add-vehicle-form").validate({
                errorPlacement: function(error, element) {
                    error.appendTo(element.parent().parent().after());
                }
            }).reset();

        });

        $('.acc-btn-back').click(function() {
            var transition = 'slide';
            if ($(this).attr('transition')) {
                transition = $(this).attr('transition');
            }

            window.scrollTo(0,0);
            $.mobile.changePage($('#' + $(this).attr('previous-page')), {transition: transition, reverse: 'true'});
        });

        $('#acc-btn-menu').click(function() {
            $('#dashboard-menu').popup('open');
        });

        $('#acc-btn-refresh-dashboard').click(function() {
            getDashboard();
        });

        $('#acc-btn-refresh-search').click(function() {
            refreshAllRides();
        });
        
        document.addEventListener("deviceready", onDeviceReady, false);
	        function onDeviceReady() {
	            document.addEventListener("backbutton", function (e) {
	                e.preventDefault();
	            }, false );
	    };
        
    }
};

$(document).on('pagebeforeshow', "#login", function (event, data) {
    clearLogIn();
});

$(document).on('pagebeforeshow', "#sign-up", function (event, data) {
    $("#sign-up-form").validate({
        errorPlacement: function(error, element) {
            error.appendTo(element.parent().parent().after());
        },
        rules: {
            sign_up_password_confirmation : {
                equalTo: "#sign_up_password"
            },
            sign_up_email : {
                domain : true
            }
        }
    }).resetForm();

    $("#sign-up-vehicle-form").validate({
        errorPlacement: function(error, element) {
            error.appendTo(element.parent().parent().after());
        }
    }).resetForm();

    $("#sign-up-terms-form").validate({
        errorPlacement: function(error, element) {
            error.appendTo(element.parent().parent().after());
        },
        messages: {
            sign_up_terms: {
                required: "Debes leer y aceptar los términos y condiciones"
            }
        }
    }).resetForm();
});

$(document).on('pagebeforeshow', "#forgot", function (event, data) {
    clearForgot();

    $("#forgot-form").validate({
        errorPlacement: function(error, element) {
            error.appendTo(element.parent().parent().after());
        }
    }).reset();
});

$(document).on('pagebeforeshow', "#welcome", function (event, data) {
    var user = getCache('user');

    $('#welcome .welcome-name').html('¡Hola ' + user.first_name + '!');

    // Espera 3 segundos antes de ir al dashboard
    setTimeout(function(){
        window.scrollTo(0,0);
        $.mobile.changePage($('#dashboard'), {transition: 'none'});
        getDashboard();
    }, 3000);

});

$(document).on('pagebeforeshow', "#dashboard", function (event, data) {
    $('#popup').popup('reposition', 'positionTo: window');
});

$(document).on('pagebeforeshow', '#profile', function(){
    getProfile();
});

$(document).on('pagebeforeshow', '#add-vehicle', function(){
    clearAddVehicle();

    $("#add-vehicle-form").validate({
        errorPlacement: function(error, element) {
            error.appendTo(element.parent().parent().after());
        }
    }).reset();

    if (!$("#add_vehicle_owner").is(':checked')) {
        $("#add_vehicle_owner").click();
    }
});

$(document).on('pagebeforeshow', '#search-ride', function(){
    // Iniciamos el timer de actualización de la información
    allRidesTimer = setInterval(function(){
        compareAllRides();
    }, 60000);
});

$(document).on('pagebeforehide', '#search-ride', function(){
    clearInterval(allRidesTimer);
});

$(document).on("pagebeforeshow", "#add-ride", function() {
    clearAddRide();

    $("#add-ride-form").validate({
        errorPlacement: function(error, element) {
            error.appendTo(element.parent().parent().after());
        }
    }).resetForm();

});

$(document).on('pagebeforeshow', "#view-ride", function (event, data) {
    $('#bnt-back-view-ride').attr('previous-page', sessionStorage.previousPage)
    var rideId = sessionStorage.rideId;

    if (rideId) {
        getRideDetail(rideId);
    } else {
        showAlert('Detalles del viaje', 'Hubo un error al obtener los detalles del viaje. Intenta nuevamente.');
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

jQuery.validator.addMethod("domain", function(value, element) {

    if (value) {
        var domain = value.split("@")[1];
        if (domain && domain != "" && domain == $('#sign_up_domain').val()) {
            return true;
        }
    }
    return false;

}, "La dirección de correo no corresponde con la empresa seleccionada");

var agreements = new Array();
var myRides = new Array();
var nextRides = new Array();
var allRides = new Array();
var allRidesTimer = null;

var months = new Array("Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic");
var days = new Array("Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado");

function showLoader() {
    $('.overlay').show();
    $('#loader').show();
}

function hideLoader() {
    $('.overlay').hide();
    $('#loader').hide();
}

function showAlert(title, message, onCloseFunction) {
    var popUp = '<div data-role="popup" id="popupAlert" data-overlay-theme="a" data-theme="a" data-dismissible="true">' +
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
            if (onCloseFunction !== undefined){
                onCloseFunction();
            }
        },
        transition: 'pop'
    });
    $('#popupAlert').popup('open');
}

function showDialog(title, message, acceptFunction) {
    var popUp = '<div data-role="popup" id="popupDialog" data-overlay-theme="a" data-theme="a" data-dismissible="false">' +
        '<div data-role="header" data-theme="a">' +
            '<h1>' + title + '</h1>' +
        '</div>' +
        '<div class="popup-content">' +
            '<p>' + message + '</p>' +
            '<div class="confirmation-buttons">' +
                '<a href="#" class="cancel" data-role="button" data-inline="true" data-rel="back" data-theme="a">Cancelar</a>' +
                '<a href="#" class="ok" data-role="button" data-inline="true" data-theme="a">Eliminar</a>' +
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

    $('#popupDialog').popup('open');
}

// Funciones de Login

function clearLogIn() {
    $('#login-tipo-identificacion').val('');
    $('#login-tipo-identificacion').selectmenu('refresh', true);
    $('#login-identificacion').val('');
    $('#login-password').val('');
}

function logIn(autologin) {
    var rememberMe = false;
    var data = {}

    if (autologin == false) {
        rememberMe = $("#login-remember-me").is(':checked');

        /*data = {
         "document_type": $('#login-tipo-identificacion').val(),
         "document_id": $('#login-identificacion').val(),
         "password": $('#login-password').val()
         };*/

        data = {
            "document_type": 'CC',
            "document_id": '12345',
            "password": '00000000'
        };
    } else {
        rememberMe = true;

        var user = getCache('user');
        data = {
            "user_id": user.id,
            "auth_token" : user.authentication_token
        };
    }

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

                // Precargar la imagen de #welcome antes de redirigir al usuario

                $('<img/>')
                    .attr('src', 'http://166.78.117.195' + response.user.agreement_logo)
                    .load(function(){
                        hideLoader();
                        $('#welcome .welcome-cell img').attr('src', 'http://166.78.117.195' + response.user.agreement_logo);
                        window.scrollTo(0,0);
                        $.mobile.changePage($('#welcome'), {transition: 'none'});
                    })
                    .error(function(){
                        hideLoader();
                        window.scrollTo(0,0);
                        $.mobile.changePage($('#dashboard'), {transition: 'none'});
                        getDashboard();
                    });

            } else {
                hideLoader();
                showAlert('Iniciar sesión',
                          response.message,
                          function(){
                              window.scrollTo(0,0);
                              $.mobile.changePage($('#login'), {transition: 'none'});
                          }
                );
            }
        },
        error: function(error) {
            hideLoader();
            showAlert('Iniciar sesión', 'Hubo un error al iniciar la sesión. Intenta nuevamente.');
        }
    });
}

function logOut() {
    showLoader();

    var user = getCache('user');
    var data = {
        "auth_token": user.authentication_token,
        "user_id": user.id
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
            hideLoader();
            showAlert('Cerrar sesión', 'Ocurrió un error al intentar cerrar la sesión. Intenta nuevamente.');
        }
    });
}

// Funciones de Sign-up

function openSignUp() {
    clearSignUp();
    window.scrollTo(0,0);
    $.mobile.changePage($('#sign-up'), {transition: 'none'});
    getAgreements();
}

function clearSignUp() {
    $('#sign_up_domain').val('');
    $('#sign_up_agreement').html('<option value="">Selecciona tu empresa</option>');
    $('#sign_up_agreement').val('');
    $('#sign_up_agreement').selectmenu();
    $('#sign_up_agreement').selectmenu('refresh', true);
    $('#sign_up_document_type').val('');
    $('#sign_up_document_type').selectmenu();
    $('#sign_up_document_type').selectmenu('refresh', true);
    $('#sign_up_document_id').val('');
    $('#sign_up_first_name').val('');
    $('#sign_up_last_name').val('');
    $('#sign_up_email').val('');
    $('#sign_up_password').val('');
    $('#sign_up_password_confirmation').val('');

    if ($("#sign_up_add_vehicle").is(':checked')) {
        $("#sign_up_add_vehicle").click();
    }

    $('#sign_up_vehicle_document_type').selectmenu();
    $('#sign_up_vehicle_document_type').selectmenu('refresh', true);
    $('#sign_up_vehicle_document_id').val('');
    $('#sign_up_vehicle_plates').val('');
    $('#sign_up_vehicle_soat').val('');

    if ($("#sign_up_terms").is(':checked')) {
        $("#sign_up_terms").click();
    }
}

function getAgreements() {
    showLoader();

    $.ajax({
        type: "GET",
        url: "http://166.78.117.195/agreements.json?min=true",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            agreements = response;

            for (var i=0; i<agreements.length; i++){
                $('#sign_up_agreement').append('<option value="' + agreements[i].id + '">' + agreements[i].name + '</option>');
            }
            hideLoader();
        },
        error: function(error) {
            hideLoader();
            showAlert('Registro', 'Hubo un error al obtener las empresas con convenio. Intenta nuevamente.');
        }
    });
}

function updateSelectedAgreement() {
    for (var i=0; i<agreements.length; i++) {
        if (agreements[i].id == $('#sign_up_agreement').val()) {
            $('#sign_up_domain').val(agreements[i].mail_domain);
        }
    }
}

function openTerms() {
    window.scrollTo(0,0);
    $.mobile.changePage($('#terms'), {transition: 'none'});
}

function signUp() {
    if ($("#sign-up-form").valid() & $("#sign-up-vehicle-form").valid() & $("#sign-up-terms-form").valid()){

        var data = {
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
                showAlert('Registro', 'Ocurrió un error al intentar registrarte. Intenta nuevamente.');
            }
        });
    }
}

// Funciones de Forgot

function clearForgot() {
    $('#forgot_problem').val('');
    $('#forgot_problem').selectmenu('refresh', true);
    $('#forgot_email').val('');
}

function sendMail() {
    if ($("#forgot-form").valid()){

        var data = {
            "utf8": "V",
            "user": {
                "email": $('#forgot_email').val()
            }
        };

        showLoader();

        if ($('#forgot_problem').val() == 'forgot') {
            $.ajax({
                type: "POST",
                url: "http://166.78.117.195/users/password.json",
                data: data,
                dataType: "json",
                success: function(response) {
                    if (response.success == true) {
                        hideLoader();
                        showAlert('Contraseña',
                                  response.message,
                                  function(){
                                      window.scrollTo(0,0);
                                      $.mobile.changePage($('#login'), {transition: 'none'});
                                  }
                        );
                    } else {
                        hideLoader();
                        showAlert('Contraseña', response.message);
                    }
                },
                error: function(error) {
                    hideLoader();
                    showAlert('Contraseña', "El correo con las intrucciones para recuperar tu contraseña no pudo ser enviado.");
                }
            });
        } else if ($('#forgot_problem').val() == 'confirmation') {
            $.ajax({
                type: "POST",
                url: "http://166.78.117.195/users/confirmation.json",
                data: data,
                dataType: "json",
                success: function(response) {
                    if (response.success == true) {
                        hideLoader();
                        showAlert('Confirmación',
                                  response.message,
                                  function(){
                                      window.scrollTo(0,0);
                                      $.mobile.changePage($('#login'), {transition: 'none'});
                                  }
                        );
                    } else {
                        hideLoader();
                        showAlert('Confirmación', response.message);
                    }
                },
                error: function(error) {
                    hideLoader();
                    showAlert('Confirmación', "El correo de confirmación no pudo ser enviado.");
                }
            });
        }


    }
}

// Funciones de Profile

function clearProfile() {
    $('#profile .profile-picture').html('');
    $('#profile .profile-name').html('');
    $('#profile .profile-email').html('');
    $('#profile .profile-vehicles').html('');
    $('#btn-add-vehicle').hide();
}

function getProfile() {
    showLoader();
    clearProfile();
    var user = getCache('user');

    $.ajax({
        type: "GET",
        url: "http://166.78.117.195/users/" + user.id + "/detail.json",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            if(response.id) {
                var user = response;

                if (user.avatar) {
                    $('<img/>')
                        .attr('src', 'http://166.78.117.195' + user.avatar)
                        .load(function(){
                            $('#profile .profile-picture').html('<img id="profile-picture" src="http://166.78.117.195' + user.avatar + '"/>');
                            hideLoader();
                        })
                        .error(function(){
                            hideLoader();
                        });
                }

                $('#profile .profile-name').html(user.first_name + ' ' + user.last_name);
                $('#profile .profile-email').html('<a mailto:"' + user.email + '">' + user.email + '</a>');

                var vehicleHTML = '<hr class="separator"><b>Mis vehículos</b><hr class="separator">';

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

                $('#btn-add-vehicle').show();
            } else {
                hideLoader();
                showAlert('Mi perfil',
                          'Hubo un error al cargar tu perfil. Intenta nuevamente.',
                          function() {
                              window.scrollTo(0,0);
                              $.mobile.changePage($('#dashboard'), {transition: 'slide'});
                          }
                );
            }
        },
        error: function(error) {
            hideLoader();
            showAlert('Mi perfil', 'Hubo un error al cargar tu perfil. Intenta nuevamente.');
        }
    });
}

function getPicture() {
    navigator.camera.getPicture(
        function(imageData) {
            showLoader();
            var user = getCache('user');
            var data = {
                "user": {
                    "avatar": imageData
                }
            };

            $.ajax({
                type: "POST",
                url: "http://166.78.117.195/users/" + user.id + "/change_avatar.json",
                data: data,
                dataType: "json",
                success: function(response) {
                    if (response.success == true) {
                        $('<img/>')
                            .attr('src', 'http://166.78.117.195' + response.avatar)
                            .load(function(){
                                $('#profile .profile-picture').html('<img id="profile-picture" src="http://166.78.117.195' + response.avatar + '"/>');
                                hideLoader();
                            })
                            .error(function(){
                                hideLoader();
                            });
                    } else {
                        hideLoader();
                        showAlert('Mi perfil', response.message);
                    }
                },
                error: function(error) {
                    hideLoader();
                    showAlert('Mi perfil', 'Ocurrió un error al cambiar la foto de tu perfil. Intenta nuevamente.');
                }
            });
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

// Funciones de Add Vehicle

function clearAddVehicle() {
    $('#add_vehicle_document_type').selectmenu('refresh', true);
    $('#add_vehicle_document_id').val('');
    $('#add_vehicle_plates').val('');
    $('#add_vehicle_soat').val('');
}

function addVehicle() {
    if ($("#add-vehicle-form").valid()){

        var user = getCache('user');

        var data = {};

        if ($('#add_vehicle_owner').is(':checked')) {
            data.vehicle = {
                "plate_number": $('#add_vehicle_plates').val().toUpperCase(),
                "soat_date": $('#add_vehicle_soat').val(),
                "document_type_owner": user.document_type,
                "document_id_owner": user.document_id
            };
        } else {
            data.vehicle = {
                "plate_number": $('#add_vehicle_plates').val().toUpperCase(),
                "soat_date": $('#add_vehicle_soat').val(),
                "document_type_owner": $('#add_vehicle_document_type').val(),
                "document_id_owner": $('#add_vehicle_document_id').val()
            };
        }

        showLoader();
        $.ajax({
            type: "POST",
            url: "http://166.78.117.195/users/" + user.id + "/add_vehicle.json",
            data: data,
            dataType: "json",
            success: function(response) {
                if (response.success == true) {
                    hideLoader();
                    user.vehicles = response.vehicles;
                    setCache('user', user);
                    showAlert('Agregar vehículo',
                              response.message,
                              function(){
                                  window.scrollTo(0,0);
                                  $.mobile.changePage($('#profile'), {transition: 'none'});
                              }
                    );
                } else {
                    hideLoader();
                    showAlert('Agregar vehículo', response.message);
                }
            },
            error: function(error) {
                hideLoader();
                showAlert('Agregar Vehículo', 'Ocurrió un error al agregar el vehículo. Intenta nuevamente.');
            }
        });
    }
}

// Funciones de Dashboard

function getDashboard() {
	showLoader();

    var user = getCache('user');

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
            showAlert('Inicio', 'Hubo un error al obtener la información de los viajes publicados y reservados. Intenta Nuevamente.');
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
            var myRideDateText = getDateFromMysql(myRides[i].ride_when)

            if (myRideDateText != dateText) {
                myRidesList.append($('<li data-role="list-divider" class="date-divider">' + myRideDateText + '</li>'));
                dateText = myRideDateText;
            }

            var html = '<li class="ui-nodisc-icon">' +
                            '<a onclick="showRideDetail(' + myRides[i].id + ', \'dashboard\')">' +
                                '<div>' + myRides[i].origin + ' - ' + myRides[i].destination + '</div>'+
                                '<div>' + getTimeFromMysql(myRides[i].ride_when) + '</div>' +
                            '</a>' +
                        '</li>';
            myRidesList.append($(html));
        }
    } else {
        myRidesList.append($('<li>No tienes viajes publicados</li>'));
    }

    myRidesList.listview('refresh');

    var nextRidesList = $('#list-next-rides');

    nextRidesList.append($('<li data-role="list-divider">Mis viajes reservados</li>'));

    if (nextRides.length > 0) {
        var dateText = '';

        for(var i=0; i<nextRides.length; i++) {
            var nextRideDateText = getTimeFromMysql(nextRides[i].ride_when);

            if (nextRideDateText != dateText) {
                nextRidesList.append($('<li data-role="list-divider" class="date-divider">' + getDateFromMysql(nextRides[i].ride_when) + '</li>'));
                dateText = nextRideDateText;
            }

            var html = '<li class="ui-nodisc-icon">' +
                            '<a onclick="showRideDetail(' + nextRides[i].id + ', \'dashboard\')">' +
                                '<div>' + nextRides[i].origin + ' - ' + nextRides[i].destination + '</div>' +
                                '<div>' + getTimeFromMysql(nextRides[i].ride_when) + '</div>' +
                            '</a>' +
                        '</li>';
            nextRidesList.append($(html));
        }
    } else {
        nextRidesList.append($('<li>No tienes viajes reservados</li>'));
    }

    nextRidesList.listview('refresh');
}

// Funciones de Búsqueda de viajes

function compareAllRides() {
    var hash = getCache('allRidesHash');
    var user = getCache('user');

    $.ajax({
        type: "GET",
        url: "http://166.78.117.195/rides/available.json?user_id=" + user.id,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            if (response.hash != hash) {
                $('#search-ride .refresh-notification').show();
                clearInterval(allRidesTimer);
            }
            setCache('allRidesHash', response.hash);
        },
        error: function(error) {
        }
    });

}

function getAllRides() {
    showLoader();
    $('#search-ride .refresh-notification').hide();
    $('#search-ride .ui-content').hide();

    var user = getCache('user');
    $.ajax({
        type: "GET",
        url: "http://166.78.117.195/rides/available.json?user_id=" + user.id,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            allRides = response.rides;
            setCache('allRidesHash', response.hash);
            updateAllRides();
            $('#search-ride .ui-content').show();
            hideLoader();
        },
        error: function(error) {
            hideLoader();
            showAlert('Buscar viajes', 'Hubo un error al obtener la información de los viajes disponibles. Intenta nuevamente.');
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
            var rideDateText = getDateFromMysql(allRides[i].ride_when);

            if (rideDateText != dateText) {
                allRidesList.append($('<li data-role="list-divider" class="date-divider">' + rideDateText + '</li>'));
                dateText = rideDateText;
            }

            var html = '<li class="ui-nodisc-icon">' +
                            '<a onclick="showRideDetail(' + allRides[i].id + ', \'search-ride\')">' +
                                '<div>' + allRides[i].origin + ' - ' + allRides[i].destination + '</div>' +
                                '<div>' + getTimeFromMysql(allRides[i].ride_when) + '</div>' +
                            '</a>' +
                        '</li>';
            allRidesList.append($(html));
        }
    } else {
        allRidesList.append($('<li>No hay viajes disponibles</li>'));
    }

    allRidesList.listview('refresh');
}

function refreshAllRides() {
    window.scrollTo(0,0);
    $.mobile.changePage($('#search-ride'), {transition: 'none'});
    getAllRides();
}

// Funciones de Detalle de viaje

function showRideDetail(rideId, previousPage) {
    if(rideId !== undefined && previousPage !== undefined) {
        sessionStorage.rideId = rideId;
        sessionStorage.previousPage = previousPage;
    }
    window.scrollTo(0,0);
    $.mobile.changePage($('#view-ride'), {transition: 'slide'});
}

function getRideDetail(rideId) {
    showLoader();
    clearViewRide();
    $('#view-ride .ui-content').hide();
    $('#btn-accept-ride').hide();
    $('#btn-accept-ride').addClass('ui-disabled');

    var user = getCache('user');

    $.ajax({
        type: "GET",
        url: "http://166.78.117.195/rides/" + rideId + "/detail.json",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            if(response.id) {
                var ride = response;
                $('#view-ride .name').html('<a onclick="showUserProfile(' + ride.owner.id + ')">' + ride.owner.first_name + ' ' + ride.owner.last_name + '</a>');

                var date = createDateFromMysql(ride.ride_when);

                $('#view-ride .date').html(date.getDate() + ' ' + months[date.getMonth()]);
                $('#view-ride .time').html(("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2));
                $('#view-ride .time').html(ride.time);
                $('#view-ride .origin').html(ride.origin);
                $('#view-ride .destination').html(ride.destination);

                var availableSeats = ride.seats;
                var takenSeats = ride.users.length;

                for(var i=0; i<availableSeats; i++) {
                    if(i<takenSeats) {
                        if (ride.users[i].avatar) {
                            $('#view-ride .passengers').append($('<div class="seat"><div class="picture-container" onclick="showUserProfile(' + ride.users[i].id + ')"><img src="' + 'http://166.78.117.195' + ride.users[i].avatar + '"/></div><div class="user-info"><div>' + ride.users[i].first_name + '</div><div><a href="mailto:' + ride.users[i].email + '">' + ride.users[i].email + '</a></div></div></div>'));
                        }
                    } else {
                        $('#view-ride .passengers').append($('<div class="seat"><div class="picture-container"><img src="http://166.78.117.195/users/avatars/default_grey.png"/></div><div class="user-info">Disponible</div></div>'));
                    }
                }

                var totalImages = $('#view-ride .picture-container img').length;
                var loadedImages = 0;
                $('#view-ride .picture-container img').each(function() {
                    var image = $(this);
                    $("<img/>")
                        .attr("src", image.attr('src'))
                        .load(function () {
                            loadedImages++;

                            if (loadedImages >= totalImages) {
                                hideLoader();
                            }
                        })
                        .error(function () {
                            hideLoader();
                        });
                });

                if (ride.cost == 0) {
                    $('#view-ride .cost').html('Sin costo');
                } else {
                    $('#view-ride .cost').html('$' + ride.cost.toFixed(2));
                }

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
                hideLoader();
                showAlert('Detalles del viaje', 'Hubo un error al obtener los detalles del viaje. Intenta nuevamente.');
            }
        },
        error: function(error) {
            hideLoader();
            showAlert('Detalles del viaje', 'Hubo un error al obtener los detalles del viaje. Intenta nuevamente.');
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

// Funciones de Mi Perfil

function clearUserProfile() {
    $('#user-profile .profile-picture').html('');
    $('#user-profile .profile-name').html('');
    $('#user-profile .profile-email').html('');
}

function showUserProfile(userId) {
    clearUserProfile();
    showLoader();

    $.ajax({
        type: "GET",
        url: "http://166.78.117.195/users/" + userId + "/detail.json",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            if(response.id) {
                var user = response;

                if (user.avatar) {
                    $('<img/>')
                        .attr('src', 'http://166.78.117.195' + user.avatar)
                        .load(function(){
                            $('#user-profile .profile-picture').html('<img src="http://166.78.117.195' + user.avatar + '"/>');
                            hideLoader();
                        })
                        .error(function(){
                            hideLoader();
                        });
                }
                $('#user-profile .profile-name').html(user.first_name + ' ' + user.last_name);
                $('#user-profile .profile-email').html('<a mailto:"' + user.email + '">' + user.email + '</a>');

                window.scrollTo(0,0);
                $.mobile.changePage($('#user-profile'), {transition: 'none'});
            } else {
                hideLoader();
                showAlert('Pasajero',
                          'Hubo un error al cargar los datos del pasajero. Intenta nuevamente.',
                          function(){
                              window.scrollTo(0,0);
                              $.mobile.changePage($('#view-ride'), {transition: 'none'});
                          }
                );
            }
        },
        error: function(error) {
            hideLoader();
            showAlert('Pasajero', 'Hubo un error al cargar los datos del pasajero. Intenta nuevamente.');
        }
    });
}

function confirmDeleteVehicle(vehiclePlateNumber) {
    showDialog('Eliminar Vehículo',
        '¿Estás seguro que deseas eliminar el vehículo?',
        function() {
            var user = getCache('user');
            var vehicle = {
                "vehicle": {
                    "plate_number": vehiclePlateNumber
                }
            };

            showLoader();
            $.ajax({
                type: "POST",
                url: "http://166.78.117.195/users/" + user.id + "/remove_vehicle.json",
                data: vehicle,
                dataType: "json",
                success: function(response) {
                    if (response.success == true) {
                        hideLoader();
                        showAlert('Eliminar Vehículo', response.message);
                        user.vehicles = response.vehicles;
                        setCache('user', user);
                        getProfile();
                    } else {
                        hideLoader();
                        showAlert('Eliminar Vehículo', response.message);
                    }
                },
                error: function(error) {
                    hideLoader();
                    showAlert('Eliminar Vehículo', 'Ocurrió un error al eliminar el vehículo. Intenta nuevamente.');
                }
            });
        }
    );
}

// Funciones de Añadir viaje

function clearAddRide() {
    $('#add_ride_origin').val('');
    $('#add_ride_destination').val('');
    $('#add_ride_datetime').val('');
    $('#add_ride_seats').val('');
    $('#add_ride_cost').val('');
    $('#add_ride_notes').val('');

    var user = getCache('user');

    var vehiclesHTML = '<option value="">Selecciona placas</option>';
    if (user.vehicles && user.vehicles.length) {
        for (var i=0; i<user.vehicles.length; i++){
            vehiclesHTML += '<option value="' + user.vehicles[i].plate_number + '">' + user.vehicles[i].plate_number + '</option>';
        }
    }

    $('#add_ride_vehicle_plates').html(vehiclesHTML);
    $('#add_ride_vehicle_plates').val('');
    $('#add_ride_vehicle_plates').selectmenu('refresh', true);
}

function addRide() {

    if ($("#add-ride-form").valid()){
        var user = getCache('user');
        var ride = {
            "ride": {
                "agreement_id": user.agreement_id,
                "user_id": user.id,
                "ride_when": $('#add_ride_datetime').val(),
                "cost": (($('#add_ride_cost').val().length > 0) ? $('#add_ride_cost').val() : 0),
                "seats": $('#add_ride_seats').val(),
                "origin": $('#add_ride_origin').val(),
                "destination": $('#add_ride_destination').val()
            }
        };

        if ($('#add_ride_vehicle_plates').val()) {
            ride.ride.notes = $('#add_ride_notes').val() + '<div>Placas del vehículo: ' + $('#add_ride_vehicle_plates').val() + '</div>';
        } else {
            ride.ride.notes = $('#add_ride_notes').val() + '<div>No se especifican las placas del vehículo.</div>';
        }

        showLoader();
        $.ajax({
            type: "POST",
            url: "http://166.78.117.195/rides.json",
            data: ride,
            dataType: "json",
            success: function(response) {
                if (response.success == true) {
                    showAlert('Publicar viaje',
                              response.message,
                              function(){
                                  window.scrollTo(0,0);
                                  $.mobile.changePage($('#dashboard'), {transition: 'none'});
                                  getDashboard();
                              }
                    );
                } else {
                    hideLoader();
                    showAlert('Publicar viaje', response.message);
                }
            },
            error: function(error) {
                hideLoader();
                showAlert('Publicar viaje', 'Ocurrió un error al publicar el viaje. Intenta nuevamente.');
            }
        });
    }
}

function acceptRide() {
    showLoader();
    $('#btn-accept-ride').addClass('ui-disabled');

    var rideId = sessionStorage.rideId;
    var user = getCache('user');

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
                getDashboard();
                sessionStorage.rideId = rideId;
                sessionStorage.previousPage = 'search-ride';
                window.scrollTo(0,0);
                getRideDetail(rideId);
            }

            $('#btn-accept-ride').removeClass('ui-disabled');
            hideLoader();
            showAlert('Reservar lugar', response.message);
        },
        error: function(error) {
            $('#btn-accept-ride').removeClass('ui-disabled');
            hideLoader();
            showAlert('Reservar lugar', 'El viaje no se pudo reservar. Intenta nuevamente.');
        }
    });
}


// Funciones para persitencia de datos

function setCache(key, value) {
  if (localStorage.rememberMe == 'true') {
      window.localStorage.setItem(key, JSON.stringify(value));
  } else {
      window.sessionStorage.setItem(key, JSON.stringify(value));
  }

}

function getCache(key) {
  if (localStorage.rememberMe == 'true') {
      return JSON.parse(window.localStorage.getItem(key));
  } else {
      return JSON.parse(window.sessionStorage.getItem(key));
  }
}

function isCache(key) {
  return window.localStorage.getItem(key) !== null && window.localStorage.getItem(key) !== undefined;
}

function removeCache(key) {
    if (localStorage.rememberMe == 'true') {
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

function getDateFromMysql(dateString) {
    var date = createDateFromMysql(dateString);
    return days[date.getDay()] + ' ' + date.getDate() + ' ' + months[date.getMonth()];
}

function getTimeFromMysql(dateString) {
    var date = createDateFromMysql(dateString);
    return (date.getHours()<10?'0':'') + date.getHours() + ':' + (date.getMinutes()<10?'0':'') + date.getMinutes() + ' hrs';

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
