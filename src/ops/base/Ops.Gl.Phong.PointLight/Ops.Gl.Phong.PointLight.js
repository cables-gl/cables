op.name='PointLight';

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var attachment=op.addOutPort(new Port(op,"attachment",OP_PORT_TYPE_FUNCTION));


var radius=op.inValue("Radius",10);

var x=op.addInPort(new Port(op,"x",OP_PORT_TYPE_VALUE));
var y=op.addInPort(new Port(op,"y",OP_PORT_TYPE_VALUE));
var z=op.addInPort(new Port(op,"z",OP_PORT_TYPE_VALUE));

var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));

var ambientR=op.addInPort(new Port(op,"Ambient R",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var ambientG=op.addInPort(new Port(op,"Ambient G",OP_PORT_TYPE_VALUE,{ display:'range' }));
var ambientB=op.addInPort(new Port(op,"Ambient B",OP_PORT_TYPE_VALUE,{ display:'range' }));

var fallOff=op.inValue("Fall Off",0.1);
// var mul=op.addInPort(new Port(op,"multiply",OP_PORT_TYPE_VALUE,{display:'range'}));



ambientR.set(0);
ambientG.set(0);
ambientB.set(0);
// mul.set(1);
r.set(1);
g.set(1);
b.set(1);


var cgl=op.patch.cgl;


radius.onChange=updateAll;
fallOff.onChange=updateAll;
r.onChange=updateAll;
g.onChange=updateAll;
b.onChange=updateAll;
x.onChange=updateAll;
y.onChange=updateAll;
z.onChange=updateAll;

ambientR.onChange=updateAll;
ambientG.onChange=updateAll;
ambientB.onChange=updateAll;




var id=CABLES.generateUUID();
var light={};

var posVec=vec3.create();
var mpos=vec3.create();


updateAll();


function updateColor()
{
    light.color=[ r.get(), g.get(), b.get() ];
    light.ambient=[ ambientR.get(), ambientG.get(), ambientB.get() ];
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
    light.mul=1.0;//mul.get();
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

