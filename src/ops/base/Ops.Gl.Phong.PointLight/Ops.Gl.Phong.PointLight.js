this.name='PointLight';
var cgl=this.patch.cgl;

var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var attachment=this.addOutPort(new Port(this,"attachment",OP_PORT_TYPE_FUNCTION));

var attenuation=this.addInPort(new Port(this,"attenuation",OP_PORT_TYPE_VALUE));

var r=this.addInPort(new Port(this,"r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g=this.addInPort(new Port(this,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=this.addInPort(new Port(this,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));

var x=this.addInPort(new Port(this,"x",OP_PORT_TYPE_VALUE));
var y=this.addInPort(new Port(this,"y",OP_PORT_TYPE_VALUE));
var z=this.addInPort(new Port(this,"z",OP_PORT_TYPE_VALUE));

var mul=this.addInPort(new Port(this,"multiply",OP_PORT_TYPE_VALUE,{display:'range'}));
mul.set(1);

var id=generateUUID();
var lights=[];

var posVec=vec3.create();
var mpos=vec3.create();


var updateColor=function()
{
    cgl.frameStore.phong.lights[id].color=[ r.get(), g.get(), b.get() ];
    cgl.frameStore.phong.lights[id].changed=true;
}



var updateAttenuation=function()
{
    cgl.frameStore.phong.lights[id].attenuation=attenuation.get();
    cgl.frameStore.phong.lights[id].changed=true;
}

var updatePos=function()
{
}

var updateAll=function()
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