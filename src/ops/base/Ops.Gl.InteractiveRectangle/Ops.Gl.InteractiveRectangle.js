
var render=op.inFunction("render");
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var width=op.inValue("width",1);
var height=op.inValue("height",1);

var pivotX=op.addInPort(new Port(op,"pivot x",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["center","left","right"]} ));
var pivotY=op.addInPort(new Port(op,"pivot y",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["center","top","bottom"]} ));

var axis=op.addInPort(new Port(op,"axis",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["xy","xz"]} ));

var active=op.inValueBool('Render',true);
var divVisible=op.inValueBool('Show Boundings',true);

var geomOut=op.addOutPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));
geomOut.ignoreValueSerialize=true;


var mouseOver=op.outValue("Pointer Hover",false);
var outX=op.outValue("Pointer X");
var outY=op.outValue("Pointer Y");


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

var mvMatrix=mat4.create();
divVisible.onChange=updateDivVisibility;

function updateDivVisibility()
{
    if(div)
    {
        if(divVisible.get()) div.style.display='block';
            else div.style.display='none';
    }
    
}

function updateDivSize()
{
    var vp=cgl.getViewPort();
    
    
    mat4.multiply(mvMatrix,cgl.vMatrix,cgl.mvMatrix);
    vec3.transformMat4(pos, divAlign, mvMatrix);
    vec3.transformMat4(trans, pos, cgl.pMatrix);



    var x1 = (trans[0] * vp[2]/2) + vp[2]/2;
    var y1 = (trans[1] * vp[3]/2) + vp[3]/2;

    
    divAlignSize[0] = divAlign[0] + width.get();
    divAlignSize[1] = divAlign[1];
    
    vec3.transformMat4(pos, divAlignSize, mvMatrix);
    vec3.transformMat4(trans, pos, cgl.pMatrix);

    var x2 = ((trans[0] * vp[2]/2) + vp[2]/2);
    var y2= ((trans[1] * vp[3]/2) + vp[3]/2);




    divAlignSize[0] = divAlign[0];
    divAlignSize[1] = divAlign[1] + height.get();
    
    vec3.transformMat4(pos, divAlignSize, mvMatrix);
    vec3.transformMat4(trans, pos, cgl.pMatrix);

    var x3 = ((trans[0] * vp[2]/2) + vp[2]/2);
    var y3= ((trans[1] * vp[3]/2) + vp[3]/2);




    divAlignSize[0] = divAlign[0] + width.get();
    divAlignSize[1] = divAlign[1] + height.get();
    
    vec3.transformMat4(pos, divAlignSize, mvMatrix);
    vec3.transformMat4(trans, pos, cgl.pMatrix);

    var x4 = ((trans[0] * vp[2]/2) + vp[2]/2);
    var y4 = ((trans[1] * vp[3]/2) + vp[3]/2);


    divX=Math.min(x1,x2,x3,x4);
    divY=Math.min(vp[3]-y1,vp[3]-y2,vp[3]-y3,vp[3]-y4);

    var xb=Math.max(x1,x2,x3,x4);
    var yb=Math.max(vp[3]-y1,vp[3]-y2,vp[3]-y3,vp[3]-y4);

    divWidth=Math.abs(xb-divX);
    divHeight=Math.abs(yb-divY);
    

    div.style.left=divX+'px';
    div.style.top=divY+'px';
    div.style.width=divWidth+'px';
    div.style.height=divHeight+'px';
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
        div.style.padding="0px";
        div.style.position="absolute";
        div.style.overflow="hidden";
        div.style['box-sizing']="border-box";
        div.style.border="1px solid red";
        div.style['border-left']="1px solid blue";
        div.style['border-top']="1px solid green";
        div.style["z-index"]="9999";
        
        var canvas = op.patch.cgl.canvas.parentElement;
        canvas.appendChild(div);
        
    }
    updateDivSize();
}

var listenerElement=null;



function onmousemove(e)
{
    var offsetX=-width.get()/2;
    var offsetY=-height.get()/2;
    
    outX.set(e.offsetX/divWidth*width.get()+offsetX);
    outY.set( (divHeight-e.offsetY)/divHeight*height.get()+offsetY);
}

function onMouseLeave(e)
{
    mouseOver.set(false);
}

function onMouseEnter(e)
{
    mouseOver.set(true);
}


function removeLiseteners()
{
    
    // listenerElement.removeEventListener('touchend', ontouchend);
    // listenerElement.removeEventListener('touchstart', ontouchstart);

    // listenerElement.removeEventListener('click', onmouseclick);
    listenerElement.removeEventListener('mousemove', onmousemove);
    listenerElement.removeEventListener('mouseleave', onMouseLeave);
    // listenerElement.removeEventListener('mousedown', onMouseDown);
    // listenerElement.removeEventListener('mouseup', onMouseUp);
    listenerElement.removeEventListener('mouseenter', onMouseEnter);
    // listenerElement.removeEventListener('contextmenu', onClickRight);
    listenerElement=null;
}

function addListeners()
{
    if(listenerElement)removeLiseteners();
    
    listenerElement=div;

    // listenerElement.addEventListener('touchend', ontouchend);
    // listenerElement.addEventListener('touchstart', ontouchstart);

    // listenerElement.addEventListener('click', onmouseclick);
    listenerElement.addEventListener('mousemove', onmousemove);
    listenerElement.addEventListener('mouseleave', onMouseLeave);
    // listenerElement.addEventListener('mousedown', onMouseDown);
    // listenerElement.addEventListener('mouseup', onMouseUp);
    listenerElement.addEventListener('mouseenter', onMouseEnter);
    // listenerElement.addEventListener('contextmenu', onClickRight);
}

