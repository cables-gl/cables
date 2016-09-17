Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

// if(cgl.aborted)return false;

this.name='Performance';

this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION)) ;

this.textureOut=this.addOutPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE));
var outFPS=this.addOutPort(new Port(this,"fps",OP_PORT_TYPE_VALUE));


this.enabled=this.addInPort(new Port(this,"enabled",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.enabled.set(true);



var canvas = document.createElement('canvas');
canvas.id     = "performance_"+self.patch.config.glCanvasId;
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
var ctx = fontImage.getContext('2d');

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
for(var i=0;i<canvas.width;i++)
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
    if(!self.enabled.get())
    {
        self.trigger.trigger();
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

        text=self.patch.config.glCanvasId+' fps: '+fps;
        text+=' '+cgl.canvas.clientWidth+' x '+cgl.canvas.clientHeight;
        
        

        fpsStartTime=Date.now();
        warn='';
        if(CGL.profileShaderCompiles>0)warn+='Shader compile! ';
        if(CGL.profileShaderGetUniform>0)warn+='Shader get uni loc! ';
        if(CGL.profileTextureResize>0)warn+='Texture resize! ';
        if(CGL.profileFrameBuffercreate>0)warn+='Framebuffer create! ';
        



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
        text3='shader binds: '+Math.ceil(CGL.profileShaderBinds/fps)+' uniforms: '+Math.ceil(CGL.profileUniformCount/fps);
        text3+=' (self: '+Math.round((selfTime)*100)/100+' ms) ';
        

        CGL.profileUniformCount=0;
        CGL.profileShaderGetUniform=0;
        CGL.profileShaderCompiles=0;
        CGL.profileShaderBinds=0;
        CGL.profileTextureResize=0;
        CGL.profileFrameBuffercreate=0;

    }
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#222222";
    ctx.fillRect(0,0,canvas.width,canvas.height);


    ctx.fillStyle="#555555";
    var k=0;
    for(k=512;k>=0;k--)
    {
        ctx.fillRect(512-k,canvas.height-queue[k]*2.5,1,queue[k]*2.5);
    }

    ctx.fillStyle="#aaaaaa";
    for(k=512;k>=0;k--)
    {
        ctx.fillRect(512-k,canvas.height-queueChilds[k]*2.5,1,queueChilds[k]*2.5);
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

    if(self.textureOut.isLinked())
    {
        if(self.textureOut.get()) self.textureOut.get().initTexture(cgl,fontImage);
            else self.textureOut.set( new CGL.Texture.fromImage(cgl,fontImage) );
    }

    lastTime=performance.now();
    selfTime=performance.now()-ll;

    var startTimeChilds=performance.now();

    self.trigger.trigger();

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

self.exe.onTriggered=refresh;
if(CABLES.UI)gui.setLayout();
