var cgl=op.patch.cgl;

op.name='Performance';

var exe=this.addInPort(new CABLES.Port(this,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new CABLES.Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION)) ;
var textureOut=this.addOutPort(new CABLES.Port(this,"texture",CABLES.OP_PORT_TYPE_TEXTURE));
var outFPS=this.addOutPort(new CABLES.Port(this,"fps",CABLES.OP_PORT_TYPE_VALUE));

var drawGraph=op.inValueBool("Draw Graph",true);
var enabled=op.inValueBool("enabled",true);
var numBars=256;

var canvas = document.createElement('canvas');
canvas.id     = "performance_"+op.patch.config.glCanvasId;
canvas.width  = 512;
canvas.height = 128;
canvas.style.display   = "block";
canvas.style['z-index']   = "99999";
var body = document.getElementsByTagName("body")[0];
body.appendChild(canvas);

if(!CABLES.UI)
{
    canvas.style.position='absolute';
    canvas.style.bottom='0px';
}


var fontImage = document.getElementById(canvas.id);
var ctx = canvas.getContext('2d');

var text='';

ctx.font = "12px monospace";
ctx.fillStyle = 'white';

var frames=0;
var fps=0;
var fpsStartTime=0;

var lastTime=0;
var childsTime=0;

var queue=[];
var queueChilds=[];
for(var i=0;i<numBars;i++)
{
    queue[i]=-1;
    queueChilds[i]=-1;
}

var avgMs=0;
var avgMsChilds=0;
var text2='';
var text3='';
var warn='';

var ll=0;
var selfTime=0;
var hasErrors=false;
var countFrames=0;

function refresh()
{
    if(!enabled.get())
    {
        trigger.trigger();
        return;
    }
    ll=performance.now();

    var ms=performance.now()-lastTime;
    queue.push(ms);
    queue.shift();

    queueChilds.push(childsTime);
    queueChilds.shift();

    frames++;

    if(fpsStartTime===0)fpsStartTime=Date.now();
    if(Date.now()-fpsStartTime>=1000)
    {
        fps=frames;
        frames=0;
        outFPS.set(fps);

        text=op.patch.config.glCanvasId+' fps: '+fps;
        
        if(op.patch.config.fpsLimit!=0)
            text+=' (limit '+op.patch.config.fpsLimit+') ';

        text+=' '+cgl.canvas.clientWidth+' x '+cgl.canvas.clientHeight;

        fpsStartTime=Date.now();
        warn='';
        if(CGL.profileData.profileShaderCompiles>0)warn+='Shader compile! ';
        if(CGL.profileData.profileShaderGetUniform>0)warn+='Shader get uni loc! ';
        if(CGL.profileData.profileAttrLoc>0)warn+='Shader get attrib loc! ';
        
        if(CGL.profileData.profileTextureResize>0)warn+='Texture resize! ';
        if(CGL.profileData.profileFrameBuffercreate>0)warn+='Framebuffer create! ';
        if(CGL.profileData.profileEffectBuffercreate>0)warn+='Effectbuffer create! ';
        if(CGL.profileData.profileTextureDelete>0)warn+='Texture delete! ';

        var count=0;
        for(var i=queue.length;i>queue.length-queue.length/3;i--)
        {
            if(queue[i]>-1)
            {
                avgMs+=queue[i];
                count++;
            }

            if(queueChilds[i]>-1)
            {
                avgMsChilds+=queueChilds[i];
            }
        }
        avgMs/=count;
        avgMsChilds/=count;

        text2='frame avg: '+Math.round(avgMsChilds*100)/100+' ms ('+Math.round(avgMsChilds/avgMs*100)+'%) / '+Math.round(avgMs*100)/100+' ms';
        text3='shader binds: '+Math.ceil(CGL.profileData.profileShaderBinds/fps)+' uniforms: '+Math.ceil(CGL.profileData.profileUniformCount/fps);
        text3+=' (self: '+Math.round((selfTime)*100)/100+' ms) ';


        CGL.profileData.profileUniformCount=0;
        CGL.profileData.profileShaderGetUniform=0;
        CGL.profileData.profileShaderCompiles=0;
        CGL.profileData.profileShaderBinds=0;
        CGL.profileData.profileTextureResize=0;
        CGL.profileData.profileFrameBuffercreate=0;
        CGL.profileData.profileEffectBuffercreate=0;
        CGL.profileData.profileTextureDelete=0;
        CGL.profileData.profileAttrLoc=0;
    }

    // ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#222222";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    if(drawGraph.get())
    {
        ctx.fillStyle="#555555";
        var k=0;
        for(k=numBars;k>=0;k--)
        {
            ctx.fillRect(numBars-k,canvas.height-queue[k]*2.5,1,queue[k]*2.5);

        }

        ctx.fillStyle="#aaaaaa";
        for(k=numBars;k>=0;k--)
        {
            ctx.fillRect(numBars-k,canvas.height-queueChilds[k]*2.5,1,queueChilds[k]*2.5);
        }

    }

    ctx.fillStyle="#cccccc";
    ctx.fillText(text, 10, 20);
    ctx.fillText(text2, 10, 35);
    ctx.fillText(text3, 10, 50);
    ctx.fillStyle="#ff4400";
    if(warn!=='')ctx.fillText('WARNING: '+warn, 10, 65);

    if(hasErrors)
    {
        ctx.fillStyle="#ff8844";
        ctx.fillText('has errors!', 10, 65);
    }

    ctx.restore();

    if(textureOut.isLinked())
    {
        if(textureOut.get()) textureOut.get().initTexture(cgl,fontImage);
            else textureOut.set( new CGL.Texture.fromImage(cgl,fontImage) );
    }

    lastTime=performance.now();
    selfTime=performance.now()-ll;

    var startTimeChilds=performance.now();

    trigger.trigger();

    childsTime=performance.now()-startTimeChilds;

    countFrames++;
    if(countFrames==30)
    {
        hasErrors=false;
        // var error = cgl.gl.getError();
        // if (error != cgl.gl.NO_ERROR)
        // {
        //     hasErrors=true;
        // }
        countFrames=0;
    }

}

this.onDelete=function()
{
    document.getElementById(canvas.id).remove();
};

exe.onTriggered=refresh;
if(CABLES.UI)gui.setLayout();
