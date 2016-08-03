op.name="Graph";

var trigger=this.addInPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var value=this.addInPort(new Port(this,"value",OP_PORT_TYPE_VALUE));

var texOut=op.addOutPort(new Port(op,"texture_out",OP_PORT_TYPE_TEXTURE,{preview:true}));

var cgl=op.patch.cgl;

var canvas = document.createElement('canvas');
canvas.id     = "fft_"+Math.random();
canvas.width  = 512;
canvas.height = 512;
canvas.style.display   = "none";
var body = document.getElementsByTagName("body")[0];
body.appendChild(canvas);

var canvImage = document.getElementById(canvas.id);
var ctx = canvImage.getContext('2d');


var buff=[];
var maxValue=-999999;
var minValue=999999;

value.onLinkChanged=reset;

value.onValueChanged=function()
{
    update(value.get());
};

trigger.onTriggered=function()
{
    update(value.get());
};

function reset()
{
    buff.length=0;
    maxValue=-999999;
    minValue=999999;
}

function update(val)
{
    maxValue=Math.max(maxValue,parseFloat(val));
    minValue=Math.min(minValue,parseFloat(val));
    buff.push(val);


    ctx.beginPath();
    
    ctx.fillStyle="#000";
    
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.lineWidth = 2;

    
    // ctx.rect(0,0,canvas.width,canvas.height);

    var h=Math.max(Math.abs(maxValue),Math.abs(minValue));

    var heightmul=canvas.height/h;

    var start=Math.max(0,buff.length-canvas.width);


    function getPos(v)
    {
        return (v/h*canvas.height/2*0.9)+canvas.height/2;
    }

    ctx.fillStyle="#444";
    ctx.fillRect(0,getPos(0),canvas.width,1);

    ctx.strokeStyle="#fff";
    for(var i=start;i<buff.length;i++)
    {
        ctx.lineTo(
            1+i-start,
            getPos(buff[i]));

    }
    
    ctx.stroke();
    ctx.font = "22px monospace";

    ctx.fillStyle="#f00";
    ctx.fillText('max:'+(Math.round(maxValue*100)/100), 10, canvas.height-10);
    ctx.fillText('min:'+(Math.round(minValue*100)/100), 10, canvas.height-30);


    if(texOut.get()) texOut.get().initTexture(canvImage);
        else texOut.set( new CGL.Texture.createFromImage(cgl,canvImage) );

};

