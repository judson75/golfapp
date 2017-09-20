// Initialize app
var app = new Framework7();


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var serviceURL = 'http://myloanzapper.com/api/v1/';
var storage = window.localStorage;

// Add view
var mainView = app.addView('.view-main', {
    dynamicNavbar: true
});

//deleteStorage('app_login');
//setStorage('user_id', 1);
//setStorage('max_accounts', 1);

//console.log("LOGGED IN: " + isLoggedIn());
if(isLoggedIn() !== true) {
	//mainView.router.load({pageName: 'dashboard'});
	mainView.router.loadPage('welcome.html');
}
else {
	buildDashboard();
	$('.toolbar').show();
}

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
    //alert("READY");
	//Push Notify
	var push = PushNotification.init({
		"android": {
			"senderID": "1058444389453"
		},
		"browser": {},
		"ios": {
			"sound": true,
			"vibration": true,
			"badge": true
		},
		"windows": {}
	});
	
	oldRegId = getStorage('registrationId');
	push.on('registration', function(data) {   
		//alert("reg Data: " + data.registrationId);  //this function give registration id from the GCM server if you dont want to see it please comment it
		if(data.registrationId != oldRegId) {
			setStorage('registrationId', data.registrationId);
		}
	});
	
	push.on('error', function(e) {
		alert("push error = " + e.message);
	});

	push.on('notification', function(data) {
		alert('notification event');
		navigator.notification.alert(
			data.message,         // message
			null,                 // callback
			data.title,           // title
			'Ok'                  // buttonName
		);
	});
	
	AppRate.preferences.storeAppURL = {
	  ios: '<my_app_id>',
	  android: 'market://details?id=com.loanzapper.app',
	  windows: 'ms-windows-store://pdp/?ProductId=<the apps Store ID>',
	  blackberry: 'appworld://content/[App Id]/',
	  windows8: 'ms-windows-store:Review?name=<the Package Family Name of the application>'
	};
	
	AppRate.preferences.displayAppName = 'LoanZapper';
	AppRate.preferences.usesUntilPrompt = 10;
	AppRate.promptForRating(false);
})

$$(document).on('pageReinit', function (e) {
    // Get page data from event data
    var page = e.detail.page;
	console.log("PAGE REINIT NAME: " + page.name);

})
// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
app.onPageInit('about', function (page) {
    // Do something here for "about" page
	
})


$$(document).on('pageInit', function (e) {
    // Get page data from event data
    var page = e.detail.page;
	/*console.log("PAGE NAME: " + page.name);*/
	if (page.name === 'index') {
		//console.log('INDEX, CHECK LOGGIN: ' + isLoggedIn());
		if($('#acct-id-input').val() == '') {
			$('#acct-id-input').val(getStorage('acct-id'));
			buildDashboard();
		}
	}
    
    if (page.name === 'course') {
		initMap();

	}
	
	
})

$$(document).on('click', '.loginBtn', function() {
	$('alert').remove();
	var email = $$('input[name="email"]').val();
	var password = $$('input[name="password"]').val();
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'post',
			'action': 'user_login',
			'format': 'json',
			'email': email,
			'password': password
		},
		dataType: 'html',
		beforeSend: function() {
			loading('show');
	  	},
		success : function(data) {
			/*console.log('Data: ' + data);*/ 
			var obj = $.parseJSON(data);
			/*console.log('Resp: ' + obj.code);*/
			if(obj.code === 1) {
				setStorage('email', obj.data.email);
				setStorage('user_id', obj.data.id);
				setStorage('app_login', 1);
				setStorage('max_accounts', obj.data.max_accounts);
				mainView.router.loadPage('index.html');
				location.reload();
			}
			else {
				
				
			}
			loading('hide');
		},
		error : function(request,error) {
			$('.login-screen-title').after('<div class="alert alert-error list-block">An unknown error occured</div>');
			console.log("Request (error): "+JSON.stringify(request));
			loading('hide');
		}
	});

})

/*
$(document).mouseup(function(e) {
    var container = $('#account-container');
    e.stopPropagation();
   
    if (!container.is(e.target) && container.has(e.target).length === 0 && !$('.switchAccountBtn').is(e.target) && $('.switchAccountBtn').has(e.target).length === 0) {
        $('#account-container').removeClass('open');
		//$('.switchAccountBtn').click();
        //$('#account-container').hide();
    }
    
    var container2 = $('.app-modal');
	if ((!$('.app-modal').is(e.target) && $('.app-modal').has(e.target).length === 0) ||  ($('.close-modal').is(e.target) || $('.modal-close').is(e.target) ) ) {
		//console.log("CLOSED CLICKED");
        modalClose();
    }
});

*/

$(document).on('click', '.signupBtn', function() {
	$('.alert').remove();
	var error_count = 0;
	var email = $('input[name="register_email"]').val();
	var password = $('input[name="register_password"]').val();
	var first_name = $('input[name="first_name"]').val();
	var last_name = $('input[name="last_name"]').val();
	var cell_phone = $('input[name="cell_phone"]').val();
	if(first_name === '') {
		$('input[name="first_name"]').parent('div').addClass('hasError');
		$('input[name="first_name"]').after('<div class="helper error">Please enter first name</div>');
		error_count++;
	}
	if(last_name === '') {
		$('input[name="last_name"]').parent('div').addClass('hasError');
		$('input[name="last_name"]').after('<div class="helper error">Please enter last name</div>');
		error_count++;
	}
	if(email === '') {
		$('input[name="register_email"]').parent('div').addClass('hasError');
		$('input[name="register_email"]').after('<div class="helper error">Please enter email address</div>');
		error_count++;
	}
	else if(!validateEmail(email)) {
		$('input[name="register_email"]').parent('div').addClass('hasError');
		$('input[name="register_email"]').after('<div class="helper error">Please enter a valid email address</div>');
		error_count++;
	}
	if(password === '') {
		$('input[name="password"]').parent('div').addClass('hasError');
		$('input[name="password"]').after('<div class="helper error">Please enter password</div>');
		error_count++;
	}
	if(error_count > 0) {
		return false;
	}
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'post',
			'action': 'register_user',
			'format': 'json',
			'email' : email, 
			'password': password, 
			'first_name': first_name, 
			'last_name': last_name, 
			'cell_phone': cell_phone,
		},
		dataType: 'html',
		beforeSend: function() {
			loading('show');
	  	},
		success : function(data) {
		console.log("DATA: " + data);
			var obj = $.parseJSON(data);
			if(obj.code === 1) { 
				$('#register-form').prepend('<div class="alert alert-success">You are now registered</div>');
			}
			else {
				$('#register-form').prepend('<div class="alert alert-error">' + obj.data + '</div>');
			}
			loading('hide');
		},
		error : function(request,error) {
			console.log("Request (error): "+JSON.stringify(request));
			loading('hide');
		}
	});
});

$(document).on('click', '.updateSettingsBtn', function() {
	$('.alert').remove();
	var id = getStorage('user_id');
	var first_name = $('#settingsFrm input[name="first_name"]').val();
	var last_name = $('#settingsFrm input[name="last_name"]').val();
	var email = $('#settingsFrm input[name="email"]').val();
	var cell_phone = $('#settingsFrm input[name="cell_phone"]').val();
	var email_optin = $('#settingsFrm input[name="email_optin"]:checked').val();
	var sms_optin = $('#settingsFrm input[name="sms_optin"]:checked').val();
	var password = $('#settingsFrm input[name="password"]').val();
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'post',
			'action': 'settings',
			'format': 'json',
			'id': id,
			'first_name': first_name,
			'last_name': last_name,
			'email' : email,
			'cell_phone': cell_phone,
			'email_optin': email_optin,
			'sms_optin': sms_optin,
			'password': password,
		},
		dataType: 'html',
		beforeSend: function() {
			loading('show');
	  	},
		success : function(data) {
		console.log("DATA: " + data);
			var obj = $.parseJSON(data);
			if(obj.code === 1) {
			///	location.reload(); 
				$('#settingsFrm').prepend('<div class="alert alert-success">Your settings have been saved</div>');
			}
			else {
				//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');
			}
			loading('hide');
		},
		error : function(request,error) {
			console.log("Request (error): "+JSON.stringify(request));
			loading('hide');
		}
	});
});

$(document).on('click', '.refreshBtn', function() {
	location.reload(); 
});

function initMap() {
	var myOptions = {
		zoom: 14,
		center: new google.maps.LatLng(0, 0),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	var map = new google.maps.Map(
		document.getElementById("map_canvas"),
		myOptions
	);
	/* Patricia Island GC */
	var lat1 = '36.599962';
	var lng1 = '-94.839193';
	var lat2 = '36.591953';
	var lng2 = '-94.830061';

	var sw = new google.maps.LatLng(lat1,lng1);
	var ne = new google.maps.LatLng(lat2,lng2);
	var bounds = new google.maps.LatLngBounds();
	bounds.extend(sw);
	bounds.extend(ne);
	map.fitBounds(bounds);

	var center = bounds.getCenter();
	var center_latitude = center.lat();
	var center_longitude = center.lng();
	//console.log(center_latitude + ' ' + center_longitude);
	map.setCenter(bounds.getCenter());

	//infoWindow = new google.maps.InfoWindow;
	//setMarkers(map, beaches);
	/* Get users Location */
	// Try HTML5 geolocation.
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var pos = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};

			var image = new google.maps.MarkerImage(
				'lib/images/marker.gif',
				null, // size
				null, // origin
				new google.maps.Point( 35, 35 ), // anchor (move to center of marker)
				new google.maps.Size( 70, 70 ) // scaled size (required for Retina display icon)
			);

			// then create the new marker

			marker = new google.maps.Marker({
				flat: true,
				icon: image,
				map: map,
				optimized: false,
				position: pos,
				title: 'I might be here',
				visible: true
			});



			//Get distance from location to course
			var distance = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(center_latitude, center_longitude), new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
			var proximitymiles = distance * 0.000621371192;
			//console.log(" " + proximitymiles + " Miles Proximity");
			var proxmity =  proximitymiles;

			//console.log("DISTANCE: " + distance);
			marker.setPosition(pos);
			if(proximitymiles < 1) {
				map.setCenter(pos);
			}
			else {
				//$('#map-info').html("You are currently " +  proximitymiles + " miles away from Patricia Island Estates");
				document.getElementById('map-info').innerHTML = "You are currently " +  Math.round(proximitymiles) + " miles away from Patricia Island Estates";
			}
		}, function() {
			handleLocationError(true, infoWindow, map.getCenter());
		});
	} else {
	  // Browser doesn't support Geolocation
	  handleLocationError(false, infoWindow, map.getCenter());
	}

}           

function setMarkers(map, locations) {
	var image = new google.maps.MarkerImage('images/beachflag.png',
		new google.maps.Size(20, 32),
		new google.maps.Point(0,0),
		new google.maps.Point(0, 32));
	var shadow = new google.maps.MarkerImage('images/beachflag_shadow.png',
		new google.maps.Size(37, 32),
		new google.maps.Point(0,0),
		new google.maps.Point(0, 32));
	var shape = {
		coord: [1, 1, 1, 20, 18, 20, 18 , 1],
		type: 'poly'
	};

	/*
	for (var i = 0; i < locations.length; i++) {
		var beach = locations[i];
		var myLatLng = new google.maps.LatLng(beach[1], beach[2]);
		var marker = new google.maps.Marker({
			position: myLatLng,
			map: map,
			shadow: shadow,
			icon: image,
			shape: shape,
			title: beach[0],
			zIndex: beach[3]
		});
		bounds.extend(myLatLng);
	}
	*/



}



function handleLocationError(browserHasGeolocation, infoWindow, pos) {
	infoWindow.setPosition(pos);
	infoWindow.setContent(browserHasGeolocation ?
					  'Error: The Geolocation service failed.' :
					  'Error: Your browser doesn\'t support geolocation.');
	infoWindow.open(map);
}

function isLoggedIn() {
	if(getStorage('app_login') !== '' && getStorage('app_login') !== null && getStorage('user_id') != null) {
		return true;
	}
	return false;	
}

function setStorage(name, value) {
	storage.setItem(name, value);
}

function getStorage(name) {
	var val = storage.getItem(name);
	return val;
}

function deleteStorage(name) {
	//alert("DELETED");
	storage.removeItem(name);
	if(name === 'app_login') {
		storage.removeItem('id');
		storage.removeItem('user_id');
		storage.removeItem('first_name');
		storage.removeItem('last_name');
		storage.removeItem('email');
	}
}

function modalOpen(id) {
	$('.app-modal').animate({
		'top' : '20px',
		'opacity' : '1'	,
	});
	$('body').append('<div class="page-overlay"></div>');
	$('body').addClass('no-scroll');
}

function modalClose() {
	$('.app-modal').animate({
		'top' : '-500px',
		'opacity' : '0'	,
	});
	$('.page-overlay').fadeOut().remove();
	$('body').removeClass('no-scroll');
}

function confirm_dialog(message, yesCallback, noCallback) {
	$('#confirm').animate({
		'top' : '20px',
		'opacity' : '1'	,
	});
	$('body').append('<div class="page-overlay"></div>');
	$('body').addClass('no-scroll');
	$('#confirm .title').html(message);
	//var confirm_dialog = $('#confirm').confirm_dialog();

	$('#btnYes').click(function() {
		confirm_dialog_close();
		yesCallback();
	});
	$('#btnNo').click(function() {
		confirm_dialog_close();
		noCallback();
	});
}

function confirm_dialog_close() {
	$('#confirm').animate({
		'top' : '-500px',
		'opacity' : '0'	,
	});
	$('.page-overlay').fadeOut().remove();
	$('body').removeClass('no-scroll');
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}