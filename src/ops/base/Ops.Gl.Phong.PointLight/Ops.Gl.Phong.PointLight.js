op.name='PointLight';

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var attachment=op.addOutPort(new Port(op,"attachment",OP_PORT_TYPE_FUNCTION));
var attenuation=op.addInPort(new Port(op,"attenuation",OP_PORT_TYPE_VALUE));

var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));

var x=op.addInPort(new Port(op,"x",OP_PORT_TYPE_VALUE));
var y=op.addInPort(new Port(op,"y",OP_PORT_TYPE_VALUE));
var z=op.addInPort(new Port(op,"z",OP_PORT_TYPE_VALUE));

var mul=op.addInPort(new Port(op,"multiply",OP_PORT_TYPE_VALUE,{display:'range'}));

var cgl=op.patch.cgl;
mul.set(1);

var id=generateUUID();
var lights=[];

var posVec=vec3.create();
var mpos=vec3.create();

function updateColor()
{
    cgl.frameStore.phong.lights[id].color=[ r.get(), g.get(), b.get() ];
    cgl.frameStore.phong.lights[id].changed=true;
}

function updateAttenuation()
{
    cgl.frameStore.phong.lights[id].attenuation=attenuation.get();
    cgl.frameStore.phong.lights[id].changed=true;
}

function updatePos()
{
}

function updateAll()
{
    if(!cgl.frameStore.phong)cgl.frameStore.phong={};
    if(!cgl.frameStore.phong.lights)cgl.frameStore.phong.lights={};
    cgl.frameStore.phong.lights[id]={};
    cgl.frameStore.phong.lights[id].id=id;
    cgl.frameStore.phong.lights[id].type=0;
    cgl.frameStore.phong.lights[id].changed=true;

    updatePos();
    updateColor();
    updateAttenuation();
}

exe.onTriggered=function()
{
    // updateAll();
    
    vec3.transformMat4(mpos, [x.get(),y.get(),z.get()], cgl.mvMatrix);
    cgl.frameStore.phong.lights[id]=cgl.frameStore.phong.lights[id]||{};
    cgl.frameStore.phong.lights[id].pos=mpos;
    cgl.frameStore.phong.lights[id].mul=mul.get();
    cgl.frameStore.phong.lights[id].type=0;

    if(attachment.isLinked())
    {
        cgl.pushMvMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, 
            [x.get(), 
            y.get(), 
            z.get()]);
        attachment.trigger();
        cgl.popMvMatrix();
    }

    trigger.trigger();
    
    // cgl.frameStore.phong.lights[id]=null;
};

r.set(1);
g.set(1);
b.set(1);
attenuation.set(0);

r.onValueChanged=updateAll;
g.onValueChanged=updateAll;
b.onValueChanged=updateAll;
x.onValueChanged=updateAll;
y.onValueChanged=updateAll;
z.onValueChanged=updateAll;
attenuation.onValueChanged=updateAttenuation;

updateAll();