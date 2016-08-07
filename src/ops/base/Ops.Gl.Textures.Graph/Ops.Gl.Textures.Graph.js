op.name="Graph";

var trigger=this.addInPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var value=this.addInPort(new Port(this,"value",OP_PORT_TYPE_VALUE));
var index=this.addInPort(new Port(this,"index",OP_PORT_TYPE_VALUE));

var inReset=this.addInPort(new Port(this,"reset",OP_PORT_TYPE_FUNCTION,{display:'button'}));

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
var colors=[];
var lastTime=Date.now();

value.onLinkChanged=reset;
index.onLinkChanged=reset;
inReset.onTriggered=reset;

value.onValueChanged=function()
{
    addValue(value.get(),Math.round(index.get()));
};

trigger.onTriggered=function()
{
    for(var i=0;i<buff.length;i++)
    {
        if(buff[i]) addValue(buff[i][ buff[i].length-1 ],i);
    }
    updateGraph();
};

function reset()
{
    buff.length=0;
    maxValue=-999999;
    minValue=999999;
}

function addValue(val,currentIndex)
{
    maxValue=Math.max(maxValue,parseFloat(val));
    minValue=Math.min(minValue,parseFloat(val));
    
    
    if(!buff[currentIndex])
    {
        buff[currentIndex]=[];
        Math.randomSeed=5711+2*currentIndex;
        colors[currentIndex] = 'rgba('+Math.round(Math.seededRandom()*255)+','+Math.round(Math.seededRandom()*255)+','+Math.round(Math.seededRandom()*255)+',1)';
    }
    
    var buf=buff[currentIndex];
    buf.push(val);
    
    if(!trigger.isLinked())if(Date.now()-lastTime>30)updateGraph();
}

function updateGraph()
{
    function getPos(v)
    {
        return canvas.height-( (v/h*canvas.height/2*0.9)+canvas.height/2 );
    }

    ctx.fillStyle="#000";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#444";
    ctx.fillRect(0,getPos(0),canvas.width,1);
    
    
    for(var b=0;b<buff.length;b++)
    {
        buf=buff[b];
        if(!buf)continue;

        ctx.lineWidth = 2;
    
        var h=Math.max(Math.abs(maxValue),Math.abs(minValue));
        var heightmul=canvas.height/h;
        var start=Math.max(0,buf.length-canvas.width);

        ctx.beginPath();    
        ctx.strokeStyle=colors[b];

        ctx.moveTo(0,getPos(buf[start]));
        
        for(var i=start;i<buf.length;i++)
        {
            ctx.lineTo(
                1+i-start,
                getPos(buf[i]));
    
        }
        ctx.stroke();
    }

    ctx.font = "22px monospace";

    ctx.fillStyle="#fff";
    ctx.fillText('max:'+(Math.round(maxValue*100)/100), 10, canvas.height-10);
    ctx.fillText('min:'+(Math.round(minValue*100)/100), 10, canvas.height-30);


    if(texOut.get()) texOut.get().initTexture(canvImage);
        else texOut.set( new CGL.Texture.createFromImage(cgl,canvImage) );

    lastTime=Date.now();
};

