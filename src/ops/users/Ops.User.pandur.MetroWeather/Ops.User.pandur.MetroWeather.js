
//http://truth-and-beauty.net/projects/ukko


this.name="Weather";
var cgl=this.patch.cgl;

var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"next",OP_PORT_TYPE_FUNCTION));
var json=this.addInPort(new Port(this,"json",OP_PORT_TYPE_OBJECT ));

var inHour=this.addInPort(new Port(this,"hour",OP_PORT_TYPE_VALUE ));


var outWindDir=this.addOutPort(new Port(this,"wind dir",OP_PORT_TYPE_VALUE ));
var outWindSpeed=this.addOutPort(new Port(this,"Wind Speed",OP_PORT_TYPE_VALUE ));
var outAirTemp=this.addOutPort(new Port(this,"air temp",OP_PORT_TYPE_VALUE ));


json.onValueChange(function()
{
   
   
   
    
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

        vec3.set(tempVec,arr[i].lat-34,arr[i].lon+118,0);

        cgl.pushMvMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, tempVec);


        trigger.trigger();
        cgl.popMvMatrix();
        
    }
    
    
    
    
    
};