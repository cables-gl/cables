// http://stackoverflow.com/questions/5504635/computing-fovx-opengl

var render=op.inTrigger('render');
var fovY=op.inValueFloat("fov y",45);
var zNear=op.inValueFloat("frustum near",0.01);
var zFar=op.inValueFloat("frustum far",20);
var autoAspect=op.inValueBool("Auto Aspect Ratio",true);
var aspect=op.inValue("Aspect Ratio");

var trigger=op.outTrigger('trigger');


var cgl=op.patch.cgl;

fovY.onChange=zFar.onChange=zNear.onChange=changed;

changed();

op.setPortGroup("Field of View",fovY);
op.setPortGroup("Frustrum",zNear,zFar);

var asp=0;

render.onTriggered=function()
{
    asp=cgl.getViewPort()[2]/cgl.getViewPort()[3];
    if(!autoAspect.get())asp=aspect.get();

    cgl.pushPMatrix();
    mat4.perspective(
        cgl.pMatrix,
        fovY.get()*0.0174533,
        asp,
        zNear.get(),
        zFar.get());

    trigger.trigger();

    cgl.popPMatrix();
};

function changed()
{
    cgl.frameStore.perspective=
    {
        fovy:fovY.get(),
        zFar:zFar.get(),
        zNear:zNear.get(),
    };
}

