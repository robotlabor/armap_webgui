
//const socket = new WebSocket('ws://192.168.0.145:8001');
//const socket = new WebSocket('ws://192.168.1.169:8001');
const socket = new WebSocket('ws://'+IPADDR+':8001');
var wsconnectionactive = false;

socket.addEventListener('open', function (event) {

    socket.send('Connection Established');
    wsconnectionactive = true;

});
 

socket.addEventListener('message', function (event) {
// ha üzenet érkezik, feldolgozzuk a koordinátákat
    //console.log(event.data);
    // ha van bejövő adat, akkor megkeressük a topicnak megfelelő térképi objektumot és a térképre teszzük
    
    try {
        const obj = JSON.parse(event.data);
        
        // megkeressük a topic-nak megfelelő objektumot az eszközök között
        $.each(mapObjects, function (K, target) {    
            if (obj.topic == target.topic) {
                // ha megtaláljuk az utm koordinátákat át kell tenni wgs84-be
                //var pos = L.utm({x: item["x_real"].replace(',','.'), y: item["y_real"].replace(',','.'), zone: 33, band: 'T'});
                target.UTMx = parseFloat(obj.UTMx);
                target.UTMy = parseFloat(obj.UTMy);
                var pos = L.utm({x: obj.UTMx, y: obj.UTMy, zone: 33, band: 'T'});
                var coord = pos.latLng();
                target.WGS84lat = coord.lat;
                target.WGS84lon = coord.lng;
                //var latlng = L.latLng( lat, lng);
                var e = {latlng: coord};    
                    //console.log("You clicked the map at latitude: " + lat + " and longitude: " + lng);
                    //console.log("In UTM"+ latlng.utm().zone+latlng.utm().band + " x:" + latlng.utm().x + " and y: " + latlng.utm().y);
                    //alert("You clicked the map at \n latitude: " + lat + " and longitude: " + lng+ "\nIn UTM"+ latlng.utm().zone+latlng.utm().band + " x:" + latlng.utm().x + " and y: " + latlng.utm().y);          
                if (target.onmap == false) {
                    //var id = Object.keys(devicemarkers).length;
                    
                    target.marker = addDeviceMarker(e, target.icon);  //mapIcons['robotkocsi'].icon);
                    target.onmap=true;
                } else {
                    // ha már tékrépen van frissítjük a marker pozícióját
                    if (coord.lat > 0)
                        target.marker.setLatLng(coord); 

                }   
            }
        
          });
          
          map.invalidateSize();
        

    }
    catch(err) {
        //document.getElementById("demo").innerHTML = err.message;
    }

});

const contactServer = () => {

    socket.send("Initialize");

}



function getDevicePositions() {
    if (wsconnectionactive)
        socket.send(JSON.stringify({cmd: 'get_positions'}));
}


function sendDestinationPositions(deviceid) {
    // a lerakott bójákon
    // meg kell keresni a topic id-t
    var selected = {};
    var topicName = '';
    var destinations = {};
    
    for (let [key, value] of Object.entries(mapObjects)) {
        //console.log(key, value);
        if (key == deviceid) {
            topicName = value.destinationtopic;
            var i = 0;
            $.each(markers, function (K, target) {  
                var pos = target.getLatLng();
                var UTMx = pos.utm().x;
                var UTMy = pos.utm().y;
                destinations[i] = {utmx: UTMx, utmy: UTMy};
                i = i + 1;
                //alert(deviceid+UTMx.toString()+ UTMy.toString()); 
            });   
        
        }

        //break;    
    }

    //if ( Object.keys(destinations).length > 0 ) { 
        var msg = JSON.stringify(({cmd: 'set_positions', topic: topicName, positions: destinations}))
        //console.log(msg);
        socket.send(msg);
    //}
}
  
var sendtimer = 600;
setInterval(getDevicePositions,sendtimer)
