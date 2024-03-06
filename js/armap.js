var PreviousActiveTab;

var API_KEY = "c383201894e58cde838c5f496bd169a2";
var API_URL = "http://armap.jkk.sze.hu/map_api.php";
API_URL = "map_api.php";


$(document).on("click", ".Hide_Informations_Panel", function () {
	$("header .nav a[data-target='#NavTab_Info']").click();

	var d = new Date();
	d.setTime(d.getTime() + (30*24*60*60*1000));
	var c_expires = "expires="+ d.toUTCString();
	document.cookie = "hide_info_panel=1;"+ c_expires+";path=/";
	
	return false;
});


$(document).on('click','header .nav-link', function(){

	if(PreviousActiveTab == $(this).data("target").substring(1)) {

		$(this).removeClass("active");
		$('header .tab-pane[id="'+PreviousActiveTab+'"]').removeClass("active");
		setTimeout(function () { PreviousActiveTab = ''; }, 150);

	} else {

		if($(this).data("target").substring(1) == "NavTab_Layers") {

			if($("#LayersList").data("loaded") == false) {

				BuildLayersList();
			}

		}

		if($(this).data("target").substring(1) == "NavTab_User") {

			if($("#NavTab_User div[data-shownon='guest']:visible").length > 0 || $("#NavTab_User div[data-shownon='user']:visible").length > 0) {
				// már csekkoltuk a sessiont

				if($("#NavTab_User div[data-shownon='user']:visible").length > 0) {

					BuildUserProfile();

				}

			} else {

				$.ajax({
					url: API_URL,
					type: "POST",
					data: {
						Action: "AmILogged",
						ApiKey: API_KEY,
					},
					dataType: "json",
					success: function(response) {

						$("#NavTab_User div[data-shownon]").hide();

						if(typeof response['response'] !== 'undefined' && response['response']) {
							AmILogged = true;
							$("#NavTab_User div[data-shownon='user']").show();
							BuildUserProfile();
						} else {
							AmILogged = false;
							$("#NavTab_User div[data-shownon='guest']").show();
						}

					},
					error: function(response) {
						$("#NavTab_User div[data-shownon]:visible").html('<div style="font-size: 12px;"><span class="glyphicon glyphicon-warning-sign" style="color:red"></span> Sajnos valamilyen hiba történt...</div>');
					},
				});

			}

		}
	}

	PreviousActiveTab = $(this).data("target").substring(1);

	setTimeout(function () { $('[data-toggle="tooltip"]').tooltip('dispose'); $('[data-toggle="tooltip"]').tooltip(); }, 150);

});


function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

$(window).on('load', function() {
	$("#Page_Preloader").fadeOut(200);
});

$(window).on("unload", function(e) {
	$("#Page_Preloader").fadeIn(200);
});

function BuildUserProfile() {
	$.ajax({
		url: API_URL,
		type: "POST",
		data: {
			Action: "MyProfile",
			ApiKey: API_KEY,
		},
		dataType: "json",
		success: function(response) {

			if(typeof response['profile'] !== 'undefined' && response['profile'] && response['profile']['id']) {
				
				$(".FarmerLevelLabel").html((FarmerLevels[response['profile']['qualification']]['wrap_class'] ? '<span class="'+FarmerLevels[response['profile']['qualification']]['wrap_class']+'" style="font-size:90%">' : '')+FarmerLevels[response['profile']['qualification']]['name']+(FarmerLevels[response['profile']['qualification']]['wrap_class'] ? '</span>' : ''));

				$(".ProfileData[data-column]").each(function () {
					if(response['profile'][$(this).data("column")])
						$(this).text(response['profile'][$(this).data("column")]);
				});

				var FarmerMeterPercent = Math.ceil(response['profile']['scores']/400*100);

				$("#FarmerMeter").fadeIn(300).css("cursor", "pointer");

				var FarmerMeterTooltip = response['profile']['scores']+" ponttal "+FarmerLevels[response['profile']['qualification']]['name'];

				$("#FarmerMeter").data("original-title", FarmerMeterTooltip).attr("data-original-title", FarmerMeterTooltip);

				$("#FarmerMeter").tooltip();

				$("#FarmerMeter > div").css("left", FarmerMeterPercent+"%");

				$("#QuestionFormGroups").html('');

				$.ajax({
					url: API_URL,
					type: "POST",
					data: {
						Action: "QuestionFormGroups",
						ApiKey: API_KEY,
					},
					dataType: "json",
					success: function(response) {

						if(typeof response['response'] !== 'undefined' && response['response']) {
							$.each(response['response'], function (Key, Item) {
								$("#QuestionFormGroups").append('<li>'+Item['group']+': '+Item['score']+' pont</li>');
							});
						} else {

						}

					},
					error: function(response) {

					},
				});

			} else {

				$("#NavTab_User div[data-shownon]:visible").html('<div style="font-size: 12px;"><span class="glyphicon glyphicon-warning-sign" style="color:red"></span> Sajnos valamilyen hiba történt...</div>');

			}

		},
		error: function(response) {
			$("#NavTab_User div[data-shownon]:visible").html('<div style="font-size: 12px;"><span class="glyphicon glyphicon-warning-sign" style="color:red"></span> Sajnos valamilyen hiba történt...</div>');
		},
	});
}

