
var inLat=op.inValue("Latitude");
var inLon=op.inValue("Longitude");

var inMapWidth=op.inValue("MapWidth",1);

var outX=op.outValue("X");
var outY=op.outValue("Y");

inLat.onChange=update;
inLon.onChange=update;
inMapWidth.onChange=update;


function update()
{
    var mapWidth    = inMapWidth.get();//1.289672544080605;
    var mapHeight   = 1;

    var latitude=inLat.get();
    var longitude=inLon.get();
    // get x value
    var x = (longitude+180)*(mapWidth/360);
    
    // convert from degrees to radians
    var latRad = latitude*Math.PI/180;
    
    // get y value
    var mercN = Math.log(Math.tan((Math.PI/4)+(latRad/2)));
    var y     = (mapHeight/2)-(mapWidth*mercN/(2*Math.PI));
    
    // x-=mapWidth/2;

    outX.set(x);
    outY.set(0-y);
}
