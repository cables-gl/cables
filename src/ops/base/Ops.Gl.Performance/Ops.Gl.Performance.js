const
    exe=op.inTrigger("exe"),
    inShow=op.inValueBool("Visible",true),
    next=op.outTrigger("childs"),
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
var queueChilds=[];
var numBars=128;
var avgMs=0;
var selfTime=0;
var canvas=null;
var lastTime=0;
var loadingCounter=0;
var loadingChars=['|','/','-','\\'];

exe.onLinkChanged =
    inShow.onChange = updateVisibility;


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
element.style["font-size"]="12px";
element.style["z-index"]="99999";
element.innerHTML="&nbsp;";

var container = op.patch.cgl.canvas.parentElement;
container.appendChild(element);

element.addEventListener("click", toggleOpened);


op.onDelete=function()
{
    if(canvas)canvas.remove();
    if(element)element.remove();
};


function updateVisibility()
{
    if(!inShow.get() || !exe.isLinked())
    {
        element.style.display='none';
        element.style.opacity=0;
    }
    else
    {
        element.style.display='block';
        element.style.opacity=1;
    }
}

function toggleOpened()
{
    if(!inShow.get())return;
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
    canvas.style['z-index']   = "99998";
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');

    canvas.addEventListener("click", toggleOpened);

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


    var html=fps+" fps / ";
    html+=Math.round(childsTime*100)/100+"ms mainloop / ";
    html+=Math.round(CGL.profileData.profileOnAnimFrameOps*100)/100+"ms onframe";
    html+=warn;
    element.innerHTML=html;

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

        element.innerHTML+='<br/>shader binds: '+Math.ceil(CGL.profileData.profileShaderBinds/fps)+
            ' uniforms: '+Math.ceil(CGL.profileData.profileUniformCount/fps)+
            ' mvp_uni_mat4: '+Math.ceil(CGL.profileData.profileMVPMatrixCount/fps)+
            ' mesh.setGeom: '+CGL.profileData.profileMeshSetGeom+
            ' videos: '+CGL.profileData.profileVideosPlaying;


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

        if(opened)
        {
            var timeUsed=performance.now()-lastTime;
            // if(timeUsed>30)op.log("peak ",performance.now()-lastTime);
            queue.push(timeUsed);
            queue.shift();

            queueChilds.push(childsTime);
            queueChilds.shift();

            updateCanvas();
        }
    }

    lastTime=performance.now();
    selfTime=performance.now()-selfTimeStart;
    var startTimeChilds=performance.now();

    next.trigger();

    childsTime=performance.now()-startTimeChilds;

};


