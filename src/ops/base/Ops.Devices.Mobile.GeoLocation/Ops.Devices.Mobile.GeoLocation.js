const supported = navigator.geolocation && navigator.geolocation.watchPosition;

const
    outSupported = op.outBoolNum("Browser Support", supported),
    outLat = op.outNumber("Latitude"),
    outLon = op.outNumber("Longitude"),
    outData = op.outObject("Data");

if (supported)
    navigator.geolocation.watchPosition(updatePos, error);

function error(err)
{
    console.error(err);
}

function updatePos(position)
{
    if (position.coords)
    {
        outLat.set(position.coords.latitude);
        outLon.set(position.coords.longitude);
    }
    outData.set(position);
}
