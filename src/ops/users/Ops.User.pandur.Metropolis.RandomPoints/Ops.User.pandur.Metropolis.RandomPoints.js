op.name="RandomPoints";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var randomize=op.addInPort(new Port(op,"randomize",OP_PORT_TYPE_VALUE));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var outPoints=op.addOutPort(new Port(op,"points",OP_PORT_TYPE_ARRAY));

outPoints.ignoreValueSerialize=true;

var cgl=op.patch.cgl;
var points=[];
initPoints();

render.onTriggered=function()
{
    for(var i=0;i<points.length;i++)
    {
        cgl.pushMvMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, points[i]);
        trigger.trigger();
        cgl.popMvMatrix();
    }
};

randomize.onValueChanged=initPoints;

function initPoints()
{
    var flatArray=[];
    points.length=0;
    
    for(var i=0;i<8;i++)
    {
        var w=Math.abs(window.METROPOLIS.maxLat-window.METROPOLIS.minLat);
        var lat=window.METROPOLIS.minLat + w*0.25 + w*0.5* Math.random();
        var h=Math.abs(window.METROPOLIS.maxLon-window.METROPOLIS.minLon);
        var lon=window.METROPOLIS.minLon + h*0.25 + w*0.5 * Math.random();

        var sizeRandom=0.08;
        var num=10+Math.random()*20;
        for(var j=10;j<num;j++)
        {
            var pLat=lat+Math.random()*sizeRandom;
            var pLon=lon+Math.random()*sizeRandom;
            
            var coord=window.METROPOLIS.latLonCoord(pLat,pLon);
            var vec=vec3.create();
            vec3.set(vec, coord.lat,coord.lon,coord.z);
            flatArray.push(coord.lat);
            flatArray.push(coord.lon);
            flatArray.push(coord.z);
            points.push(vec);
        }
    }

    // outPoints.set(null);
    outPoints.set(flatArray);
    
}

setTimeout(initPoints, 1000);
