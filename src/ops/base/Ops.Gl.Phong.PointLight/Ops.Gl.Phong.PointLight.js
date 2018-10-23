

var exe=op.addInPort(new Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var attachment=op.addOutPort(new Port(op,"attachment",CABLES.OP_PORT_TYPE_FUNCTION));


var radius=op.inValue("Radius",100);
var fallOff=op.inValueSlider("Fall Off",0.1);
var intensity=op.inValue("Intensity",1);

var x=op.addInPort(new Port(op,"x",CABLES.OP_PORT_TYPE_VALUE));
var y=op.addInPort(new Port(op,"y",CABLES.OP_PORT_TYPE_VALUE));
var z=op.addInPort(new Port(op,"z",CABLES.OP_PORT_TYPE_VALUE));

var r=op.addInPort(new Port(op,"r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g=op.addInPort(new Port(op,"g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new Port(op,"b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));

var ambientR=op.inValue("Ambient R",0.1);
var ambientG=op.inValue("Ambient G",0.1);
var ambientB=op.inValue("Ambient B",0.1);

var specularR=op.addInPort(new Port(op,"Specular R",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var specularG=op.addInPort(new Port(op,"Specular G",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var specularB=op.addInPort(new Port(op,"Specular B",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));


ambientR.set(0);
ambientG.set(0);
ambientB.set(0);

specularR.set(1);
specularG.set(1);
specularB.set(1);

r.set(1);
g.set(1);
b.set(1);


var cgl=op.patch.cgl;


radius.onChange=updateAll;
fallOff.onChange=updateAll;
intensity.onChange=updateAll;
r.onChange=updateAll;
g.onChange=updateAll;
b.onChange=updateAll;
x.onChange=updateAll;
y.onChange=updateAll;
z.onChange=updateAll;

ambientR.onChange=updateAll;
ambientG.onChange=updateAll;
ambientB.onChange=updateAll;
specularR.onChange=updateAll;
specularG.onChange=updateAll;
specularB.onChange=updateAll;




var id=CABLES.generateUUID();
var light={};

var posVec=vec3.create();
var mpos=vec3.create();
var needsUpdate=true;

updateAll();


function updateColor()
{
    light.color=light.color||[];
    light.color[0]=r.get();
    light.color[1]=g.get();
    light.color[2]=b.get();

    light.ambient=light.ambient||[];
    light.ambient[0]=ambientR.get();
    light.ambient[1]=ambientG.get();
    light.ambient[2]=ambientB.get();
    
    light.specular=light.specular||[];
    light.specular[0]=specularR.get();
    light.specular[1]=specularG.get();
    light.specular[2]=specularB.get();
    
    light.changed=true;
}


function updatePos()
{
}

function updateAll()
{
    needsUpdate=true;
}

var transVec=vec3.create();

exe.onTriggered=function()
{
    if(needsUpdate)
    {
        if(!cgl.frameStore.phong)cgl.frameStore.phong={};
        if(!cgl.frameStore.phong.lights)cgl.frameStore.phong.lights=[];
        light=light||{};
        light.id=id;
        light.type=0;
        light.changed=true;
        light.radius=radius.get();
        light.fallOff=fallOff.get();
        light.mul=intensity.get();
    
        updatePos();
        updateColor();
        needsUpdate=false;
    }
    
    
    
    cgl.frameStore.phong.lights=cgl.frameStore.phong.lights||[];

    vec3.set(transVec,x.get(),y.get(),z.get());
    vec3.transformMat4(mpos, transVec, cgl.mvMatrix);
    light=light||{};
    
    light.pos=mpos;
    light.type=0;


    if(CABLES.UI && CABLES.UI.renderHelper)
    {
        cgl.pushModelMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix,transVec);
        CABLES.GL_MARKER.drawSphere(op,radius.get()*2);
        cgl.popModelMatrix();
    }

    if(attachment.isLinked())
    {
        cgl.pushModelMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix,transVec);
        attachment.trigger();
        cgl.popModelMatrix();
    }

    cgl.frameStore.phong.lights.push(light);
    trigger.trigger();
    cgl.frameStore.phong.lights.pop();
    
    if(CABLES.UI && gui.patch().isCurrentOp(op)) 
        gui.setTransformGizmo(
            {
                posX:x,
                posY:y,
                posZ:z
            });
};

