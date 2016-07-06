op.name="MetroFunctions";

var points=this.addInPort(new Port(this,"elevationPoints",OP_PORT_TYPE_ARRAY));
var pointsLowres=this.addInPort(new Port(this,"points lowres",OP_PORT_TYPE_ARRAY));
var outBigBoundsLat=this.addOutPort(new Port(this,"boundsLat",OP_PORT_TYPE_VALUE));
var outBigBoundsLon=this.addOutPort(new Port(this,"boundsLon",OP_PORT_TYPE_VALUE));
var outBigBoundsLatEnd=this.addOutPort(new Port(this,"boundsLat End",OP_PORT_TYPE_VALUE));
var outBigBoundsLonEnd=this.addOutPort(new Port(this,"boundsLon End",OP_PORT_TYPE_VALUE));
var outBigBoundsWidth=this.addOutPort(new Port(this,"boundsLon width",OP_PORT_TYPE_VALUE));
var outBigBoundsHeight=this.addOutPort(new Port(this,"boundsLon height",OP_PORT_TYPE_VALUE));

pointsLowres.ignoreValueSerialize=true;
points.ignoreValueSerialize=true;

window.METROPOLIS=window.METROPOLIS||{};
window.METROPOLIS.maxLat=47.8068588915575;
window.METROPOLIS.maxLon=-133.091054051991;
window.METROPOLIS.minLat=29.3426216844294;
window.METROPOLIS.minLon=-98.3337189965568;
window.METROPOLIS.elevationLoaded=false;



var coord={};//window.METROPOLIS.latLonCoord(lat.get(),lon.get());

// var latSize2=Math.abs(Math.abs(window.METROPOLIS.maxLat)-Math.abs(window.METROPOLIS.minLat))/2;
// var lonSize2=Math.abs((Math.abs(window.METROPOLIS.maxLon)-Math.abs(window.METROPOLIS.minLon)))/2;


var latSize=( Math.abs(window.METROPOLIS.maxLat)-Math.abs(window.METROPOLIS.minLat));
var lonSize=Math.abs(Math.abs(window.METROPOLIS.maxLon)-Math.abs(window.METROPOLIS.minLon));

coord.lat=0;
coord.lon=0;

window.METROPOLIS.centerLat=(window.METROPOLIS.maxLat-window.METROPOLIS.minLat)/2;
window.METROPOLIS.centerLon=(window.METROPOLIS.maxLon-window.METROPOLIS.minLon)/2;


outBigBoundsLon.set( -137.012813589663);
outBigBoundsLat.set( 42.5405387074109);

outBigBoundsLonEnd.set( -102.591308916431);
outBigBoundsLatEnd.set( 30.5184651206115);

outBigBoundsWidth.set(Math.abs(outBigBoundsLatEnd.get()-outBigBoundsLat.get()));
outBigBoundsHeight.set(Math.abs(outBigBoundsLonEnd.get()-outBigBoundsLon.get()));



var heightMapData=function(p,mapResLat,mapResLon, flip)
{
    var data=
        {
            maxLat:-9999,
            maxLon:-9999,
            minLat:9999,
            minLon:9999,
            stepLat:0,
            stepLon:0,
            mapResLon:mapResLon,
            mapResLat:mapResLat,
            elevations:[]
        };

    if(p && p.length>0)
    {
        for(var i in p)
        {
            data.maxLat=Math.max(data.maxLat,p[i][0]);
            data.minLat=Math.min(data.minLat,p[i][0]);

            data.maxLon=Math.max(data.maxLon,p[i][1]);
            data.minLon=Math.min(data.minLon,p[i][1]);
        }

        data.stepLat=Math.abs(data.maxLat-data.minLat)/mapResLat;
        data.stepLat=(data.stepLat);

        data.stepLon=Math.abs(data.maxLon-data.minLon)/mapResLon;
        data.stepLon=(data.stepLon);

        console.log('data.stepLat',data.stepLat,data.stepLon);
        data.elevations.length=mapResLon*mapResLat;

        var count=0;
        var countLon=0;
        var lastIndex=0;
        var lastIndexLon=0;

        for(var i in p)
        {
            var vl=p[i][0]-data.minLat;
            var vlo=p[i][1]-data.minLon;
            var index=Math.round(vl/data.stepLat);
            var indexLon=Math.round(vlo/data.stepLon);
            
            if(flip)index=mapResLat-index;

            if(index!=lastIndex) count++;
            lastIndex=index;

            data.elevations[(index+mapResLon*indexLon)]=p[i][2];
        }

        console.log('num indizes lat: ',count);
        console.log('num indizes lon: ',p.length/count);
    }
    
    return data;
};


var loadedLowres=false;
var loadedHires=false;
var hires=null;
var lowres=null;

points.onValueChanged=function()
{
    if(points.get())
    {
        hires=new heightMapData(points.get(),29,39);
        

        setTimeout(function()
        {
            loadedHires=true;
            window.METROPOLIS.elevationLoaded=(loadedLowres && loadedHires);
            
            console.log('elevationloaded: ', window.METROPOLIS.elevationLoaded,loadedLowres,loadedHires );
        },100);
    }
};

pointsLowres.onValueChanged=function()
{
    if(pointsLowres.get())
    {
        var points=pointsLowres.get();

        lowres=new heightMapData(points,31,19,true);
        // var sortele=[];
        // sortele.length=lowres.elevations.length;
        // for(var x=0;x<32;x++)
        // {
        //     for(var y=0;y<32;y++)
        //     {
        //         // sortele[32-x+y*20]=lowres.elevations[x+y*20];
        //         sortele[x+(20-y)*20]=lowres.elevations[x+y*20];
        //     }
        // }
        // for(var x=0;x<32;x++)
        // {
        //     for(var y=0;y<32;y++)
        //     {
        //         sortele[32-x+y*20]=lowres.elevations[x+y*20];
        //         // sortele[x+(20-y)*20]=lowres.elevations[x+y*20];
        //     }
        // }
        // lowres.elevations=sortele;

        window.METROPOLIS.lowres=lowres;
        setTimeout(function()
        {
            loadedLowres=true;
            window.METROPOLIS.elevationLoaded=(loadedLowres && loadedHires);
            console.log('window.METROPOLIS.lowres');
            console.log(window.METROPOLIS.lowres);
            console.log('elevationloaded: ', window.METROPOLIS.elevationLoaded,loadedLowres,loadedHires );
        },100);
    }
};


window.test=[];
var foundnan=false;

window.METROPOLIS.latLonCoord=function(lat,lon)
{
    var minlat=window.METROPOLIS.minLat;
    var minlon=window.METROPOLIS.minLon;
    var z=-1;
    if(!hires)
    {
        console.log('coord request but no coords loaded');
        var err = new Error();
        console.log(err.stack);
    }
    else
    {
        if(lat>hires.minLat && lat<hires.maxLat && lon>hires.minLon && lon<hires.maxLon)
        {
            var ilat=Math.round((lat-hires.minLat)/hires.stepLat);
            var ilon=Math.round((lon-hires.minLon)/hires.stepLon);

            var index=ilat+ilon*hires.mapResLon;
            if(index<hires.elevations.length)
            {
                z=hires.elevations[index]*0.3;
            }
        }
        // else 
        // if(lat>lowres.minLat && lat<lowres.maxLat && lon>lowres.minLon && lon<lowres.maxLon )
        // {
        //     var ilat=Math.round((lat-lowres.minLat)/lowres.stepLat);
        //     var ilon=Math.round((lon-lowres.minLon)/lowres.stepLon);
            
        //     var index=ilat+ilon*lowres.mapResLon;
        //     if(index<lowres.elevations.length)
        //     {
        //         z=lowres.elevations[index]*0.3;
        //         // console.log('found lowres point',z);
        //         window.test.push(index);
        //     }
        // }
    }

    if(isNaN(z))
    {
        if(!foundnan)
        {
            console.error("NAN coord");
            foundnan=true;
        }
        z=-1;
    }

    z=0;

    coord.lon=(lon-window.METROPOLIS.minLon)+lonSize/2;
    // coord.lon=(lon-window.METROPOLIS.minLon)+lonSize/2-lonSize;
    coord.lat=(window.METROPOLIS.minLat-lat)+latSize/2;
    coord.z=z;
    
    coord.lat/=10;
    coord.lon/=10;
// console.log(coord);


    return coord;
};
console.log('metro functions!');



