const
    outSupported = op.outBoolNum("Browser Support", navigator.geolocation != false),
    outLat = op.outNumber("Latitude"),
    outLon = op.outNumber("Longitude"),
    outData = op.outObject("Data");

if (navigator.geolocation && navigator.geolocation.watchPosition)
    navigator.geolocation.watchPosition(updatePos);

function updatePos(position)
{
    outLat.set(position.coords.latitude);
    outLon.set(position.coords.longitude);
    outData.set(position);
}
