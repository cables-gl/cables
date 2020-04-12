const
    exe=op.inTrigger("exe"),
    inShow=op.inValueBool("Visible",true),
    next=op.outTrigger("childs"),
    position=op.inSwitch("Position",['top','bottom'],'top'),
    openDefault=op.inBool("Open",false),
    smoothGraph=op.inBool("Smooth Graph",true),
    inScaleGraph=op.inFloat("Scale",4),
    inSizeGraph=op.inFloat("Size",128),
    outFPS=op.outValue("FPS");

// var exe=this.addInPort(new CABLES.Port(this,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
// var next=this.addOutPort(new CABLES.Port(this,"childs",CABLES.OP_PORT_TYPE_FUNCTION)) ;

const cgl=op.patch.cgl;
var element = document.createElement('div');
var elementMeasures=null;
var ctx=null;
var opened=false;
var frameCount=0;
var fps=0;
var fpsStartTime=0;
var childsTime=0;
var avgMsChilds=0;
var queue=[];
var timesMainloop=[];
var timesOnFrame=[];
var timesGPU=[];
var avgMs=0;
var selfTime=0;
var canvas=null;
var lastTime=0;
var loadingCounter=0;
var loadingChars=['|','/','-','\\'];

const colorBg="#222222";
const colorRAF="#003f5c";
const colorRAFSlow="#ffffff";
const colorMainloop="#7a5195";
const colorOnFrame="#ef5675";
const colorGPU="#ffa600";

// color: https://learnui.design/tools/data-color-picker.html
var startedQuery=false;

var currentTimeGPU=0;
var currentTimeMainloop=0;
var currentTimeOnFrame=0;


const gl=op.patch.cgl.gl;
const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
var query=null;


inSizeGraph.onChange=updateSize;
exe.onLinkChanged =
    inShow.onChange = updateVisibility;
position.onChange= updatePos;


element.id="performance";
element.style.position="absolute";
element.style.left="0px";
element.style.opacity="0.8";
element.style.padding="10px";
element.style.cursor="pointer";
element.style.background="#222";
element.style.color="white";
element.style["font-family"]="monospace";
element.style["font-size"]="12px";
element.style["z-index"]="99999";


element.innerHTML="&nbsp;";

var container = op.patch.cgl.canvas.parentElement;
container.appendChild(element);

element.addEventListener("click", toggleOpened);

updateSize();
updateOpened();
updatePos();
op.onDelete=function()
{
    if(canvas)canvas.remove();
    if(element)element.remove();
};


function updatePos()
{
    if(position.get()=="top")
    {
        canvas.style.top=element.style.top="0px";
        canvas.style.bottom=element.style.bottom="initial";
    }
    else
    {
        canvas.style.bottom=element.style.bottom="0px";
        canvas.style.top=element.style.top="initial";
    }
}

function updateVisibility()
{
    if(!inShow.get() || !exe.isLinked())
    {
        element.style.display='none';
        element.style.opacity=0;
        canvas.style.display='none';
    }
    else
    {
        element.style.display='block';
        element.style.opacity=1;
        canvas.style.display='block';
    }
}

function updateSize()
{
    if(!canvas)return;

    var num=Math.max(0,parseInt(inSizeGraph.get()));


    canvas.width  = num;
    canvas.height = num;
    element.style.left=num+"px";

    queue.length=0;
    timesMainloop.length=0;
    timesOnFrame.length=0;
    timesGPU.length=0;

    for(var i=0;i<num;i++)
    {
        queue[i]=-1;
        timesMainloop[i]=-1;
        timesOnFrame[i]=-1;
        timesGPU[i]=-1;
    }

}

openDefault.onChange=function()
{
    opened=openDefault.get();
    updateOpened();
};


function toggleOpened()
{
    if(!inShow.get())return;
    element.style.opacity=1;
    opened=!opened;
    updateOpened();
}

function updateOpened()
{
    updateText();
    if(!canvas)createCanvas();
    if(opened)
    {
        canvas.style.display="block";
        element.style.left=inSizeGraph.get()+"px";
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
    var height=canvas.height;
    var hmul=inScaleGraph.get();

    ctx.fillStyle=colorBg;
    ctx.fillRect(0,0,canvas.width,height);
    ctx.fillStyle=colorRAF;

    var k=0;
    const numBars=Math.max(0,parseInt(inSizeGraph.get()));

    for(k=numBars;k>=0;k--)
    {
        if(queue[k]>30)ctx.fillStyle=colorRAFSlow;
        ctx.fillRect(numBars-k,height-queue[k]*hmul,1,queue[k]*hmul);
        if(queue[k]>30)ctx.fillStyle=colorRAF;
    }

    // ctx.fillStyle="#aaaaaa";
    for(k=numBars;k>=0;k--)
    {
        var sum=0;
        ctx.fillStyle=colorMainloop;
        sum=timesMainloop[k];
        ctx.fillRect(numBars-k,height-sum*hmul,1,timesMainloop[k]*hmul);

        ctx.fillStyle=colorOnFrame;
        sum+=timesOnFrame[k];
        ctx.fillRect(numBars-k,height-sum*hmul,1,timesOnFrame[k]*hmul);

        ctx.fillStyle=colorGPU;
        sum+=timesGPU[k];
        ctx.fillRect(numBars-k,height-sum*hmul,1,timesGPU[k]*hmul);
    }


}

function createCanvas()
{
    canvas = document.createElement('canvas');
    canvas.id     = "performance_"+op.patch.config.glCanvasId;
    canvas.width  = inSizeGraph.get();
    canvas.height = inSizeGraph.get();
    canvas.style.display   = "block";
    canvas.style.opacity   = 0.9;
    canvas.style.position  = "absolute";
    canvas.style.left  = "0px";
    canvas.style.cursor  = "pointer";
    canvas.style.top  = "-64px";
    canvas.style['z-index']   = "99998";
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');

    canvas.addEventListener("click", toggleOpened);

    updateSize();

}

function updateText()
{
    if(!inShow.get())return;
    var warn="";
    if(CGL.profileData.profileShaderCompiles>0)warn+='Shader compile ('+CGL.profileData.profileShaderCompileName+') ';
    if(CGL.profileData.profileShaderGetUniform>0)warn+='Shader get uni loc! ('+CGL.profileData.profileShaderGetUniformName+')';
    if(CGL.profileData.profileTextureResize>0)warn+='Texture resize! ';
    if(CGL.profileData.profileFrameBuffercreate>0)warn+='Framebuffer create! ';
    if(CGL.profileData.profileEffectBuffercreate>0)warn+='Effectbuffer create! ';
    if(CGL.profileData.profileTextureDelete>0)warn+='Texture delete! ';
    if(CGL.profileData.profileNonTypedAttrib>0)warn+='Not-Typed Buffer Attrib! '+CGL.profileData.profileNonTypedAttribNames;
    if(CGL.profileData.profileTextureNew>0)warn+='new texture created! ';
    if(CGL.profileData.profileGenMipMap>0)warn+='generating mip maps!';

    if(warn.length>0)
    {
        warn='| <span style="color:#f80;">WARNING: '+warn+'<span>';
    }

    var html='';

    if(opened)
    {
        html+='<span style="color:'+colorRAF+'">■</span> '+fps+" fps ";
        html+='<span style="color:'+colorMainloop+'">■</span> '+Math.round(currentTimeMainloop*100)/100+'ms mainloop ';
        html+='<span style="color:'+colorOnFrame+'">■</span> '+Math.round(currentTimeOnFrame*100)/100+"ms onframe ";
        if(ext) html+='<span style="color:'+colorGPU+'">■</span> '+Math.round(currentTimeGPU*100)/100+"ms GPU";
        html+=warn;
        element.innerHTML=html;
    }
    else
    {
        html+=fps+" fps / ";
        html+='CPU: '+Math.round((currentTimeMainloop+CGL.profileData.profileOnAnimFrameOps-CGL.profileData.profileMainloopMs)*100)/100+'ms / ';
        if(ext && currentTimeGPU)html+='GPU: '+Math.round(currentTimeGPU*100)/100+'ms  ';
        element.innerHTML=html;
    }

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

            if(timesMainloop[i]>-1)
            {
                avgMsChilds+=timesMainloop[i];
            }
        }

        avgMs/=count;
        avgMsChilds/=count;

        element.innerHTML+='<br/> '+cgl.canvasWidth+' x '+cgl.canvasHeight+' (x'+cgl.pixelDensity+') ';
        element.innerHTML+='<br/>frame avg: '+Math.round(avgMsChilds*100)/100+' ms ('+Math.round(avgMsChilds/avgMs*100)+'%) / '+Math.round(avgMs*100)/100+' ms';
        element.innerHTML+=' (self: '+Math.round((selfTime)*100)/100+' ms) ';

        element.innerHTML+='<br/>shader binds: '+Math.ceil(CGL.profileData.profileShaderBinds/fps)+
            ' uniforms: '+Math.ceil(CGL.profileData.profileUniformCount/fps)+
            ' mvp_uni_mat4: '+Math.ceil(CGL.profileData.profileMVPMatrixCount/fps)+
            ' mesh.setGeom: '+CGL.profileData.profileMeshSetGeom+
            ' videos: '+CGL.profileData.profileVideosPlaying;


        element.innerHTML+=
        ' draw meshes: '+Math.ceil(CGL.profileData.profileMeshDraw/fps)+
        ' framebuffer blit: '+Math.ceil(CGL.profileData.profileFramebuffer/fps)+
        ' texeffect blit: '+Math.ceil(CGL.profileData.profileTextureEffect/fps);


        // var vars= CABLES.patch.getVars();

        // element.innerHTML+='<br/><br/>vars:<br/>';

        // for(var ki in vars)
        // {
        //     var v=parseFloat(vars[ki].getValue());
        //     if(isNaN(v)) v="[...]"
        //     element.innerHTML+=' - '+ki+': <b>'+v+'</b><br/>';
        // }
    }


    CGL.profileData.profileUniformCount=0;
    CGL.profileData.profileShaderGetUniform=0;
    CGL.profileData.profileShaderCompiles=0;
    CGL.profileData.profileShaderBinds=0;
    CGL.profileData.profileTextureResize=0;
    CGL.profileData.profileFrameBuffercreate=0;
    CGL.profileData.profileEffectBuffercreate=0;
    CGL.profileData.profileTextureDelete=0;
    CGL.profileData.profileMeshSetGeom=0;
    CGL.profileData.profileVideosPlaying=0;
    CGL.profileData.profileMVPMatrixCount=0;
    CGL.profileData.profileNonTypedAttrib=0;
    CGL.profileData.profileNonTypedAttribNames="";
    CGL.profileData.profileTextureNew=0;
    CGL.profileData.profileGenMipMap=0;
    CGL.profileData.profileFramebuffer=0
    CGL.profileData.profileMeshDraw=0;
    CGL.profileData.profileTextureEffect=0;


}


function styleMeasureEle(ele)
{
    ele.style.padding="0px";
    ele.style.margin="0px";
}

function addMeasureChild(m,parentEle,timeSum,level)
{
    const height=20;
    m.usedAvg=(m.usedAvg||m.used);

    if(!m.ele || initMeasures)
    {
        var newEle = document.createElement('div');
        m.ele=newEle;

        if(m.childs && m.childs.length>0) newEle.style.height='500px';
            else  newEle.style.height=height+'px';

        newEle.style.overflow='hidden';
        newEle.style.display='inline-block';

        if(!m.isRoot)
        {
            newEle.innerHTML='<div style="min-height:'+height+'px;width:100%;overflow:hidden;color:black;position:relative">&nbsp;'+m.name+'</div>';
            newEle.style['background-color']="rgb("+m.colR+","+m.colG+","+m.colB+")";
            newEle.style['border-left']='1px solid black';
        }

        parentEle.appendChild(newEle);
    }


    if(!m.isRoot)
    {
        if(performance.now()-m.lastTime>200)
        {
            m.ele.style.display="none";
            m.hidden=true;
        }
        else
        {
            if(m.hidden)
            {
                m.ele.style.display="inline-block";
                m.hidden=false;
            }
        }

        m.ele.style.float='left';
        m.ele.style.width=Math.floor((m.usedAvg/timeSum)*98.)+'%';
    }
    else
    {
        m.ele.style.width='100%';
        m.ele.style.clear='both';
        m.ele.style.float='none';
    }

    if(m && m.childs && m.childs.length>0)
    {
        var thisTimeSum=0;
        for(var i=0;i<m.childs.length;i++)
        {
            m.childs[i].usedAvg=(m.childs[i].usedAvg||m.childs[i].used)*0.95+m.childs[i].used*0.05;
            thisTimeSum+=m.childs[i].usedAvg;
        }
        for(var i=0;i<m.childs.length;i++)
        {
            addMeasureChild(m.childs[i],m.ele,thisTimeSum,level+1);
        }
    }

}

var initMeasures=true;

function clearMeasures(p)
{
    for(var i=0;i<p.childs.length;i++)
    {
        clearMeasures(p.childs[i]);
    }

    p.childs.length=0;

}

function measures()
{
    if(!CGL.performanceMeasures)return;

    if(!elementMeasures)
    {
        op.log("create measure ele");
        elementMeasures = document.createElement('div');
        elementMeasures.style.width="100%";
        elementMeasures.style['background-color']="#444";
        elementMeasures.style.bottom="10px";
        elementMeasures.style.height="100px";
        elementMeasures.style.opacity="1";
        elementMeasures.style.position="absolute";

        elementMeasures.style['z-index']="99999";
        elementMeasures.innerHTML='';
        container.appendChild(elementMeasures);
    }

    var timeSum=0;

    var root=CGL.performanceMeasures[0];

    for(var i=0;i<root.childs.length;i++)
    {
        timeSum+=root.childs[i].used;
    }

    addMeasureChild(CGL.performanceMeasures[0],elementMeasures,timeSum,0);

    root.childs.length=0;

    clearMeasures(CGL.performanceMeasures[0]);

    CGL.performanceMeasures.length=0;
    initMeasures=false;
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
        if(inShow.get())updateText();

        fpsStartTime=Date.now();
    }

    if(inShow.get())
    {
        measures();

        if(opened && !CGL.profileData.pause)
        {
            var timeUsed=performance.now()-lastTime;
            // if(timeUsed>30)op.log("peak ",performance.now()-lastTime);
            queue.push(timeUsed);
            queue.shift();

            timesMainloop.push(childsTime);
            timesMainloop.shift();

            timesOnFrame.push(CGL.profileData.profileOnAnimFrameOps-CGL.profileData.profileMainloopMs);
            timesOnFrame.shift();

            timesGPU.push(currentTimeGPU);
            timesGPU.shift();

            updateCanvas();
        }
    }

    lastTime=performance.now();
    selfTime=performance.now()-selfTimeStart;
    var startTimeChilds=performance.now();


    startGlQuery();

    next.trigger();

    endGlQuery();


    var nChildsTime=performance.now()-startTimeChilds;
    var nCurrentTimeMainloop=CGL.profileData.profileMainloopMs;
    var nCurrentTimeOnFrame=CGL.profileData.profileOnAnimFrameOps-currentTimeMainloop;

    if(smoothGraph.get())
    {
        childsTime=childsTime*0.9+nChildsTime*0.1;
        currentTimeMainloop=currentTimeMainloop*0.9+nCurrentTimeMainloop*0.1;
        currentTimeOnFrame=currentTimeOnFrame*0.9+nCurrentTimeOnFrame*0.1;

    }
    else
    {
        childsTime=nChildsTime;
        currentTimeMainloop=nCurrentTimeMainloop;
        currentTimeOnFrame=nCurrentTimeOnFrame;

    }

};

function startGlQuery()
{
    if(!ext)return;
    if(!query)
    {
        query = gl.createQuery();
        gl.beginQuery(ext.TIME_ELAPSED_EXT, query);
        startedQuery=true;
    }
}

function endGlQuery()
{
    if(!ext)return;
    if(query && startedQuery)
    {
        gl.endQuery(ext.TIME_ELAPSED_EXT);
        startedQuery=false;
    }

    if(query)
    {
        const available = gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE);
        if (available)
        {
            const elapsedNanos = gl.getQueryParameter(query, gl.QUERY_RESULT);
            currentTimeGPU=elapsedNanos/1000000;
            query=null;
        }

    }


}
