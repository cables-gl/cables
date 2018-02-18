// Op.apply(this, arguments);
// var self=this;
var cgl=this.patch.cgl;
this.name='MercatorCoordTransform';
var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var arr=this.addInPort(new Port(this,"array",OP_PORT_TYPE_ARRAY));

var centerLon=this.addInPort(new Port(this,"center lon",OP_PORT_TYPE_VALUE));
var centerLat=this.addInPort(new Port(this,"center lat",OP_PORT_TYPE_VALUE));

var mul=this.addInPort(new Port(this,"mul",OP_PORT_TYPE_VALUE));



var indexOut=this.addOutPort(new Port(this,"index",OP_PORT_TYPE_VALUE));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));


var vecMin=vec3.create();
    
var centerX=0,centerY=0;

function getCoord(lat,lon)
{
    var vec=vec3.create();
    var x=parseFloat(lon);
    var y=parseFloat(lat);
    x=x-centerX;
    y=y-centerY;
    vec3.set(vec,x,y,0);
    return vec;
}

var points=[];

var parse=function()
{
    points.length=0;
    centerX=centerY=0;
    var cvec=getCoord(centerLat.get(),centerLon.get());
    centerX=cvec[0];
    centerY=cvec[1];

    var theArray=arr.get();
    for(var i in theArray)
    {
        var lon=(theArray[i].lon || theArray[i].longitude);
        var lat=(theArray[i].lat || theArray[i].latitude);
        
        var vec=getCoord(lat,lon);
        var vecMin=vec3.create();

        vec[0]*=mul.get();
        vec[1]*=mul.get();

        vec3.set(vecMin,-1*vec[0],-1*vec[1],0);
        points.push({vec:vec,vecMin:vecMin})

    }
    console.log('parse json coords...')

}

arr.onValueChange(parse);
centerLat.onValueChange(parse);
centerLon.onValueChange(parse);

exe.onTriggered=function()
{
    if(!arr.val)return;

    

    for(var i=0;i<points.length;i++)
    {
        indexOut.set(i);
        cgl.pushModelMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, points[i].vec);
        trigger.trigger();
        // mat4.translate(cgl.mvMatrix,cgl.mvMatrix, points[i].vecMin);
        cgl.popModelMatrix();
    }

    

};
