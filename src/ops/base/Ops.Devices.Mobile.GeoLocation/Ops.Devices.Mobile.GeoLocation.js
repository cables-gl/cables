var outSupported=op.outValue("Browser Support",navigator.geolocation!=false);

var outLat=op.outValue("Latitude");
var outLon=op.outValue("Longitude");

if(navigator.geolocation && navigator.geolocation.watchPosition)
    navigator.geolocation.watchPosition(updatePos);

function updatePos(position)
{
    outLat.set(position.coords.latitude);
    outLon.set(position.coords.longitude);
    console.log(position);
}
