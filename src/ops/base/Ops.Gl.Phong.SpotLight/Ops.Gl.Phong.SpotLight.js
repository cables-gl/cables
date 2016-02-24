this.name='Spotlight';
var cgl=this.patch.cgl;

var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var attachment=this.addOutPort(new Port(this,"attachment",OP_PORT_TYPE_FUNCTION));

var attenuation=this.addInPort(new Port(this,"attenuation",OP_PORT_TYPE_VALUE));

var cone=this.addInPort(new Port(this,"cone",OP_PORT_TYPE_VALUE,{ display:'range' }));
cone.set(0.85);
var r=this.addInPort(new Port(this,"r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g=this.addInPort(new Port(this,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=this.addInPort(new Port(this,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));

var x=this.addInPort(new Port(this,"x",OP_PORT_TYPE_VALUE));
var y=this.addInPort(new Port(this,"y",OP_PORT_TYPE_VALUE));
var z=this.addInPort(new Port(this,"z",OP_PORT_TYPE_VALUE));

var tx=this.addInPort(new Port(this,"target x",OP_PORT_TYPE_VALUE));
var ty=this.addInPort(new Port(this,"target y",OP_PORT_TYPE_VALUE));
var tz=this.addInPort(new Port(this,"target z",OP_PORT_TYPE_VALUE));


var id=generateUUID();
var lights=[];

var posVec=vec3.create();


var updateColor=function()
{
    cgl.frameStore.phong.lights[id].color=[ r.get(), g.get(), b.get() ];
    cgl.frameStore.phong.lights[id].cone=cone.get();
};

var mpos=vec3.create();
var tpos=vec3.create();


var updateAttenuation=function()
{
    cgl.frameStore.phong.lights[id].attenuation=attenuation.get();
};


this.onDelete=function()
{
    // console.log('cgl.frameStore.phong.lights.length',cgl.frameStore.phong.lights.length);
};

var updateAll=function()
{
    if(!cgl.frameStore.phong)cgl.frameStore.phong={};
    if(!cgl.frameStore.phong.lights)cgl.frameStore.phong.lights=[];
    cgl.frameStore.phong.lights[id]={};
    cgl.frameStore.phong.lights[id].id=id;
    cgl.frameStore.phong.lights[id].pos=mpos;
    cgl.frameStore.phong.lights[id].target=tpos;
    cgl.frameStore.phong.lights[id].type=1;
    cgl.frameStore.phong.lights[id].cone=cone.get();

    updateColor();
    updateAttenuation();
};

exe.onTriggered=function()
{
    vec3.transformMat4(mpos, [x.get(),y.get(),z.get()], cgl.mvMatrix);
    cgl.frameStore.phong.lights[id].pos=mpos;
    vec3.transformMat4(tpos, [tx.get(),ty.get(),tz.get()], cgl.mvMatrix);
    cgl.frameStore.phong.lights[id].target=tpos;

    if(attachment.isLinked())
    {
        cgl.pushMvMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, 
            [x.get(), 
            y.get(), 
            z.get()]);
        attachment.trigger();
        cgl.popMvMatrix();

        cgl.pushMvMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, 
            [tx.get(), 
            ty.get(), 
            tz.get()]);
        attachment.trigger();
        cgl.popMvMatrix();

    }


    trigger.trigger();
};

r.set(1);
g.set(1);
b.set(1);
attenuation.set(0);

r.onValueChanged=updateColor;
g.onValueChanged=updateColor;
b.onValueChanged=updateColor;
cone.onValueChanged=updateColor;

attenuation.onValueChanged=updateAttenuation;

updateAll();