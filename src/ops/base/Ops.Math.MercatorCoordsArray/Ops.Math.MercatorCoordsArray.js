const
    inArr=op.inArray("LatLon Array"),
    inMapWidth=op.inValue("MapWidth",100),
    inCenterLat=op.inValue("Center Lat",0),
    inCenterLon=op.inValue("Center Lon",0),
    outArr=op.outArray("Result");

inArr.onChange=
    inMapWidth.onChange=
    // inMapHeight.onChange=
    inCenterLat.onChange=
    inCenterLon.onChange=update;


function calcLon(lon,mapWidth)
{
    var x = (lon+180)*(mapWidth/360);
    return x;
}

function calcLat(lat,mapWidth,mapHeight)
{
    var latRad = lat*Math.PI/180;

    // get y value
    var mercN = Math.log(Math.tan((Math.PI/4)+(latRad/2)));
    var y     = (mapHeight/2)-(mapWidth*mercN/(2*Math.PI));
    return y;
}


function update()
{
    var mapWidth    = inMapWidth.get();//1.289672544080605;
    var mapHeight   = 1;//inMapHeight.get();// 1;

    const centerLon=calcLon(inCenterLon.get(),mapWidth,mapHeight);
    const centerLat=calcLat(inCenterLat.get(),mapWidth,mapHeight);

    console.log('centerLon',centerLon,centerLat,mapHeight);

    var arr=inArr.get();

    if(!arr)
    {
        outArr.set(null);
        return;
    }

    var newArray=[];

    for(var i=0;i<arr.length;i+=2)
    {
        var latitude=arr[i];//inLat.get();
        var longitude=arr[i+1];//inLon.get();

        var lon=calcLon(longitude,mapWidth,mapHeight);
        var lat=calcLat(latitude,mapWidth,mapHeight);

        // convert from degrees to radians
        // x-=mapWidth/2;

        lon-=centerLon;
        lat-=centerLat;

        newArray.push(lon,0-lat);
    }

    outArr.set(null);
    outArr.set(newArray);

}
