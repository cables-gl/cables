op.name="MetroFunctions";

var points=this.addInPort(new Port(this,"elevationPoints",OP_PORT_TYPE_ARRAY));
var pointsLowres=this.addInPort(new Port(this,"points lowres",OP_PORT_TYPE_ARRAY));

pointsLowres.ignoreValueSerialize=true;
points.ignoreValueSerialize=true;

window.METROPOLIS=window.METROPOLIS||{};
window.METROPOLIS.maxLat=34.475449999999974;
window.METROPOLIS.maxLon=-117.17766399999971;
window.METROPOLIS.minLat=33.31545;
window.METROPOLIS.minLon=-119.017664;
window.METROPOLIS.elevationLoaded=false;

window.METROPOLIS.centerLat=(window.METROPOLIS.maxLat-window.METROPOLIS.minLat)/2;
window.METROPOLIS.centerLon=(window.METROPOLIS.maxLon-window.METROPOLIS.minLon)/2;

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

    return {
        "lat":lat-minlat - window.METROPOLIS.centerLat,
        "lon":lon-minlon - window.METROPOLIS.centerLon,
        "z":z,
    };
};
console.log('metro functions!');



