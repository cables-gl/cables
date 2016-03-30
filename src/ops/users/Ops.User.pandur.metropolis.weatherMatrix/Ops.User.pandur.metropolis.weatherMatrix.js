
//http://truth-and-beauty.net/projects/ukko


this.name="Weather matrix";
var cgl=this.patch.cgl;

var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"next",OP_PORT_TYPE_FUNCTION));
var json=this.addInPort(new Port(this,"json",OP_PORT_TYPE_OBJECT ));

var inHour=this.addInPort(new Port(this,"hour",OP_PORT_TYPE_VALUE ));


var outWindDir=this.addOutPort(new Port(this,"wind dir",OP_PORT_TYPE_VALUE ));
var outWindSpeed=this.addOutPort(new Port(this,"Wind Speed",OP_PORT_TYPE_VALUE ));
var outAirTemp=this.addOutPort(new Port(this,"air temp",OP_PORT_TYPE_VALUE ));


    function map(v,in_min, in_max, out_min, out_max)
    {
      return (v - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

json.onValueChange(function()
{
    var hour=Math.floor( inHour.get() % 24 );
    var arr=json.get();

    var maxLon=-9999;
    var minLon=9999;
    var maxLat=-9999;
    var minLat=9999;
    var i=0;

    for(i in arr)
    {

        var lon=arr[i].lon+118;
        var lat=arr[i].lat-34;
        arr[i].lon=lon;
        arr[i].lat=lat;

        maxLon=Math.max(maxLon,lon);
        minLon=Math.min(minLon,lon);
        maxLat=Math.max(maxLat,lat);
        minLat=Math.min(minLat,lat);
    }

    console.log('lon',minLon,maxLon);
    console.log('lat',minLat,maxLat);

    var w=30;
    var h=20;
    var distLat=Math.abs(minLat)+Math.abs(maxLat);
    console.log(distLat);
    var distLon=Math.abs(minLon)+Math.abs(maxLon);
    console.log(distLon);



    for(i in arr)
    {
        arr[i].x = Math.round(map(arr[i].lon,minLon,maxLon,0,w));
        arr[i].y = Math.round(map(arr[i].lat,minLat,maxLat,0,h));

    }

   
   
    
});

var tempVec=vec3.create();

exe.onTriggered=function()
{
    var hour=Math.floor( inHour.get() % 24 );
    var arr=json.get();

    for(var i in arr)
    {
        

        outWindDir.set(arr[i].VDD[hour] || 0);
        outWindSpeed.set(arr[i].VFF[hour] || 0);
        
        outAirTemp.set(arr[i].VT[hour] || 0);


        vec3.set(tempVec,arr[i].x*0.1,arr[i].y*0.1,0);
    
        cgl.pushMvMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, tempVec);
    
        trigger.trigger();
        cgl.popMvMatrix();
    }


    
    
    
    
};