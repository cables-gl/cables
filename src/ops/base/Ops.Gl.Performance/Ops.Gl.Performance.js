var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var next=this.addOutPort(new Port(this,"childs",OP_PORT_TYPE_FUNCTION)) ;

var inShow=op.inValueBool("Visible",true);

var outFPS=op.outValue("FPS");
var element = document.createElement('div');
var ctx=null;
var cgl=op.patch.cgl;
var opened=false;
var frameCount=0;
var fps=0;
var fpsStartTime=0;
var childsTime=0;
var avgMsChilds=0;
var queue=[];
var queueChilds=[];
var numBars=128;
var avgMs=0;
var selfTime=0;
var canvas=null;
var lastTime=0;
var loadingCounter=0;

var loadingChars=['|','/','-','\\'];

for(var i=0;i<numBars;i++)
{
    queue[i]=-1;
    queueChilds[i]=-1;
}

element.id="performance";
element.style.position="absolute";
element.style.left="0px";
element.style.top="0px";
element.style.opacity="0.8";
element.style.padding="10px";
element.style.cursor="pointer";
element.style.background="#222";
element.style.color="white";
element.style["font-family"]="monospace";
element.style["font-size"]="11px";
element.style["z-index"]="9999";
element.innerHTML="&nbsp;";

var container = op.patch.cgl.canvas.parentElement;
container.appendChild(element);

element.addEventListener("click", toggleOpened);

op.onDelete=function()
{
    element.remove();
};

inShow.onChange=function()
{
    if(!inShow.get())element.style.opacity=0;
        else element.style.opacity=1;
    
};

function toggleOpened()
{
    element.style.opacity=1;
    opened=!opened;
    updateText();
    if(!canvas)createCanvas();
    if(opened)
    {
        canvas.style.display="block";
        element.style.left=numBars+"px";
        element.style["min-height"]="56px";
    }
    else 
    {
        canvas.style.display="none";
        element.style.left="0px";
        element.style["min-height"]="auto";
    }
}

function updateCanvas()
{
    ctx.fillStyle="#222222";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#555555";
    var k=0;
    for(k=numBars;k>=0;k--)
    {
        if(queue[k]>30)ctx.fillStyle="#ff5555";
        ctx.fillRect(numBars-k,canvas.height-queue[k]*2.5,1,queue[k]*2.5);
        if(queue[k]>30)ctx.fillStyle="#555555";
    }

    ctx.fillStyle="#aaaaaa";
    for(k=numBars;k>=0;k--)
    {
        if(queueChilds[k]>30)ctx.fillStyle="#ff00ff";
        ctx.fillRect(numBars-k,canvas.height-queueChilds[k]*2.5,1,queueChilds[k]*2.5);
        if(queueChilds[k]>30)ctx.fillStyle="#aaaaaa";
    }

}

function createCanvas()
{
    canvas = document.createElement('canvas');
    canvas.id     = "performance_"+op.patch.config.glCanvasId;
    canvas.width  = numBars;
    canvas.height = "128";
    canvas.style.display   = "block";
    canvas.style.opacity   = 0.9;
    canvas.style.position  = "absolute";
    canvas.style.left  = "0px";
    canvas.style.cursor  = "pointer";
    canvas.style.top  = "-64px";
    canvas.style['z-index']   = "9998";
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');

    canvas.addEventListener("click", toggleOpened);
    
}

function updateText()
{

    var warn="";
    if(CGL.profileShaderCompiles>0)warn+='Shader compile ('+CGL.profileShaderCompileName+') ';
    if(CGL.profileShaderGetUniform>0)warn+='Shader get uni loc! ('+CGL.profileShaderGetUniformName+')';
    if(CGL.profileTextureResize>0)warn+='Texture resize! ';
    if(CGL.profileFrameBuffercreate>0)warn+='Framebuffer create! ';
    if(CGL.profileEffectBuffercreate>0)warn+='Effectbuffer create! ';
    if(CGL.profileTextureDelete>0)warn+='Texture delete! ';

    if(CGL.profileNonTypedAttrib>0)warn+='Not-Typed Buffer Attrib! '+CGL.profileNonTypedAttribNames;
    
    //     CGL.profileNonTypedAttrib=0;
    // CGL.profileNonTypedAttribNames="";

    // if(warn && warn.length>0)console.warn(warn);
    
    if(warn.length>0)
    {
        warn='| <span style="color:#f80;">WARNING: '+warn+'<span>';
    }

    element.innerHTML=fps+" fps | "+Math.round(childsTime*100)/100+"ms "+warn;
    if(op.patch.loading.getProgress()!=1.0)
    {
        element.innerHTML+="<br/>loading "+Math.round(op.patch.loading.getProgress()*100)+'% '+loadingChars[ (++loadingCounter)%loadingChars.length ];
    }
    
    if(opened)
    {
        var count=0;
        avgMs=0;
        avgMsChilds=0;
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

        element.innerHTML+='<br/> '+cgl.canvasWidth+' x '+cgl.canvasHeight+' (x'+cgl.pixelDensity+') ';
        element.innerHTML+='<br/>frame avg: '+Math.round(avgMsChilds*100)/100+' ms ('+Math.round(avgMsChilds/avgMs*100)+'%) / '+Math.round(avgMs*100)/100+' ms';
        element.innerHTML+=' (self: '+Math.round((selfTime)*100)/100+' ms) ';
        
        element.innerHTML+='<br/>shader binds: '+Math.ceil(CGL.profileShaderBinds/fps)+
            ' uniforms: '+Math.ceil(CGL.profileUniformCount/fps)+
            ' mvp_uni_mat4: '+Math.ceil(CGL.profileMVPMatrixCount/fps)+
                

            ' mesh.setGeom: '+CGL.profileMeshSetGeom+
            ' videos: '+CGL.profileVideosPlaying;
        
    }


    CGL.profileUniformCount=0;
    CGL.profileShaderGetUniform=0;
    CGL.profileShaderCompiles=0;
    CGL.profileShaderBinds=0;
    CGL.profileTextureResize=0;
    CGL.profileFrameBuffercreate=0;
    CGL.profileEffectBuffercreate=0;
    CGL.profileTextureDelete=0;
    CGL.profileMeshSetGeom=0;
    CGL.profileVideosPlaying=0;
    CGL.profileMVPMatrixCount=0;

    CGL.profileNonTypedAttrib=0;
    CGL.profileNonTypedAttribNames="";

}


exe.onTriggered=function()
{
    var selfTimeStart=performance.now();
    frameCount++;

    if(fpsStartTime===0)fpsStartTime=Date.now();
    if(Date.now()-fpsStartTime>=1000)
    {
        fps=frameCount;
        frameCount=0;
        frames=0;
        outFPS.set(fps);
        updateText();
        
        fpsStartTime=Date.now();
    }
   
    if(opened)
    {
        var timeUsed=performance.now()-lastTime;
        // if(timeUsed>30)console.log("peak ",performance.now()-lastTime);
        queue.push(timeUsed);
        queue.shift();
    
        queueChilds.push(childsTime);
        queueChilds.shift();

        updateCanvas();
    }
    
    lastTime=performance.now();
    selfTime=performance.now()-selfTimeStart;
    var startTimeChilds=performance.now();

    next.trigger();

    childsTime=performance.now()-startTimeChilds;
    
};


op.onDelete=function()
{
  if(canvas)canvas.remove();
  if(element)element.remove();
};