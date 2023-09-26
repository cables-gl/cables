const
    inArr = op.inArray("LatLon Array"),
    inMapWidth = op.inValue("MapWidth", 100),
    inCenterLat = op.inValue("Center Lat", 0),
    inCenterLon = op.inValue("Center Lon", 0),
    outArr = op.outArray("Result");

inArr.onChange =
    inMapWidth.onChange =
    // inMapHeight.onChange=
    inCenterLat.onChange =
    inCenterLon.onChange = update;

function calcLon(lon, mapWidth)
{
    const x = (lon + 180) * (mapWidth / 360);
    return x;
}

function calcLat(lat, mapWidth, mapHeight)
{
    const latRad = lat * Math.PI / 180;

    // get y value
    const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
    const y = (mapHeight / 2) - (mapWidth * mercN / (2 * Math.PI));
    return y;
}

function update()
{
    const mapWidth = inMapWidth.get();// 1.289672544080605;
    const mapHeight = 1;// inMapHeight.get();// 1;

    const centerLon = calcLon(inCenterLon.get(), mapWidth, mapHeight);
    const centerLat = calcLat(inCenterLat.get(), mapWidth, mapHeight);

    const arr = inArr.get();

    if (!arr)
    {
        outArr.set(null);
        return;
    }

    const newArray = [];

    for (let i = 0; i < arr.length; i += 2)
    {
        const latitude = arr[i];// inLat.get();
        const longitude = arr[i + 1];// inLon.get();

        let lon = calcLon(longitude, mapWidth, mapHeight);
        let lat = calcLat(latitude, mapWidth, mapHeight);

        // convert from degrees to radians
        // x-=mapWidth/2;

        lon -= centerLon;
        lat -= centerLat;

        newArray.push(lon, 0 - lat);
    }

    outArr.setRef(newArray);
}
