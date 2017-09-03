op.name='Transform';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var posX=op.addInPort(new Port(op,"posX"),0);
var posY=op.addInPort(new Port(op,"posY"),0);
var posZ=op.addInPort(new Port(op,"posZ"),0);

var scale=op.addInPort(new Port(op,"scale"));

var rotX=op.addInPort(new Port(op,"rotX"));
var rotY=op.addInPort(new Port(op,"rotY"));
var rotZ=op.addInPort(new Port(op,"rotZ"));

var cgl=op.patch.cgl;
var vPos=vec3.create();
var vScale=vec3.create();
var transMatrix = mat4.create();
mat4.identity(transMatrix);

var doScale=false;
var doTranslate=false;

var translationChanged=true;
var scaleChanged=true;
var rotChanged=true;

render.onTriggered=function()
{
    
    

    
    
    var updateMatrix=false;
    if(translationChanged)
    {
        updateTranslation();
        updateMatrix=true;
    }
    if(scaleChanged)
    {
        updateScale();
        updateMatrix=true;
    }
    if(rotChanged)
    {
        updateMatrix=true;
    }
    if(updateMatrix)doUpdateMatrix();

    cgl.pushMvMatrix();
    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,transMatrix);










    trigger.trigger();
    cgl.popMvMatrix();
    
    if(CABLES.UI && gui.patch().isCurrentOp(op))
    {
        cgl.pushMvMatrix();
        function toScreen(trans)
        {
            var vp=cgl.getViewPort();
            
            var x=( vp[2]-( vp[2]  * 0.5 - trans[0] * vp[2] * 0.5 / trans[2] ));
            var y=( vp[3]-( vp[3]  * 0.5 + trans[1] * vp[3] * 0.5 / trans[2] ));
            
            return {x:x,y:y};
        }
        
        var m=mat4.create();
        var pos=vec3.create();
        var trans=vec3.create();
        var transX=vec3.create();
        var transY=vec3.create();
        var transZ=vec3.create();
        
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, [posX.get(),posY.get(),posZ.get()]);
        mat4.multiply(m,cgl.vMatrix,cgl.mvMatrix);

        vec3.transformMat4(pos, [0,0,0], m);
        vec3.transformMat4(trans, pos, cgl.pMatrix);
        var w=2;
        vec3.transformMat4(pos, [w,0,0], m);
        vec3.transformMat4(transX, pos, cgl.pMatrix);

        vec3.transformMat4(pos, [0,w,0], m);
        vec3.transformMat4(transY, pos, cgl.pMatrix);

        vec3.transformMat4(pos, [0,0,w], m);
        vec3.transformMat4(transZ, pos, cgl.pMatrix);


        var zero=toScreen(trans);
        var screenX=toScreen(transX);
        var screenY=toScreen(transY);
        var screenZ=toScreen(transZ);
        
        cgl.popMvMatrix();
        
        gui.setTransformGizmo(
            {
                x:zero.x,
                y:zero.y,
                xx:screenX.x,
                xy:screenX.y,
                yx:screenY.x,
                yy:screenY.y,
                zx:screenZ.x,
                zy:screenZ.y,
                
                coord:trans,
                coordX:transX,
                coordY:transY,
                coordZ:transZ,

                posX:posX,
                posY:posY,
                posZ:posZ,
            });

    }
    
    
};

op.transform3d=function()
{
    return {
            pos:[posX,posY,posZ]
        };
    
};

var doUpdateMatrix=function()
{
    mat4.identity(transMatrix);
    if(doTranslate)mat4.translate(transMatrix,transMatrix, vPos);

    if(rotX.get()!==0)mat4.rotateX(transMatrix,transMatrix, rotX.get()*CGL.DEG2RAD);
    if(rotY.get()!==0)mat4.rotateY(transMatrix,transMatrix, rotY.get()*CGL.DEG2RAD);
    if(rotZ.get()!==0)mat4.rotateZ(transMatrix,transMatrix, rotZ.get()*CGL.DEG2RAD);

    if(doScale)mat4.scale(transMatrix,transMatrix, vScale);
    rotChanged=false;
};

function updateTranslation()
{
    doTranslate=false;
    if(posX.get()!==0.0 || posY.get()!==0.0 || posZ.get()!==0.0) doTranslate=true;
    vec3.set(vPos, posX.get(),posY.get(),posZ.get());
    translationChanged=false;
}

function updateScale()
{
    doScale=false;
    if(scale.get()!==0.0)doScale=true;
    vec3.set(vScale, scale.get(),scale.get(),scale.get());
    scaleChanged=false;
}

var translateChanged=function()
{
    translationChanged=true;
};

var scaleChanged=function()
{
    scaleChanged=true;
};

var rotChanged=function()
{
    rotChanged=true;
};


rotX.onChange=rotChanged;
rotY.onChange=rotChanged;
rotZ.onChange=rotChanged;

scale.onChange=scaleChanged;

posX.onChange=translateChanged;
posY.onChange=translateChanged;
posZ.onChange=translateChanged;

rotX.set(0.0);
rotY.set(0.0);
rotZ.set(0.0);

scale.set(1.0);

posX.set(0.0);
posY.set(0.0);
posZ.set(0.0);

doUpdateMatrix();

