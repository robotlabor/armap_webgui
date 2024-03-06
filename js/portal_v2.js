import $ from 'jquery';
import select2 from 'select2';
import bootstrap from 'bootstrap';
import bootbox from 'bootbox';

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Polygon from 'ol/geom/Polygon.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import TileWMS from 'ol/source/TileWMS.js';
import WMTS from 'ol/source/WMTS.js';
import Draw, {createRegularPolygon, createBox} from 'ol/interaction/Draw.js';
import {Group as LayerGroup, Vector as VectorLayer} from 'ol/layer';
import {Vector as VectorSource} from 'ol/source.js';
import {addProjection, addCoordinateTransforms, transform} from 'ol/proj';

var AmILogged = false;
var Current_WMS_Layer;
var WMS_Source;
var WMS_Tile;
var Current_WMS_Group;
var layersMQ;
				

var Country_Tile = new TileLayer({
	source: new OSM()
});

var vector_source = new VectorSource({wrapX: false});

var vector = new VectorLayer({
source: vector_source
});

var layers = [Country_Tile,vector];

var view = new View({
	center: [2187148, 5969099],
	zoom: 8
	});

var map = new Map({
	layers: layers,
	target: 'map',
	view: view
});

var API_URL = "http://map.smartgazda.hu/map_api.php";
var API_KEY = "c383201894e58cde838c5f496bd169a2";

var FarmerLevels = [
						{"name":""},
						{"name":"AgroGazda", "wrap_class":"badge badge-light"},
						{"name":"InnoGazda", "wrap_class":"badge badge-secondary"},
						{"name":"PrecGazda", "wrap_class":"badge badge-dark"},
						{"name":"ProfiGazda", "wrap_class":"badge badge-warning"},
						{"name":"SmartGazda", "wrap_class":"badge badge-success"}
					];

var draw

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

function BuildLayersList() {
	
	$.ajax({
		url: API_URL,
		type: "POST",
    crossDomain: true,
    "async": true,
		data: {
			Action: "GetLayers",
			ApiKey: API_KEY
		},
		dataType: "json",
		success: function(response) {

			if(typeof response['layers'] !== 'undefined' && response['layers'].length > 0) {

				$("#LayersList").html('');

				var LayerListContent = '<div id="accordion">';

				$.each(response['layers'], function (K, Layer) {

					LayerListContent = LayerListContent+
										'<div class="card '+(K > 0 ? ((K+1) == response['layers'].length ? 'no-radius-but-bottom' : 'no-radius') : ' no-radius-but-top')+' no-border">'+
											'<div class="card-header '+(K > 0 ? ((K+1) == response['layers'].length ? 'no-radius-but-bottom' : 'no-radius') : '')+' no-border p-0" '+(Layer['group_tooltip'] ? 'data-toggle="smalltooltip" data-original-title="'+Layer['group_tooltip']+'"' : '')+' id="headingOne">'+
												'<h5 class="mb-0">'+
													'<button class="btn btn-light text-left btn-block '+(K > 0 ? ((K+1) == response['layers'].length ? 'no-radius-but-bottom' : 'no-radius') : '')+'" data-toggle="collapse" style="font-weight: bold;" data-target="#Layers_'+K+'" aria-expanded="true" aria-controls="Layers_'+K+'">'+
														'&raquo; '+Layer['group']+
													'</button>'+
												'</h5>'+
											'</div>'+

											'<div id="Layers_'+K+'" class="collapse" aria-labelledby="headingOne" data-parent="#accordion">'+
												'<div class="card-body">'+
													'<div class="list-group">';
					
					if(typeof Layer['items'] !== 'undefined' && Layer['items'].length > 0) {
						$.each(Layer['items'], function (L, Item) {
							LayerListContent = LayerListContent+
														'<a href="#" '+(Item['description'] ? 'data-toggle="smalltooltip" data-original-title="'+Item['description']+'"' : '')+' data-layer-default="'+Item['default']+'" class="list-group-item ChangeLayer '+(Current_WMS_Layer == Item['name'] ? ' active' : '')+'" data-layer="'+Item['name']+'">'+
															(Item['title'] ? Item['title'] : Item['short_name'])+
														'</a>';
						});
					}

					LayerListContent = LayerListContent+
														'</div>'+
													'</div>'+
												'</div>'+
											'</div>'
										'</div>';
				});

				$("#LayersList").data("loaded", true).attr("data-loaded", true);

				$("#LayersList").html(LayerListContent);

				$('#LayersList [data-toggle="smalltooltip"]').tooltip({
					template: '<div class="tooltip small-tooltip"><div class="arrow"></div><div class="tooltip-inner"><div></div></div>'
				});

				$("#LayersList .collapse").collapse();

				$(".ChangeLayer[data-layer-default=1]").trigger('click');

			} else {
				$("#LayersList").html('<div style="margin: 20px auto; font-size: 12px;"><span class="glyphicon glyphicon-warning-sign" style="color:red"></span> Sajnos valamilyen hiba miatt nem tudtuk betölteni a rétegeket...</div>');
			}
		},
		error: function(response) {
			$("#LayersList").html('<div style="margin: 20px auto; font-size: 12px;"><span class="glyphicon glyphicon-warning-sign" style="color:red"></span> Sajnos valamilyen hiba miatt nem tudtuk betölteni a rétegeket...</div>');
		},
	});

}

function getViewableHeight() {
	var myWidth = 0, myHeight = 0;
	if (typeof (window.innerWidth) == 'number') {
		//Non-IE
		myWidth = window.innerWidth;
		myHeight = window.innerHeight;
	} else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
		//IE 6+ in 'standards compliant mode'
		myWidth = document.documentElement.clientWidth;
		myHeight = document.documentElement.clientHeight;
	} else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
		//IE 4 compatible
		myWidth = document.body.clientWidth;
		myHeight = document.body.clientHeight;
	}
	//   window.alert('Width = ' + myWidth);
	// window.alert('Height = ' + myHeight);

	return myHeight;
}

var PreviousActiveTab;

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

$.ajax({
	url: API_URL,
	type: "POST",
	data: {
		Action: "GetInformationsText",
		ApiKey: API_KEY,
	},
	dataType: "json",
	success: function(response) {
		$("#Panel_Informations").html(response['value']);
		if(!getCookie("hide_info_panel")) {
			$("header .nav a[data-target='#NavTab_Info']").click();
		}
	},
	error: function(response) {
		
	},
});

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

if(!getCookie("cookies_accepted")) {
	$("#CookieInformant").show();
}

$(document).on('click','.AcceptCookies', function(){

	$("#CookieInformant").fadeOut(300);
	setTimeout(function () {
		$("#CookieInformant").remove();
	}, 301);

	var d = new Date();
	d.setTime(d.getTime() + (30*24*60*60*1000));
	var c_expires = "expires="+ d.toUTCString();
	document.cookie = "cookies_accepted=1;"+ c_expires+";path=/";

	return false;
});


$(document).on('click','.RegisterModal', function(){

	bootbox.dialog({
		'title': 'Regisztráció',
		'message': '<div class="QuestionFormContainer" style="position: relative;"><iframe src="http://map.smartgazda.hu/kerdoiv" style="width: 100%; height: 100%; position:absolute;" frameborder="0"></iframe></div>',
		'size': 'large'
	}).find('.QuestionFormContainer').height(getViewableHeight() / 2).css('overflow', 'auto');

	return false;
});

$(document).on('click','.ProfileEditModal', function(){

	bootbox.dialog({
		'title': 'Szintfelmérő és adatmódosítás',
		'message': '<div class="QuestionFormContainer" style="position: relative;"><iframe src="http://map.smartgazda.hu/profile" style="width: 100%; height: 100%; position:absolute;" frameborder="0"></iframe></div>',
		'size': 'large',
		onEscape: function () {
			BuildUserProfile();
			return 1;
		}
	}).find('.QuestionFormContainer').height(getViewableHeight() / 2).css('overflow', 'auto');

	return false;
});


$(document).on('click','.LoginModal', function(){

	var LoginForm = ''+
					'<form id="LoginForm">'+
						'<div class="input-group">'+
							'<input type="email" id="login_email" name="email" class="form-control" placeholder="Email cím…">'+
							'<input type="password" id="login_password" name="password" class="form-control" placeholder="Jelszó…">'+
							'<div class="input-group-append">'+
								'<button class="btn btn-secondary" type="submit">'+
									'<span class="glyphicon glyphicon-ok"></span>'+
								'</button>'+
							'</div>'+
						'</div>'+
						'<div style="padding: 10px; color: red" id="LoginError"></div>'
					'</form>';

	bootbox.dialog({
		'title': 'Bejelentkezés',
		'message': LoginForm,
		'size': 'medium'
	}).on("shown.bs.modal", function() {
		$("#login_email").focus();
	});

	return false;
});

$(document).on("click", "#FarmerMeter", function () {
	if(AmILogged)
		$("header .nav a[data-target='#NavTab_User']").click();
});

$(document).on('click','.startdraw', function(){
	var geometryFunction;

	if(AmILogged) {

		if(draw) {
			map.removeInteraction(draw);
		}

		$("header .nav a[data-target='#NavTab_Download']").click();
		$("#DrawInformant").fadeIn(300);

		geometryFunction = createRegularPolygon(4);

		draw = new Draw({
			source: vector_source,
			type: "Circle",
			geometryFunction: geometryFunction
		});

		map.addInteraction(draw);

	} else {
		$("header .nav a[data-target='#NavTab_User']").click();
	}

	return false;
});

vector_source.on('addfeature', function(evt){
	$("#DrawInformant").fadeOut(300);
	var feature = evt.feature;

	var dest1 = 'EPSG:4326';
	var src1 = 'EPSG:3857';
	var coords = feature.getGeometry().transform(src1, dest1).getExtent();

	vector_source.removeFeature(feature);
	map.removeInteraction(draw);
	draw = null; 

	bootbox.dialog({
		'title': 'Kivágott terület letöltése',
		'message': '<div class="LayersListContainer" style="position: relative;"><iframe src="http://map.smartgazda.hu/initialize-download?coords='+encodeURI(JSON.stringify(coords))+'" style="width: 100%; height: 100%; position:absolute;" frameborder="0"></iframe></div>',
		'size': 'large'
	}).find('.LayersListContainer').height(getViewableHeight() / 2).css('overflow', 'auto');

});

$(document).on("click", ".ExitFromDraw", function () {

	$("#DrawInformant").fadeOut(300);
	map.removeInteraction(draw);
	draw = null;

	return false;
});

$(document).on('click','.LogoutModal', function(){

	bootbox.setLocale('hu');
	bootbox.confirm("Biztos, hogy kijelentkezik?", function (a) {
		if(a) {

			$.ajax({
				url: API_URL,
				type: "POST",
				data: {
					Action: "Logout",
					ApiKey: API_KEY,
				},
				dataType: "json",
				success: function(response) {

					$("#NavTab_User div[data-shownon]").hide();

					AmILogged = false;
					$("#NavTab_User div[data-shownon='guest']").show();

					$("#FarmerMeter").hide();

				},
				error: function(response) {
					$("#NavTab_User div[data-shownon]:visible").html('<div style="font-size: 12px;"><span class="glyphicon glyphicon-warning-sign" style="color:red"></span> Sajnos valamilyen hiba történt...</div>');
				},
			});

		} else {
			return;
		}
	});

	return false;
});

$(document).on("submit", "#LoginForm", function () {

	$.ajax({
		url: API_URL,
		type: "POST",
		data: {
			Action: "Login",
			ApiKey: API_KEY,
			email: $("#login_email").val(),
			password: $("#login_password").val()
		},
		dataType: "json",
		success: function(response) {

			$("#NavTab_User div[data-shownon]").hide();

			if(typeof response['user'] !== 'undefined') {
				AmILogged = true;
				$("#NavTab_User div[data-shownon='user']").show();
				bootbox.hideAll();
				BuildUserProfile();
			} else if(typeof response['response'] !== 'undefined'){
				$("#LoginError").html('<div style="font-size: 12px;"><span class="glyphicon glyphicon-warning-sign" style="color:red"></span> '+response['response']+'</div>');
				$("#NavTab_User div[data-shownon='guest']").show();
			} else {
				$("#LoginError").html('<div style="font-size: 12px;"><span class="glyphicon glyphicon-warning-sign" style="color:red"></span> Sajnos valamilyen hiba miatt nem tudtuk bejelentkeztetni...</div>');
				$("#NavTab_User div[data-shownon='guest']").show();
			}

		},
		error: function(response) {
			$("#LoginError").html('<div style="font-size: 12px;"><span class="glyphicon glyphicon-warning-sign" style="color:red"></span> Sajnos valamilyen hiba miatt nem tudtuk bejelentkeztetni...</div>');
			$("#NavTab_User div[data-shownon='guest']").show();
		},
	});

	return false;

});

$(document).ready(function () {
	$('[data-toggle="tooltip"]').tooltip();

	if($("#LayersList").data("loaded") == false) {
				BuildLayersList();
	} 
	 
	$("input.TownAutocomplete").select2({
		placeholder: "Település keresése…",
		minimumInputLength: 2,
		formatSelection: function (data) {

			if (typeof data.is_in !== 'undefined') {
				return '<div style="width:100%;">'+data.text+'</div>'+(
									data.is_in ? '<div style="font-size:10px; width: 100%">'+data.is_in+'</div>' : ''
								)
								/*+(
									data.is_in_subr ? '<div style="font-size:10px; width: 100%">'+data.is_in_subr+'</div>' : ''
								)*/;
			} else {
				return data.text
			}

		},
		formatResult: function(data) {

			if ($("#s2id_autogen2_search").length > 0) {
				var KeywordCapitalized = $("#s2id_autogen2_search").val().toString().charAt(0).toUpperCase() + '' + $("#s2id_autogen2_search").val().toString().slice(1);
				var HiglightedResultName = data.text.replace(KeywordCapitalized, '<strong>' + KeywordCapitalized + '</strong>');
			} else {
				HiglightedResultName = data.text;
			}

			if (typeof data.is_in !== 'undefined') {
				return HiglightedResultName+(
												data.is_in ? '<div style="font-size:10px">'+data.is_in+'</div>' : ''
											)/*
											+(
												data.is_in_subr ? '<div style="font-size:10px">'+data.is_in_subr+'</div>' : ''
											)*/;
			} else {
				return data.text
			}
		},
		ajax: {
			url: API_URL,
			dataType: 'json',
			delay: 310,
			data: function(term, page) {
				return {
					keyword: term,
					Action: "SearchPlaces",
					ApiKey: API_KEY
				};
			},
			results: function(data, page) {
				return {
					results: data.results,
					more: false
				};
			},
			dropdownCssClass: "Towns_Autocomplete",
		}
	});

});

$(document).on("change", "input.TownAutocomplete", function (e) {

	var SelectedPlace = $(this).select2('data');

	var Coordinates = transform([SelectedPlace.wgs84_lon, SelectedPlace.wgs84_lat], 'EPSG:4326', 'EPSG:3857');

	//map.getView().setCenter([Coordinates[0], Coordinates[1]]);

	map.getView().setCenter([SelectedPlace.osm3857_x, SelectedPlace.osm3857_y]);

	map.getView().setZoom(13);

	$("#SearchBar .input-group-append").show();

	$("#LayerLoader").show();

});

$(document).on("click", ".RemoveTownFilter", function () {

	map.getView().setCenter([2187148, 5969099]);

	map.getView().setZoom(8);

	$("#SearchBar .input-group-append").hide();

	$("input.TownAutocomplete").select2("val", "");

	$("#LayerLoader").show();

	return false;
});

$(document).on("click", ".ChangeLayer", function () {

	$(".ChangeLayer.active").removeClass("active");
	$(this).addClass("active");

	$("#MapLegend").fadeOut(300);
	$("#ActiveLayerName").html($(this).text());
	$("#LayerInformant").show();

	Current_WMS_Layer = $(this).data("layer");

	Current_WMS_Group = Current_WMS_Layer.substr(0, Current_WMS_Layer.indexOf(":"));

	WMS_Source = new TileWMS({
		url: 'http://map.smartgazda.hu:8093/geoserver/'+Current_WMS_Group+'/wms',
		params: {'LAYERS': Current_WMS_Layer, 'TILED': true, 'WIDTH': 256, 'HEIGHT': 256},
		serverType: 'geoserver',
		// Countries have transparency, so do not fade tiles:
		transition: 0,
		showLegend:true
	});

	/*WMS_Source = new WMTS({
		url: 'http://map.smartgazda.hu:8093/geoserver/'+Current_WMS_Group+'/wms',
		options: {'LAYER': Current_WMS_Layer},
		serverType: 'geoserver',
		// Countries have transparency, so do not fade tiles:
		transition: 0,
		showLegend:true
	});*/

	WMS_Tile = new TileLayer({
		source: WMS_Source
	});

	WMS_Tile.getSource().on('tileloadstart', function(event) {
		TileLoadStarts++;
		UpdateTileLoader();
	});

	WMS_Tile.getSource().on('tileloadend', function(event) {
		TileLoadEnd++;
		UpdateTileLoader();
	});

	WMS_Tile.getSource().on('tileloaderror', function(event) {
		TileLoadEnd++;
		UpdateTileLoader();
	});

	layersMQ = new LayerGroup({
		layers: [
			Country_Tile, WMS_Tile
		]
	});

	map.setLayerGroup(layersMQ);

	//Current_WMS_Group=encodeURIComponent(Current_WMS_Group).
	//Current_WMS_Layer=encodeURIComponent(Current_WMS_Layer);

	$("#MapLegend img").attr("src", "http://map.smartgazda.hu:8093/geoserver/"+encodeURI(Current_WMS_Group)+"/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&STRICT=false&LAYER="+encodeURI(Current_WMS_Layer));

	setTimeout(function () {
		$("#MapLegend").fadeIn(300);
		setTimeout(function () {
			$('#LayersList [data-toggle="smalltooltip"]').tooltip('dispose'); 
			$('#LayersList [data-toggle="smalltooltip"]').tooltip({
				template: '<div class="tooltip small-tooltip"><div class="arrow"></div><div class="tooltip-inner"><div></div></div>'
			}); 
		}, 150);

	}, 300);

	return false;
});

var TileLoadStarts = 0;
var TileLoadEnd = 0;
var TileLoaderNeeded = false;
var LayerLoaderHider;

function UpdateTileLoader() {
	if(TileLoaderNeeded) {

		var Percentage = Math.ceil(TileLoadEnd/TileLoadStarts)*100;

		$("#LayerLoader").css("width", Percentage+"%").data("tiles", TileLoadStarts).data("loaded", TileLoadEnd)
		.attr("data-tiles", TileLoadStarts).attr("data-loaded", TileLoadEnd);

		if(LayerLoaderHider) {
			clearInterval(LayerLoaderHider);
		}

		if(TileLoadEnd>=TileLoadStarts) {
			LayerLoaderHider = setTimeout(function () {
				$("#LayerLoader").css("visibility", "hidden");
			}, 2000);
		} else {
			$("#LayerLoader").css("visibility", "visible");
		}

	}
}

map.on('moveend', function(e) {
	$("#LayerLoader").css("visibility", "hidden");
	$("#LayerLoader").css("width", "0px");
	TileLoadStarts = 0;
	TileLoadEnd = 0;
	TileLoaderNeeded = true;
});

//var FeatureInfoControl = new Map.Control.GetFeatureInfo();

map.on('singleclick', function(evt) {

	if(Current_WMS_Layer) {

		var BBOX_1 = parseInt(evt.coordinate[0].toString().split(".")[0]);
		var BBOX_2 = parseInt(evt.coordinate[1].toString().split(".")[0]);
		var BBOX_3 = (BBOX_1+1);
		var BBOX_4 = (BBOX_2+1);
    var arrTGT = {1111: 'Nincs befolyással a talajtermékenységre',1117: 'Magas karbonáttartalom',1151: 'Savanyú kémhatás',1161: 'Lúgos kémhatás',1167: 'Lúgos kémhatás + Magas karbonáttartalom',1411: 'Alacsony humusztartalom',1451: 'Alacsony humusztartalom + Savanyú kémhatás',1461: 'Alacsony humusztartalom + Lúgos kémhatás',2111: 'Nagy homoktartalom',2151: 'Nagy homoktartalom + Savanyú kémhatás',2161: 'Nagy homoktartalom + Lúgos kémhatás',2411: 'Nagy homoktartalom + Alacsony humusztartalom',2451: 'Nagy homoktartalom + Alacsony humusztartalom + Savanyú kémhatás',2461: 'Nagy homoktartalom + Alacsony humusztartalom + Lúgos kémhatás',3111: 'Nagy agyagtartalom',3151: 'Nagy agyagtartalom + Savanyú kémhatás',3411: 'Nagy agyagtartalom + Alacsony humusztartalom'};

		$.ajax({
			url: API_URL,
			type: "POST",
			data: {
				Action: "GetFeatureInfo",
				ApiKey: API_KEY,
				url: 'http://5.189.188.225:8093/geoserver/'+encodeURI(Current_WMS_Group)+'/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&QUERY_LAYERS='+encodeURI(Current_WMS_Layer)+'&LAYERS='+encodeURI(Current_WMS_Layer)+'&INFO_FORMAT=application/json&FEATURE_COUNT=1&X=1&Y=1&STYLES=&WIDTH=2&HEIGHT=2&SRS=EPSG:3857&crossOrigin=anonymous&BBOX='+BBOX_1+','+BBOX_2+','+BBOX_3+','+BBOX_4
//				url: 'http://map.smartgazda.hu:8093/geoserver/'+Current_WMS_Group+'/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&QUERY_LAYERS='+Current_WMS_Layer+'&LAYERS='+Current_WMS_Layer+'&INFO_FORMAT=application/json&FEATURE_COUNT=1&X=1&Y=1&STYLES=&WIDTH=2&HEIGHT=2&SRS=EPSG:3857&crossOrigin=anonymous&BBOX='+BBOX_1+','+BBOX_2+','+BBOX_3+','+BBOX_4

			},
			dataType: "json",
			success: function(response) {
      
        //$("#GetFeatureInfoData").html("Érték: "+response);
    		if ( arrTGT[response] == null ){
          $("#GetFeatureInfoData").html("Érték: "+response);     
        }
        else {
          $("#GetFeatureInfoData").html("Érték: "+arrTGT[response]);
        }
        $("#GetFeatureInfo").show();

			},
			error: function(response) {
 
			},
		});

		//var FeatureInfoSourceUrl = 'http://map.smartgazda.hu:8093/geoserver/AIIR/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&QUERY_LAYERS=AIIR:MO_AIIR_agyagtartalom_250m_WGS84&LAYERS=AIIR:MO_AIIR_agyagtartalom_250m_WGS84&INFO_FORMAT=application/json&FEATURE_COUNT=1&X=1&Y=1&STYLES=&WIDTH=2&HEIGHT=2&SRS=EPSG:3857&crossOrigin=anonymous&BBOX='+BBOX_1+','+BBOX_2+','+BBOX_3+','+BBOX_4;

		/*$.getJSON(FeatureInfoSourceUrl, function( data ) {
			console.log(data);
		});*/

		/*var BBOX = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');

		console.log(BBOX);*/

		/*var FeatureInfoSourceUrl = 'http://map.smartgazda.hu:8093/geoserver/'+Current_WMS_Group+'/wms?REQUEST=GetFeatureInfo&SERVICE=WMS&VERSION=1.1.0&LAYERS='+Current_WMS_Layer+'&STYLES=&FORMAT=image/png&BGCOLOR=0xFFFFFF&TRANSPARENT=TRUE&SRS=EPSG:4326&BBOX='+map.getView().calculateExtent(map.getSize()).join(",")+'&x=683&y=445&WIDTH=1020&HEIGHT=881&QUERY_LAYERS='+Current_WMS_Layer;

*/

	}


	//FeatureInfoControl.getInfoForClick(evt);

	/*document.getElementById('info').innerHTML = '';
	var viewResolution = (view.getResolution());

	console.log(WMS_Source.GetFeatureInfo());
	console.log(WMS_Tile.GetFeatureInfo());

	var url = WMS_Source.getFeatureInfoUrl(
		evt.coordinate, viewResolution, 'EPSG:3857',
		{'INFO_FORMAT': 'text/html'});
	if (url) {
		fetch(url)
			.then(function (response) { return response.text(); })
			.then(function (html) {
				document.getElementById('info').innerHTML = html;
			});
	}*/
});

Country_Tile.getSource().on('tileloadstart', function(event) {
	TileLoadStarts++;
	UpdateTileLoader();
});

Country_Tile.getSource().on('tileloadend', function(event) {
	TileLoadEnd++;
	UpdateTileLoader();
});

Country_Tile.getSource().on('tileloaderror', function(event) {
	TileLoadEnd++;
	UpdateTileLoader();
});