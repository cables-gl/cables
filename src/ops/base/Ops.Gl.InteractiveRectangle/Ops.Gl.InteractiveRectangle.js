
var render=op.inTrigger("render");
var trigger=op.outTrigger('trigger');

var width=op.inValue("width",1);
var height=op.inValue("height",1);

var inId=op.inValueString("id");
var classPort = op.inValueString("Class");

var pivotX=op.inValueSelect("pivot x",["center","left","right"]);
var pivotY=op.inValueSelect("pivot y",["center","top","bottom"]);

var axis=op.inValueSelect("axis",["xy","xz"]);

var isInteractive=op.inValueBool('Is Interactive',true);
var active=op.inValueBool('Render',true);
var divVisible=op.inValueBool('Show Boundings',true);

var cursorPort=op.inValueSelect("Cursor",["auto","crosshair","pointer","Hand","move","n-resize","ne-resize","e-resize","se-resize","s-resize","sw-resize","w-resize","nw-resize","text","wait","help", "none"],"pointer");

var geomOut=op.outObject("geometry");
geomOut.ignoreValueSerialize=true;

var mouseOver=op.outValue("Pointer Hover",false);
var mouseDown=op.outValue("Pointer Down",false);
var outX=op.outValue("Pointer X");
var outY=op.outValue("Pointer Y");

var outTop=op.outValue("Top");
var outLeft=op.outValue("Left");
var outRight=op.outValue("Right");
var outBottom=op.outValue("Bottom");

var mouseClick=op.outTrigger("Left Click");

var elementPort = op.outObject('Dom Element');

var cgl=op.patch.cgl;
axis.set('xy');
pivotX.set('center');
pivotY.set('center');

var geom=new CGL.Geometry();
var mesh=null;
var div=null;
var m=mat4.create();
var trans=mat4.create();
var pos=vec3.create();
var divAlign=vec3.create();
var divAlignSize=vec3.create();

axis.onChange=rebuild;
pivotX.onChange=rebuild;
pivotY.onChange=rebuild;
width.onChange=rebuild;
height.onChange=rebuild;
cursorPort.onChange=updateCursor;
rebuild();


var modelMatrix=mat4.create();
var identViewMatrix=mat4.create();
var zeroVec3=vec3.create();

render.onTriggered=function()
{
    if(!div)
    {
        setUpDiv();
        addListeners();
        updateDivVisibility();
        updateIsInteractive();
    }
    updateDivSize();

    if(active.get() && mesh) mesh.render(cgl.getShader());

    trigger.trigger();
};

function rebuild()
{
    var w=width.get();
    var h=height.get();
    var x=0;
    var y=0;

    if(typeof w=='string')w=parseFloat(w);
    if(typeof h=='string')h=parseFloat(h);

    if(pivotX.get()=='center')
    {
        x=0;
        divAlign[0]=-w/2;
    }
    if(pivotX.get()=='right')
    {
        x=-w/2;
    }
    if(pivotX.get()=='left')
    {
        x=w/2;
    }

    if(pivotY.get()=='center')
    {
        y=0;
        divAlign[1]=-h/2;
    }
    if(pivotY.get()=='top') y=-h/2;
    if(pivotY.get()=='bottom') y=+h/2;

    var verts=[];
    var tc=[];
    var norms=[];
    var indices=[];

    var numRows=1;
    var numColumns=1;

    var stepColumn=w/numColumns;
    var stepRow=h/numRows;

    var c,r;

    for(r=0;r<=numRows;r++)
    {
        for(c=0;c<=numColumns;c++)
        {
            verts.push( c*stepColumn - width.get()/2+x );
            if(axis.get()=='xz') verts.push( 0.0 );
            verts.push( r*stepRow - height.get()/2+y );
            if(axis.get()=='xy') verts.push( 0.0 );

            tc.push( c/numColumns );
            tc.push( 1.0-r/numRows );

            if(axis.get()=='xz')
            {
                norms.push(0);
                norms.push(1);
                norms.push(0);
            }

            if(axis.get()=='xy')
            {
                norms.push(0);
                norms.push(0);
                norms.push(-1);
            }
        }
    }

    for(c=0;c<numColumns;c++)
    {
        for(r=0;r<numRows;r++)
        {
            var ind = c+(numColumns+1)*r;
            var v1=ind;
            var v2=ind+1;
            var v3=ind+numColumns+1;
            var v4=ind+1+numColumns+1;

            indices.push(v1);
            indices.push(v3);
            indices.push(v2);

            indices.push(v2);
            indices.push(v3);
            indices.push(v4);
        }
    }

    geom.clear();
    geom.vertices=verts;
    geom.texCoords=tc;
    geom.verticesIndices=indices;
    geom.vertexNormals=norms;

    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
        else mesh.setGeom(geom);

    geomOut.set(null);
    geomOut.set(geom);

}

var divX=0;
var divY=0;
var divWidth=0;
var divHeight=0;

var mMatrix=mat4.create();
divVisible.onChange=updateDivVisibility;
inId.onChange=updateId;
classPort.onChange = updateClassNames;

function updateDivVisibility()
{
    if(div)
    {
        if(divVisible.get()) div.style.border='1px solid red';
        else div.style.border='none';
    }
}

function updateCursor()
{
    if(div)
    {
        div.style.cursor = cursorPort.get();
    }
}

function updateId()
{
    if(div)
    {
        div.setAttribute('id',inId.get());

    }
}

function updateDivSize()
{
    var vp=cgl.getViewPort();


    mat4.multiply(mMatrix,cgl.vMatrix,cgl.mMatrix);
    vec3.transformMat4(pos, divAlign, mMatrix);
    vec3.transformMat4(trans, pos, cgl.pMatrix);



    var x1 = (trans[0] * vp[2]/2) + vp[2]/2;
    var y1 = (trans[1] * vp[3]/2) + vp[3]/2;


    divAlignSize[0] = divAlign[0] + width.get();
    divAlignSize[1] = divAlign[1];

    vec3.transformMat4(pos, divAlignSize, mMatrix);
    vec3.transformMat4(trans, pos, cgl.pMatrix);

    var x2 = ((trans[0] * vp[2]/2) + vp[2]/2);
    var y2= ((trans[1] * vp[3]/2) + vp[3]/2);




    divAlignSize[0] = divAlign[0];
    divAlignSize[1] = divAlign[1] + height.get();

    vec3.transformMat4(pos, divAlignSize, mMatrix);
    vec3.transformMat4(trans, pos, cgl.pMatrix);

    var x3 = ((trans[0] * vp[2]/2) + vp[2]/2);
    var y3= ((trans[1] * vp[3]/2) + vp[3]/2);




    divAlignSize[0] = divAlign[0] + width.get();
    divAlignSize[1] = divAlign[1] + height.get();

    vec3.transformMat4(pos, divAlignSize, mMatrix);
    vec3.transformMat4(trans, pos, cgl.pMatrix);

    var x4 = ((trans[0] * vp[2]/2) + vp[2]/2);
    var y4 = ((trans[1] * vp[3]/2) + vp[3]/2);


    divX=Math.min(x1,x2,x3,x4);
    divY=Math.min(vp[3]-y1,vp[3]-y2,vp[3]-y3,vp[3]-y4);

    var xb=Math.max(x1,x2,x3,x4);
    var yb=Math.max(vp[3]-y1,vp[3]-y2,vp[3]-y3,vp[3]-y4);

    outTop.set(divY);
    outLeft.set(divX);
    outRight.set(xb);
    outBottom.set(yb);

    divWidth=Math.abs(xb-divX);
    divHeight=Math.abs(yb-divY);


    divX/=op.patch.cgl.pixelDensity;
    divY/=op.patch.cgl.pixelDensity;
    divWidth/=op.patch.cgl.pixelDensity;
    divHeight/=op.patch.cgl.pixelDensity;

    div.style.left=divX+'px';
    div.style.top=divY+'px';
    div.style.width=divWidth+'px';
    div.style.height=divHeight+'px';
}

function updateClassNames() {
    if(div) {
        div.className = classPort.get();
    }
}

op.onDelete=function()
{
    if(div)div.remove();
}

function setUpDiv()
{
    if(!div)
    {
        div = document.createElement('div');
        div.oncontextmenu = function(e){
            console.log("context menu canceled!");
            e.preventDefault();
        }

        div.style.padding="0px";
        div.style.position="absolute";
        div.style['box-sizing']="border-box";
        div.style.border="1px solid red";
        // div.style['border-left']="1px solid blue";
        // div.style['border-top']="1px solid green";
        div.style["z-index"]="9999";

        div.style["-webkit-user-select"]="none";
        div.style["user-select"]="none";
        div.style["-webkit-tap-highlight-color"]="rgba(0,0,0,0)";
        div.style["-webkit-touch-callout"]="none";

        var canvas = op.patch.cgl.canvas.parentElement;
        canvas.appendChild(div);
        updateCursor();
        updateIsInteractive();
        updateId();
        updateClassNames();
    }
    updateDivSize();
    elementPort.set(div);
}

var listenerElement=null;

function onMouseMove(e)
{
    var offsetX=-width.get()/2;
    var offsetY=-height.get()/2;

    outX.set( Math.max(0.0,Math.min(1.0,e.offsetX/divWidth)));
    outY.set( Math.max(0.0,Math.min(1.0,1.0-e.offsetY/divHeight)));
}

function onMouseLeave(e)
{
    mouseDown.set(false);
    mouseOver.set(false);
}

function onMouseEnter(e)
{
    mouseOver.set(true);
}

function onMouseDown(e)
{
    mouseDown.set(true);
}

function onMouseUp(e)
{
    mouseDown.set(false);
}

function onmouseclick(e)
{
    mouseClick.trigger();
}

function onTouchMove(e)
{
    // console.log('touchmoveevent',e);

    var targetEle=document.elementFromPoint(e.targetTouches[0].pageX,e.targetTouches[0].pageY);

    if(targetEle==div)
    {
        mouseOver.set(true);
        if(e.touches && e.touches.length>0)
        {
            var rect = div.getBoundingClientRect(); //e.target
            var x = e.targetTouches[0].pageX - rect.left;
            var y = e.targetTouches[0].pageY - rect.top;

            var touch=e.touches[0];

            outX.set( Math.max(0.0,Math.min(1.0,x/divWidth)));
            outY.set( Math.max(0.0,Math.min(1.0,1.0-y/divHeight)));

            onMouseMove(touch);
        }
    }
    else
    {
        mouseOver.set(false);
    }
}


active.onChange=updateActiveRender;
function updateActiveRender()
{
    if(active.get())
    {
        addListeners();
        if(div) div.style['display']='block';
    }
    else
    {
        removeListeners();
        if(div) div.style['display']='none';
    }

}

isInteractive.onChange=updateIsInteractive;
function updateIsInteractive()
{
    if(isInteractive.get())
    {
        addListeners();
        if(div)div.style['pointer-events']='initial';
    }
    else
    {
        removeListeners();
        mouseDown.set(false);
        mouseOver.set(false);
        if(div)div.style['pointer-events']='none';
    }
}

function removeListeners()
{
    if(listenerElement)
    {
        document.removeEventListener('touchmove', onTouchMove);
        listenerElement.removeEventListener('touchend', onMouseUp);
        listenerElement.removeEventListener('touchstart', onMouseDown);

        listenerElement.removeEventListener('click', onmouseclick);
        listenerElement.removeEventListener('mousemove', onMouseMove);
        listenerElement.removeEventListener('mouseleave', onMouseLeave);
        listenerElement.removeEventListener('mousedown', onMouseDown);
        listenerElement.removeEventListener('mouseup', onMouseUp);
        listenerElement.removeEventListener('mouseenter', onMouseEnter);
        // listenerElement.removeEventListener('contextmenu', onClickRight);
        listenerElement=null;
    }
}

function addListeners()
{
    if(listenerElement)removeListeners();

    listenerElement=div;

    if(listenerElement)
    {
        document.addEventListener('touchmove', onTouchMove);
        listenerElement.addEventListener('touchend', onMouseUp);
        listenerElement.addEventListener('touchstart', onMouseDown);

        listenerElement.addEventListener('click', onmouseclick);
        listenerElement.addEventListener('mousemove', onMouseMove);
        listenerElement.addEventListener('mouseleave', onMouseLeave);
        listenerElement.addEventListener('mousedown', onMouseDown);
        listenerElement.addEventListener('mouseup', onMouseUp);
        listenerElement.addEventListener('mouseenter', onMouseEnter);
        // listenerElement.addEventListener('contextmenu', onClickRight);

    }
}

