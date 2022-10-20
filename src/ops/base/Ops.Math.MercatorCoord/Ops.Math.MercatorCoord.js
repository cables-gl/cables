const
    inLat = op.inValue("Latitude"),
    inLon = op.inValue("Longitude"),
    inMapWidth = op.inValue("MapWidth", 1),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y");

inLat.onChange =
    inLon.onChange =
    inMapWidth.onChange = update;


function update()
{
    let mapWidth = inMapWidth.get();// 1.289672544080605;
    let mapHeight = 1;

    let latitude = inLat.get();
    let longitude = inLon.get();
    // get x value
    let x = (longitude + 180) * (mapWidth / 360);

    // convert from degrees to radians
    let latRad = latitude * Math.PI / 180;

    // get y value
    let mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
    let y = (mapHeight / 2) - (mapWidth * mercN / (2 * Math.PI));

    // x-=mapWidth/2;

    outX.set(x);
    outY.set(0 - y);
}
