op.name="HoverPoint";

var exec=op.addInPort(new Port(op,"Execute",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"Trigger",OP_PORT_TYPE_FUNCTION));

var pPointSize=op.inValue("Size Point",10);

// var show=op.inValueBool("show");
var show=op.inValueBool("show",true);
var index=op.inValue("index");
var title=op.inValueString("Title");


var outHovering=op.outValue("Hovering",false);
var outHoverIndex=op.outValue("Hover Index",-1);

var cgl=op.patch.cgl;
var trans=vec3.create();
var m=mat4.create();

var elements=[];
var elementOver=null;
var textContent=false;

var pointSize=10;
var currentIndex=0;
var pos=[0,0,0];

pPointSize.onChange=function()
{
    pointSize=pPointSize.get();
    for(i=0;i<elements.length;i++) 
    {
        elements[i].style.width=pointSize+"px";
        elements[i].style.height=pointSize+"px";
        elements[i].style['border-radius']=2*pointSize+"px";
    }

};

show.onChange=function()
{
    var i=0;

    if(show.get())
    {
        for(i=0;i<elements.length;i++) 
        {
            if(elements[i])
            {
                elements[i].style.opacity=0.6;
                elements[i].style["pointer-events"]="all";
            }
        }
    }
    else
    {
        for(i=0;i<elements.length;i++) 
        {
            if(elements[i])
            {
                elements[i].style.opacity=0;
                elements[i].style["pointer-events"]="none";
            }
        }
    }
};

index.onChange=function()
{
    currentIndex=Math.round(index.get());
    if(currentIndex>elements.length)
    {
        elements.length=currentIndex+1;
    }
};

var textContent=null;

function onMouseEnter(e)
{
    var index=e.currentTarget.index;
    
    outHovering.set(true);
    outHoverIndex.set(index);
    
    if(elementOver)
    {
        elementOver.innerHTML=elements[index].title;
        elementOver.style.top=elements[index].y+pointSize/2+'px';
        elementOver.style.left=elements[index].x=(x+pointSize+15)+'px';
        elementOver.style.opacity=1;
    }
}

function onMouseLeave(e)
{
    outHovering.set(false);
    
    var index=e.currentTarget.index;
    if(elementOver) elementOver.style.opacity=0;
    if(elementOver) elementOver.style["pointer-events"]="none";
}


function init()
{
    //  document.getElementById("cablescanvas") || document.body; 
    var canvas = op.patch.cgl.canvas.parentElement;
    
    elements[currentIndex] = document.createElement('div');
    elements[currentIndex].style.position="absolute";
    
    // elements[currentIndex].style.display="block";
    elements[currentIndex].classList.add("hoverpoint");
    
    elements[currentIndex].style.width=pointSize+"px";
    elements[currentIndex].style.height=pointSize+"px";
    elements[currentIndex].style['border-radius']=2*pointSize+"px";
    elements[currentIndex].style.border="1px solid black";
    elements[currentIndex].style["z-index"]="99999";
    elements[currentIndex].style['background-color']="white";
    elements[currentIndex].style.transition="opacity 0.3s ease "+Math.random()*0.2+"s";
    elements[currentIndex].style.opacity=0;
    elements[currentIndex].index=currentIndex;
    
    elements[currentIndex].style.opacity="0.5";

    if(!elementOver)
    {
        elementOver = document.createElement('div');
        elementOver.id="elementOver";
        elementOver.style.position="absolute";
        elementOver.style.display="inline-block";
        elementOver.style.opacity="0";
        elementOver.style.padding="7px";
        elementOver.style.transform="translateY(-50%)";
        elementOver.style['padding-left']="10px";
        elementOver.style['padding-right']="10px";
        elementOver.style.overflow="hidden";
        elementOver.style['font-family']="NB,Arial";
        elementOver.style["z-index"]="99999999";
        elementOver.style.transition="opacity 0.3s ease "+Math.random()*0.2+"s";
        elementOver.style.color="white";
        elementOver.style['background-color']="rgba(0,0,0,0.7)";

        textContent = document.createTextNode('cdscdscds');
        elementOver.appendChild(textContent);

        canvas.appendChild(elementOver);
    }

    elements[currentIndex].addEventListener('mouseleave', onMouseLeave);
    elements[currentIndex].addEventListener('mouseenter', onMouseEnter);

    canvas.appendChild(elements[currentIndex]);
}

op.onDelete=function()
{
    if(elementOver)elementOver.remove();
    
    for(var i=0;i<elements.length;i++)
    {
        if(elements[i])elements[i].remove();
        if(elementOver)elementOver.remove();
    }
}







var x=0;
var y=0;
function getScreenCoord()
{
    mat4.multiply(m,cgl.vMatrix,cgl.mvMatrix);
    vec3.transformMat4(pos, [0,0,0], m);
    
    vec3.transformMat4(trans, pos, cgl.pMatrix);

    var vp=cgl.getViewPort();
    
    x=( vp[2]-( vp[2]  * 0.5 - trans[0] * vp[2] * 0.5 / trans[2] ));
    y=( vp[3]-( vp[3]  * 0.5 + trans[1] * vp[3] * 0.5 / trans[2] ));

}


exec.onTriggered=function()
{
    if(!elements[currentIndex])init();

    getScreenCoord();
    
    //     var screenPos=[0,0,0];
    //     vec3.transformMat4(screenPos, screenPos, cgl.mvMatrix);
        
    //     screenPos=vec3.transformMat4(screenPos, screenPos, cgl.vMatrix);
    //     screenPos=vec3.transformMat4(screenPos, screenPos, cgl.pMatrix);

    // // screenPos[2]-=0.2;
    //     screenPos[0] /= screenPos[2];
    //     screenPos[1] /= screenPos[2];
    //     screenPos[0] = (screenPos[0] + 1) * cgl.getViewPort()[2] / 2;
    //     screenPos[1] = (screenPos[1] + 1) * cgl.getViewPort()[3] / 2;
    
    //     // var x=screenPos[0]-pointSize/2;
    //     var x=screenPos[0]-pointSize/2;
    //     var y=cgl.getViewPort()[3]-screenPos[1] -pointSize/2;
    
    x-=pointSize/2;
    y-=pointSize/2;

    // var pos=[0,0,0];
    // mat4.multiply(m,cgl.vMatrix,cgl.mvMatrix);
    // vec3.transformMat4(pos, [0,0,0], m);

    // vec3.transformMat4(trans, pos, cgl.pMatrix);

    // x=( cgl.getViewPort()[2]-( cgl.getViewPort()[2]  * 0.5 - trans[0] * cgl.getViewPort()[2] * 0.5 / trans[2] ))-pointSize/2;
    // y=cgl.getViewPort()[3]-( cgl.getViewPort()[3]  * 0.5 + trans[1] * cgl.getViewPort()[3] * 0.5 / trans[2] )-pointSize/2;

    // var rect = op.patch.cgl.canvas.getBoundingClientRect();
    var offsetTop = op.patch.cgl.canvas.offsetTop;

    if(elements[currentIndex] && (elements[currentIndex].y!=y || elements[currentIndex].x!=x))
    {
        elements[currentIndex].title=title.get();
        elements[currentIndex].style.top=offsetTop+y+'px';
        elements[currentIndex].style.left=x+'px';
        elements[currentIndex].y=y;
        elements[currentIndex].x=x;
    }

    trigger.trigger();
};
