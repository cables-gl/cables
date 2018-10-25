op.name='PointLight';

var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var attachment=op.addOutPort(new CABLES.Port(op,"attachment",CABLES.OP_PORT_TYPE_FUNCTION));
var attenuation=op.addInPort(new CABLES.Port(op,"attenuation",CABLES.OP_PORT_TYPE_VALUE));

var r=op.addInPort(new CABLES.Port(op,"r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g=op.addInPort(new CABLES.Port(op,"g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new CABLES.Port(op,"b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));

var x=op.addInPort(new CABLES.Port(op,"x",CABLES.OP_PORT_TYPE_VALUE));
var y=op.addInPort(new CABLES.Port(op,"y",CABLES.OP_PORT_TYPE_VALUE));
var z=op.addInPort(new CABLES.Port(op,"z",CABLES.OP_PORT_TYPE_VALUE));

var mul=op.addInPort(new CABLES.Port(op,"multiply",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));

var cgl=op.patch.cgl;
mul.set(1);
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


var id=CABLES.generateUUID();
var light={};

var posVec=vec3.create();
var mpos=vec3.create();


updateAll();


function updateColor()
{
    light.color=[ r.get(), g.get(), b.get() ];
    light.changed=true;
}

function updateAttenuation()
{
    light.attenuation=attenuation.get();
    light.changed=true;
}

function updatePos()
{
}

function updateAll()
{
    if(!cgl.frameStore.phong)cgl.frameStore.phong={};
    if(!cgl.frameStore.phong.lights)cgl.frameStore.phong.lights=[];
    light={};
    light.id=id;
    light.type=0;
    light.changed=true;

    updatePos();
    updateColor();
    updateAttenuation();
}

exe.onTriggered=function()
{
    cgl.frameStore.phong.lights=cgl.frameStore.phong.lights||[];

    vec3.transformMat4(mpos, [x.get(),y.get(),z.get()], cgl.mvMatrix);
    light=light||{};
    
    // console.log(mpos);
    light.pos=mpos;
    light.mul=mul.get();
    light.type=0;

    if(attachment.isLinked())
    {
        cgl.pushModelMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix,
            [x.get(),
            y.get(),
            z.get()]);
        attachment.trigger();
        cgl.popModelMatrix();
    }

    cgl.frameStore.phong.lights.push(light);
    trigger.trigger();
    cgl.frameStore.phong.lights.pop();
};

