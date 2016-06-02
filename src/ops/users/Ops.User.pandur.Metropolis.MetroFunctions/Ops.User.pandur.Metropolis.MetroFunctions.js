op.name="MetroFunctions";

var points=this.addInPort(new Port(this,"elevationPoints",OP_PORT_TYPE_ARRAY));
points.ignoreValueSerialize=true;

window.METROPOLIS=window.METROPOLIS||{};


window.METROPOLIS.maxLat=34.475449999999974;
window.METROPOLIS.maxLon=-117.17766399999971;
window.METROPOLIS.minLat=33.31545;
window.METROPOLIS.minLon=-119.017664;
window.METROPOLIS.elevationLoaded=false;

window.METROPOLIS.centerLat=(window.METROPOLIS.maxLat-window.METROPOLIS.minLat)/2;
window.METROPOLIS.centerLon=(window.METROPOLIS.maxLon-window.METROPOLIS.minLon)/2;

var maxLat=-9999;
var maxLon=-9999;
var minLat=9999;
var minLon=9999;

var stepLat;
var stepLon;

var elevations=[];

var mapResLat=29;
var mapResLon=48; // make this bigger to find optimum index size...

points.onValueChanged=function()
{

    var p=points.get();
    if(p && p.length>0)
    {
        console.log(p);
        
        for(var i in p)
        {
            maxLat=Math.max(maxLat,p[i][0]);
            minLat=Math.min(minLat,p[i][0]);
        
            maxLon=Math.max(maxLon,p[i][1]);
            minLon=Math.min(minLon,p[i][1]);
        }
        
        console.log(maxLat,minLat);
    
        stepLat=(maxLat-minLat)/mapResLat;
        stepLon=(maxLon-minLon)/mapResLon;
        stepLon=Math.abs(stepLon);
        console.log("stepLon",stepLon);
    
    
        elevations.length=mapResLon*mapResLat;
    
        var count=0;
        var countLon=0;
        var lastIndex=0;
        var lastIndexLon=0;
    
        for(var i in p)
        {
            var vl=p[i][0]-minLat;
            var vlo=p[i][1]-minLon;
            var index=Math.round(vl/stepLat);
            var indexLon=Math.round(vlo/stepLon);
            
            if(index!=lastIndex)count++;
            lastIndex=index;
    
            // console.log(indexLon);
    
            elevations[index+mapResLon*indexLon]=p[i][2];
            
        }
        console.log('num indizes lat: ',count);
        console.log('num indizes lon: ',p.length/count);
        
        window.METROPOLIS.elevationLoaded=true;

    }

};





window.METROPOLIS.latLonCoord=function(lat,lon)
{
    var z=0;
    var ilat=Math.round((lat-minLat)/stepLat);
    var ilon=Math.round((lon-minLon)/stepLon);
    
    var index=ilat+ilon*mapResLon;
    if(index<elevations.length)
        z=elevations[index]*0.3;

    
    return {
        "lat":lat-window.METROPOLIS.minLat - window.METROPOLIS.centerLat,
        "lon":lon-window.METROPOLIS.minLon - window.METROPOLIS.centerLon,
        "z":z,
    };
};
console.log('metro functions!');



