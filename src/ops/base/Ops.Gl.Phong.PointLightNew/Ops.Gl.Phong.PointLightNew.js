op.name='PointLight';

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var attachment=op.addOutPort(new Port(op,"attachment",OP_PORT_TYPE_FUNCTION));

var fallOff=op.inValue("Fall Off",0);
var radius=op.inValue("Radius",10);


var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));

var x=op.addInPort(new Port(op,"x",OP_PORT_TYPE_VALUE));
var y=op.addInPort(new Port(op,"y",OP_PORT_TYPE_VALUE));
var z=op.addInPort(new Port(op,"z",OP_PORT_TYPE_VALUE));

var mul=op.addInPort(new Port(op,"multiply",OP_PORT_TYPE_VALUE,{display:'range'}));

var cgl=op.patch.cgl;
mul.set(1);
r.set(1);
g.set(1);
b.set(1);


radius.onValueChanged=updateAll;
fallOff.onValueChanged=updateAll;
r.onValueChanged=updateAll;
g.onValueChanged=updateAll;
b.onValueChanged=updateAll;
x.onValueChanged=updateAll;
y.onValueChanged=updateAll;
z.onValueChanged=updateAll;



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
    light.radius=radius.get();
    light.fallOff=fallOff.get();

    updatePos();
    updateColor();
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
        cgl.pushMvMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix,
            [x.get(),
            y.get(),
            z.get()]);
        attachment.trigger();
        cgl.popMvMatrix();
    }

    cgl.frameStore.phong.lights.push(light);
    trigger.trigger();
    cgl.frameStore.phong.lights.pop();
};

