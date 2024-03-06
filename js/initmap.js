var mapLayers = Array();  // térképi rétegek csoportba foglalására használt tömbb (alaptérkép, pályatérkép)
var baseItems = Array();  // alaptérképek tárolására tömb
var mapItems = Array();   // pályatérképek tárolására használt tömb
var mapIcons = {};
var mapObjects = {}; // a térképen követett járművek tárolására használ tömb

var activeLayer = null;
var activeBaseLayer = null;


//var API_URL = "http://192.168.0.145/map_api.php";
//var API_URL = "http://192.168.1.169/map_api.php";
var API_URL = "http://"+IPADDR+"/map_api.php";
var API_KEY = "c383201894e58cde838c5f496bd169a2";
var PreviousActiveTab;

//
// Ikonok definíciója
//

var carIcon = L.icon({
  //iconUrl: 'img/car_icon.gif',
  iconUrl: 'img/leaf_front_icon.gif',
  //shadowUrl: 'leaf-shadow.png',

  iconSize:     [30, 30], // size of the icon
  //shadowSize:   [50, 64], // size of the shadow
  iconAnchor:   [15, 15], // point of the icon which will correspond to marker's location
  //shadowAnchor: [4, 62],  // the same for the shadow
  popupAnchor:  [-15, -15] // point from which the popup should open relative to the iconAnchor
});
mapIcons['leaf'] = ({
  type: 'leaf',
  class: 'device',
  icon: carIcon});

var neobotixIcon = L.icon({
  //iconUrl: 'img/car_icon.gif',
  iconUrl: 'img/neobotix_k.png',
  //shadowUrl: 'leaf-shadow.png',

  iconSize:     [30, 30], // size of the icon
  //shadowSize:   [50, 64], // size of the shadow
  iconAnchor:   [15, 15], // point of the icon which will correspond to marker's location
  //shadowAnchor: [4, 62],  // the same for the shadow
  popupAnchor:  [-15, -15] // point from which the popup should open relative to the iconAnchor
});

mapIcons['robotkocsi'] = ({
  type: 'robotkocsi',
  class: 'device',
  icon: neobotixIcon});

var husarionIcon = L.icon({
  //iconUrl: 'img/car_icon.gif',
  iconUrl: 'img/husarion_k.png',
  //shadowUrl: 'leaf-shadow.png',

  iconSize:     [30, 30], // size of the icon
  //shadowSize:   [50, 64], // size of the shadow
  iconAnchor:   [15, 15], // point of the icon which will correspond to marker's location
  //shadowAnchor: [4, 62],  // the same for the shadow
  popupAnchor:  [-15, -15] // point from which the popup should open relative to the iconAnchor
});

mapIcons['husarion1'] = ({
  type: 'husarion',
  class: 'device',
  icon: husarionIcon});  

mapIcons['husarion2'] = ({
  type: 'husarion',
  class: 'device',
  icon: husarionIcon});  
  
    
var buoyIcon = L.icon({
  iconUrl: 'img/buoy_icon.png',
  //shadowUrl: 'leaf-shadow.png',

  iconSize:     [25, 28], // size of the icon
  //shadowSize:   [50, 64], // size of the shadow
  iconAnchor:   [12, 14], // point of the icon which will correspond to marker's location
  //shadowAnchor: [4, 62],  // the same for the shadow
  popupAnchor:  [-18, -21] // point from which the popup should open relative to the iconAnchor
});
mapIcons['buoy'] = ({
  type: 'buoy',
  class: 'sign',
  icon: buoyIcon});
  
//
// Járművek definíciója
//
  mapObjects['robotkocsi'] = ({
    id: 'robotkocsi',
    title: 'robotkocsi',
    //topic: '/PX4_pose',
    //destinationtopic: '/PX4_destination',
    topic: '/PX4_pose',
    destinationtopic: '/PX4_destination',
    UTMx: 0, //640142.1676316919,
    UTMy: 0, //5193611.724585749,
    WGS84lat: 0, //46.88126370508482,
    WGS84lon: 0, //16.839305162429813,
    visible: true,
    onmap: false,
    icon: neobotixIcon,
    marker: null});
  
  mapObjects['husarion1'] = ({
    id: 'husarion1',
    title: 'husarion1',
    topic: '/rosbot1/PX4_pose',
    destinationtopic: '/rosbot1/PX4_destination',
    UTMx: 0,
    UTMy: 0,
    WGS84lat: 0,
    WGS84lon: 0,
    visible: true,
    onmap: false,
    icon: husarionIcon,
    marker: null});

    mapObjects['husarion2'] = ({
      id: 'husarion2',
      title: 'husarion2',
      topic: '/rosbot2/PX4_pose',
      destinationtopic: '/rosbot2/PX4_destination',
      UTMx: 0,
      UTMy: 0,
      WGS84lat: 0,
      WGS84lon: 0,
      visible: true,
      onmap: false,
      icon: husarionIcon,
      marker: null});
      
//
// Térképek definíciója
//

function initMapLayers(map) {
  var satMutant = L.gridLayer.googleMutant({
          //maxZoom: 20,
          type: "satellite",
        });
  baseItems.push({default: 0, 
                  isBaseLayer: 1,
                  description: 'Google Aerial', 
                  href: '',
                  name: 'Google Aerial',
                  short_name: 'Google Aerial',
                  title: '',
                  layerDefinition: satMutant,
                  type:'gridLayer'
                  });

  var hybridMutant = L.gridLayer.googleMutant({
          //maxZoom: 20,
          type: "hybrid",
        });
  baseItems.push({default: 0,
                  isBaseLayer: 1, 
                  description: 'Google Hybrid', 
                  href: '',
                  name: 'Google Hybrid',
                  short_name: 'Google Hybrid',
                  title: '',
                  layerDefinition: hybridMutant,
                  type:'gridLayer'
                  });

  var osmtile = L.tileLayer('http://tile.osm.org/{z}/{x}/{y}.png', {
            maxNativeZoom: 19, // OSM max available zoom is at 19.
            maxZoom: 22 // Match the map maxZoom, or leave map.options.maxZoom undefined.
        });
  baseItems.push({default: 1, 
                  isBaseLayer: 1,
                  description: 'Open Street Map', 
                  href: '',
                  name: 'Open Street Map',
                  short_name: 'Open Street Map',
                  title: '',
                  layerDefinition: osmtile,
                  type:'gridLayer'
                  });

  osmtile.addTo(map);
  //activeBaseLayer = osmtile;

  mapLayers.push({group:'Alaptérképek', group_tooltip: 'Alaptérképek', groupType:'baselayer', items:baseItems});

  //var wmsLayer= L.tileLayer.wms("http://192.168.0.227:8080/geoserver/gwc/service/wms", {
    //var wmsLayer= L.tileLayer.wms("http://192.168.1.145:8080/geoserver/gwc/service/wms", {
      var wmsLayer= L.tileLayer.wms("http://"+GEOIPADDR+":8080/geoserver/gwc/service/wms", {
        layers: 'zalazone:zalazone_ortofoto_20220825',
          format: 'image/png',
          maxZoom: 24, // Match the map maxZoom, or leave map.options.maxZoom undefined.
          transparent: true
      });
  mapItems.push({default: 1, 
                  isBaseLayer: 0,
                  description: 'ZalaZone orthophoto', 
                  href: '',
                  name: 'ZalaZone orthophoto',
                  short_name: 'ZalaZone orthophoto',
                  title: '',
                  layerDefinition: wmsLayer,
                  type:'wmsLayer'
                  });
  wmsLayer.addTo(map);
  activeLayer = wmsLayer;


  //var gyorLayer= L.tileLayer.wms("http://192.168.0.227:8080/geoserver/gyor/wms", {
  //  var gyorLayer= L.tileLayer.wms("http://192.168.1.145:8080/geoserver/gyor/wms", {
    var gyorLayer= L.tileLayer.wms("http://"+GEOIPADDR+":8080/geoserver/gwc/service/wms", {
      layers: 'gyor:gyor_campus_20008',
        format: 'image/png',
		tiled: true,
        maxZoom: 24, // Match the map maxZoom, or leave map.options.maxZoom undefined.
        transparent: true
    }); 
    mapItems.push({default: 0, 
                  isBaseLayer: 0,
                  description: 'gyor_campus_20008', 
                  href: '',
                  name: 'gyor_campus_20008',
                  short_name: 'gyor_campus_20008',
                  title: '',
                  layerDefinition: gyorLayer,
                  type:'wmsLayer'
                  });
  mapLayers.push({layerDefinition:gyorLayer, group:'Pálya térképek', group_tooltip: 'Pálya térképek', groupType:'maplayer', items:mapItems});

}

function BuildLayersList() {
        $("#LayersList").html('');

				var LayerListContent = '<div id="accordion">';

				$.each(mapLayers, function (K, Layer) {

					LayerListContent = LayerListContent+
										'<div class="card '+(K > 0 ? ((K+1) == mapLayers.length ? 'no-radius-but-bottom' : 'no-radius') : ' no-radius-but-top')+' no-border">'+
											'<div class="card-header '+(K > 0 ? ((K+1) == mapLayers.length ? 'no-radius-but-bottom' : 'no-radius') : '')+' no-border p-0" '+(Layer['group_tooltip'] ? 'data-toggle="smalltooltip" data-original-title="'+Layer['group_tooltip']+'"' : '')+' id="headingOne">'+
												'<h5 class="mb-0">'+
													'<button class="btn btn-light text-left btn-block '+(K > 0 ? ((K+1) == mapLayers.length ? 'no-radius-but-bottom' : 'no-radius') : '')+'" data-toggle="collapse" style="font-weight: bold;" data-target="#Layers_'+K+'" aria-expanded="true" aria-controls="Layers_'+K+'">'+
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
														'<a href="#" '+(Item['description'] ? 'data-toggle="smalltooltip" data-original-title="'+Item['description']+'"' : '')+' data-layer-default="'+Item['default']+'" class="list-group-item ChangeLayer '+('' == Item['name'] ? ' active' : '')+'" data-layer="'+Item['name']+'">'+
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

}

function BuildDeviceList() {
  $("#DeviceList").html('');

  var DeviceListContent = '<div id="devicetable" class="devicetable" >';

  $.each(mapObjects, function (K, target) {
    // megvizsgáljuk, hogy érkezett-e az azonosítóhoz pozíció, ha igen, berakjuk a listába és kitesszük a térképre, ha nem akkor kivesszük a listából és levesszük a térképről
    DeviceListContent = DeviceListContent+ '<div class="devicerow">';
    
    DeviceListContent = DeviceListContent+ '<div class="devicecell"><img src="'+mapIcons[target.id].icon.options.iconUrl+'" width="25px">' + '</div>';

    DeviceListContent = DeviceListContent+ '<div class="devicecell">' + target.title + '</div>';
  
    DeviceListContent = DeviceListContent+ '<div class="devicecell">' +"<a onclick=\"sendDestinationPositions('"+target.id+"');\"> Küldés </a>" + '</div>';

    DeviceListContent = DeviceListContent+ '<div class="devicecell">' +"<a onclick=\"setMapCenter('"+target.id+"');\"> Középre </a>" + '</div>';

    DeviceListContent = DeviceListContent+ '</div>';

    //DeviceListContent = DeviceListContent+ '</div>';
    
    var lat = target.WGS84lat;
    var lng = target.WGS84lon;
    var latlng = L.latLng( lat, lng);
    var e = {latlng: latlng};    
        //console.log("You clicked the map at latitude: " + lat + " and longitude: " + lng);
        //console.log("In UTM"+ latlng.utm().zone+latlng.utm().band + " x:" + latlng.utm().x + " and y: " + latlng.utm().y);
        //alert("You clicked the map at \n latitude: " + lat + " and longitude: " + lng+ "\nIn UTM"+ latlng.utm().zone+latlng.utm().band + " x:" + latlng.utm().x + " and y: " + latlng.utm().y);          
    if (target.onmap == false && lat > 0) {          
		  addDeviceMarker(e, mapIcons[target.id].icon);
      target.onmap=true;
    }

  });
  DeviceListContent = DeviceListContent+ '</div>';


  $("#DeviceList").html(DeviceListContent);
}

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

$(document).on('click','.erasebuoys', function(){
  var i=0;
  var iconlen = Object.keys(markers).length;
  while(i < iconlen) {
    removeMarker(i);
    i = i+1;
  }


  return false;
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
		
    if($(this).data("target").substring(1) == "NavTab_Addvechicle") {

			if($("#DeviceList").data("loaded") == false) {

				BuildDeviceList();
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


$(document).on("click", ".ChangeLayer", function () {

	//$("#LayerInformant").show();

	//var Current_WMS_Layer = $(this).data("layer");
  items = Array();
  items = baseItems.concat(mapItems);

  var selectedMapItemId = null;
  var selectedIsBaseMapItem = 0; 
  
  var found = false;
  for (var i = 0; i < items.length && !found; i++) {
    
    if (items[i].name === $(this)[0].innerText) {
      found = true;
      selectedMapItemId = i;
      break;
    }
  }
  

  // move the active style if it is in the same group
  // have to find base if not
  for (let index = 0; index < $(".ChangeLayer.active").length; ++index) {
    for (var j = 0; j < items.length; j++) {
    
      if (items[j].name ===  $(".ChangeLayer.active")[index].text  && !(selectedMapItemId === null)) {
        if(items[j].isBaseLayer == items[selectedMapItemId].isBaseLayer) {
          $($(".ChangeLayer.active")[index]).removeClass("active")
        }
        break;
      }
    }
    
  }; 

  $(this).addClass("active");

  //if it is baseLayer

  if (selectedMapItemId >= 0 && !(selectedMapItemId === null) ) {
    if(items[selectedMapItemId].isBaseLayer) {
      if(activeBaseLayer)
      map.removeLayer(activeBaseLayer);
  
      map.addLayer(items[selectedMapItemId].layerDefinition);
      activeBaseLayer = items[selectedMapItemId].layerDefinition;
      activeLayer.bringToFront();
    }
    else {

      if(activeLayer)
        map.removeLayer(activeLayer);
    
        map.addLayer(items[selectedMapItemId].layerDefinition);
        activeLayer = items[selectedMapItemId].layerDefinition;
        activeLayer.bringToFront();
    }
  }
  
  // hide tooltip
  
 return false;
});



function check1(oldvalue) {
          undefined === oldvalue && (oldvalue = positionsArr);
          clearcheck = setInterval(repeatcheck,1000,oldvalue);
          function repeatcheck(oldvalue) {
              if (positionsArr !== oldvalue) {
                  // do something
                  clearInterval(clearcheck);
                  console.log("check1 value changed from " +
                      oldvalue + " to " + positionsArr);
                      
                  printPosition();    
              }
          }
}

function sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
          if ((new Date().getTime() - start) > milliseconds){
            break;
          }
        }
      }
      
function printPosition(){
  
    positionsArr.forEach(function (item, index) {                
        
        var pos = L.utm({x: item["x_real"].replace(',','.'), y: item["y_real"].replace(',','.'), zone: 33, band: 'T'});
        var coord = pos.latLng();
        //carMarker.setLatLng(coord);
  
        var len = markers.length - 1;
        //markers[len] = carMarker;

        if (markers[len]){  
          map.removeLayer(markers[len]);
        }
          
        var carMarker = new L.marker(coord, {icon: carIcon}).addTo(map);
        markers[len] = carMarker;

        this.map.panBy([0,0]);
         //setTimeout(carMarker.setLatLng(coord), 1000);
        
        
        
        //carMarker.setLatLng(coord);
        console.log(coord);    
        
        
      });  

}

function setMapCenter(id){
  
  //alert(id);
  if (mapObjects[id].WGS84lat > 0 && mapObjects[id].onmap)
    map.panTo(new L.LatLng(mapObjects[id].WGS84lat, mapObjects[id].WGS84lon));

 
}

function send_req(){
  getJSON('http://'+GEOIPADDR+'/route.php');
  
  if(rowid <1000) {
    resource_timer = setTimeout(send_req, 500);
  }
}

function getDataOnMapChange() { 
    //GetOCMData(false);
                 
}

function addDeviceMarker(e, mapicon, devicemarkerid){
  // Add marker to map at click location; add popup window
  //var id = Object.keys(devicemarkers).length;
  var newMarker = new L.marker(e.latlng,{icon: mapicon});
  newMarker.ID = devicemarkerid;
  //devicemarkers[newMarker.ID] = newMarker;
  
  var coord = e.latlng;
  var lat = coord.lat;
  var lng = coord.lng;
  var latlng = L.latLng( lat, lng);
         
  newMarker.addTo(map);
  return newMarker;
}

function addMarker(e, mapicon){
  // Add marker to map at click location; add popup window
  var id = Object.keys(markers).length;
  var newMarker = new L.marker(e.latlng,{icon: mapicon});
  newMarker.ID = id;
  markers[newMarker.ID] = newMarker;

  var coord = e.latlng;
  var lat = coord.lat;
  var lng = coord.lng;
  var latlng = L.latLng( lat, lng);
        
  var pointposition = "WGS84 latitude: " + lat + "<br>WGS84 longitude: " + lng;
  pointposition = pointposition + "<br>In UTM"+ latlng.utm().zone+latlng.utm().band + " x:" + latlng.utm().x + " and y: " + latlng.utm().y;

  var popup = newMarker.bindPopup('<b>Célpont</b><br /><label for="type'+newMarker.ID+'">Pont sorszáma: </label> '+(newMarker.ID+1)+'<br>'+pointposition+'<br><a onclick="removeMarker('+newMarker.ID+');">Pont törlése</a>');
  
  newMarker.bindTooltip('<b>'+(newMarker.ID+1)+'</b>', {
    permanent: true, 
    direction : 'bottom',
    className: 'transparent-tooltip',
    //offset: [0,-15]
    offset: [18,-4]
  }).addTo(map);
}

function removeMarker(e){
  // Add marker to map at click location; add popup window
  map.removeLayer(markers[e]);
  //remove item from array
  delete markers[e];        
}

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

      
