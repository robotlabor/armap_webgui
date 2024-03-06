var rowid = 0;

function getJSON(dataURL)
{
    rowid++;

    var xmlhttp = new XMLHttpRequest();
    var params = "id="+rowid;
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
                        var jsonStr = this.responseText;
            jsonStr = jsonStr;
            //jsonStr = jsonStr.replace(/"/g, '@@@');
            //jsonStr = jsonStr.replace(/'/g, '"');
            //jsonStr = jsonStr.replace(/##/g, '\'');
            //var myArr = JSON.parse(this.responseText);
            var myArr = JSON.parse(jsonStr);
            
            //positionsArr = myArr;
              
            
            var pos = L.utm({x: myArr["x_real"].replace(',','.'), y: myArr["y_real"].replace(',','.'), zone: 33, band: 'T'});
              var coord = pos.latLng();
              
              carMarker.setLatLng(coord);
              
              console.log(coord);    
              

            /*
            myArr.forEach(function (item, index) {
                        
              var pos = L.utm({x: item["x_real"].replace(',','.'), y: item["y_real"].replace(',','.'), zone: 33, band: 'T'});
              var coord = pos.latLng();
              
              carMarker.setLatLng(coord);
              
              console.log(coord);    
              
              
            });
            */
                                               
            
        }
    };
    xmlhttp.open("GET", dataURL+"?"+params, true);
    //xmlhttp.open("GET", dataURL, true);
    xmlhttp.send();
}


function AddMarkerToMap_(lat, lng, field) {

  var newMarker = CreateMarker(lat, lng, field);

  newMarker.addTo(map);

  var lastValidPosition;
  newMarker.on("drag", function(event) {
    var latLng = newMarker.getLatLng();
    if (bounds.contains(latLng)) {
      lastValidPosition = latLng;
    } else {
      if (lastValidPosition) {
        newMarker.setLatLng(lastValidPosition);
      }
    }
  }, newMarker);
  var popupContent = CreatePopupContent(field);
  newMarker.bindPopup(popupContent);

  newMarker.on("popupopen", onPopupOpen);

  return newMarker;

}

function LoadFields() {

    var selectedFloor = $("#cmbFloors").val();
    if (selectedFloor && selectedFloor !== "0") {
      var serviceURL = "http://localhost/VisualSalesModuleWeb/FakeOrganizationData.svc";
      var ODataURL = serviceURL + "/ProductSet?$format=json&$filter=new_projectfloorid eq guid'" + selectedFloor + "'";

      $.ajax({
        type: "GET",
        url: ODataURL,
        dataType: 'json',
        async: false,
        contentType: "application/json; charset=utf-8",
        beforeSend: function(XMLHttpRequest) {
          //ShowDialog();
          XMLHttpRequest.setRequestHeader("Accept", "application/json");
        },
        success: function(data, textStatus, XmlHttpRequest) {
          var fields = data.value;

          for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            var lat = JSON.parse(field.Lattitude);
            var lng = JSON.parse(field.Longitude);
            AddMarkerToMap(lat, lng, field);
          }
        },
        error: function(XmlHttpRequest, textStatus, errorObject) {
          alert("OData Execution Error Occurred");
        },
        complete: function() {
          //HideDialog();
        }
      });
    }
    
    function GetAllMarkers() {

        var allMarkersObjArray = [];
        var allMarkersGeoJsonArray = [];

        $.each(map._layers, function (ml) {
            //console.log(map._layers)
            if (map._layers[ml].feature) {

                allMarkersObjArray.push(this)
                allMarkersGeoJsonArray.push(JSON.stringify(this.toGeoJSON()))
            }
        })
      
        return allMarkersObjArray;
    }
}