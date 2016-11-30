op.name="HoverPoint";

var exec=op.addInPort(new Port(op,"Execute",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"Trigger",OP_PORT_TYPE_FUNCTION));

var show=op.inValueBool("show");
var index=op.inValue("index");
var title=op.inValueString("Title");

var cgl=op.patch.cgl;
var trans=vec3.create();
var m=mat4.create();

var elements=[];
var elementOver=null;

var pointSize=10;
var currentIndex=0;

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
    if(elementOver)
    {
        elementOver.innerHTML=elements[index].title;
        elementOver.style.top=elements[index].y-25+'px';
        elementOver.style.left=elements[index].x+'px';
        elementOver.style.opacity=1;
    }
}

function onMouseLeave(e)
{
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
    
    elements[currentIndex].style.width=pointSize+"px";
    elements[currentIndex].style.height=pointSize+"px";
    elements[currentIndex].style['border-radius']=2*pointSize+"px";
    elements[currentIndex].style.border="2px solid black";
    elements[currentIndex].style["z-index"]="99999";
    elements[currentIndex].style['background-color']="white";
    elements[currentIndex].style.transition="opacity 0.8s ease "+Math.random()*0.2+"s";
    elements[currentIndex].style.opacity=0;
    elements[currentIndex].index=currentIndex;
    
    elements[currentIndex].style.opacity="0.5";

    if(!elementOver)
    {
        elementOver = document.createElement('div');
        elementOver.id="elementOver";
        elementOver.style.position="absolute";
        elementOver.style.display="block";
        elementOver.style.opacity="0";
        elementOver.style.height="20px";
        elementOver.style.overflow="hidden";
        elementOver.style['font-family']="NB,Arial";
        elementOver.style["z-index"]="199999";
        elementOver.style.color="white";
        elementOver.style["text-shadow"]="1px 1px 2px black,1px -1px 2px black,-1px 1px 2px black,-1px -1px 2px black";

        textContent = document.createTextNode('');
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
};

exec.onTriggered=function()
{
    if(!elements[currentIndex])init();

    var pos=[0,0,0];
    mat4.multiply(m,cgl.vMatrix,cgl.mvMatrix);
    vec3.transformMat4(pos, [0,0,0], m);

    vec3.transformMat4(trans, pos, cgl.pMatrix);

    x=( cgl.getViewPort()[2]-( cgl.getViewPort()[2]  * 0.5 - trans[0] * cgl.getViewPort()[2] * 0.5 / trans[2] ))-pointSize;
    y=cgl.getViewPort()[3]-( cgl.getViewPort()[3]  * 0.5 + trans[1] * cgl.getViewPort()[3] * 0.5 / trans[2] )-pointSize/2;


    if(elements[currentIndex] && elements[currentIndex].y!=y && elements[currentIndex].x!=x)
    {
        elements[currentIndex].title=title.get();
        elements[currentIndex].style.top=y+'px';
        elements[currentIndex].style.left=x+'px';
        elements[currentIndex].y=y;
        elements[currentIndex].x=x;
    }

    trigger.trigger();
};
