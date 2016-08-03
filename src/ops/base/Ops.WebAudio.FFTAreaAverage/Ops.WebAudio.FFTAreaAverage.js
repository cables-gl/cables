op.name="FFTAreaAverage";

var fftArr=this.addInPort(new Port(this, "FFT Array",OP_PORT_TYPE_ARRAY));
var refresh=this.addInPort(new Port(this,"refresh",OP_PORT_TYPE_FUNCTION));
var x=this.addInPort(new Port(this,"x",OP_PORT_TYPE_VALUE,{display:'range'}));
var y=this.addInPort(new Port(this,"y",OP_PORT_TYPE_VALUE,{display:'range'}));
var w=this.addInPort(new Port(this,"width",OP_PORT_TYPE_VALUE,{display:'range'}));
var h=this.addInPort(new Port(this,"height",OP_PORT_TYPE_VALUE,{display:'range'}));

var texOut=op.addOutPort(new Port(op,"texture_out",OP_PORT_TYPE_TEXTURE,{preview:true}));
var value=op.addOutPort(new Port(op,"value",OP_PORT_TYPE_VALUE));

w.set(0.2);
h.set(0.2);

var cgl=op.patch.cgl;

var data=[];

var line=0;
var height=256;

var buffer=new Uint8Array();


var canvas = document.createElement('canvas');
canvas.id     = "fft_"+Math.random();
canvas.width  = 256;
canvas.height = 256;
canvas.style.display   = "none";
var body = document.getElementsByTagName("body")[0];
body.appendChild(canvas);

var canvImage = document.getElementById(canvas.id);
var ctx = canvImage.getContext('2d');

var areaX=0;
var areaY=0;
var areaW=20;
var areaH=20;

var amount=0;

refresh.onTriggered=function()
{
    var arr=fftArr.get();
    if(!arr)return;
    var width=arr.length;


    ctx.beginPath();
    
    // ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle="#f00";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#fff";
    for(var i=0;i<arr.length;i++)
    {
        ctx.fillRect(i*2,height-arr[i],2,arr[i]);
    }
    
    ctx.strokeStyle="#f00";
    areaX=x.get()*canvas.width;
    areaY=y.get()*canvas.height;
    
    areaW=w.get()*128;
    areaH=h.get()*128;
    
    ctx.rect(areaX,areaY,areaW,areaH);
    ctx.stroke();
    

    var val=0;
    var count=0;
    for(var xc=areaX;xc<areaX+areaW;xc++)
    {
        for(var yc=areaY;yc<areaY+areaH;yc++)
        {
            if(arr[Math.round(xc/2)]>256-yc)count++;
        }
    }
    amount=amount+count/(areaW*areaH);
    amount/=2;
    value.set(amount);

    ctx.fillStyle="#f00";
    ctx.fillRect(0,3,amount*canvas.width,5);
    
    ctx.fillStyle="#000";
    ctx.fillText(arr.length+' ...', 10, height-10);

    if(texOut.get()) texOut.get().initTexture(canvImage);
        else texOut.set( new CGL.Texture.createFromImage(cgl,canvImage) );

};

