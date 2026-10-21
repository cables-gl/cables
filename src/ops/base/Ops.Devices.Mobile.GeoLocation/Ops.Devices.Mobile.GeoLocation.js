const supported = navigator.geolocation && navigator.geolocation.watchPosition;

const
    outSupported = op.outBoolNum("Browser Support", supported),
    outLat = op.outNumber("Latitude"),
    outLon = op.outNumber("Longitude"),
    outData = op.outObject("Data");

if (supported)
    navigator.geolocation.watchPosition(updatePos, error);
else
    op.setUiError("geo", "geolocation is not supported in this browser", 1);

function error(err)
{
    op.setUiError("geo", "could not get the location: " + err.message, 1);
}

function updatePos(position)
{
    op.setUiError("geo", null);
    if (position.coords)
    {
        outLat.set(position.coords.latitude);
        outLon.set(position.coords.longitude);
    }
    outData.set(position);
}
