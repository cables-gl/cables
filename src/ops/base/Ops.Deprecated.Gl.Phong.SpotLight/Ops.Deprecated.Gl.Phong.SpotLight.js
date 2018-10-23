// this.name='Spotlight';
// var cgl=this.patch.cgl;

// var exe=this.addInPort(new Port(this,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
// var trigger=this.addOutPort(new Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

// var attachment=this.addOutPort(new Port(this,"attachment",CABLES.OP_PORT_TYPE_FUNCTION));

// var attenuation=this.addInPort(new Port(this,"attenuation",CABLES.OP_PORT_TYPE_VALUE));

// var mul=this.addInPort(new Port(this,"multiply",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));
// mul.set(1);

// var cone=this.addInPort(new Port(this,"cone",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
// cone.set(0.85);
// var r=this.addInPort(new Port(this,"r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
// var g=this.addInPort(new Port(this,"g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
// var b=this.addInPort(new Port(this,"b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));

// var x=this.addInPort(new Port(this,"x",CABLES.OP_PORT_TYPE_VALUE));
// var y=this.addInPort(new Port(this,"y",CABLES.OP_PORT_TYPE_VALUE));
// var z=this.addInPort(new Port(this,"z",CABLES.OP_PORT_TYPE_VALUE));

// var tx=this.addInPort(new Port(this,"target x",CABLES.OP_PORT_TYPE_VALUE));
// var ty=this.addInPort(new Port(this,"target y",CABLES.OP_PORT_TYPE_VALUE));
// var tz=this.addInPort(new Port(this,"target z",CABLES.OP_PORT_TYPE_VALUE));

// var tex=this.addOutPort(new Port(this,"texture",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true}));
// var texDepth=this.addOutPort(new Port(this,"textureDepth",CABLES.OP_PORT_TYPE_TEXTURE));




// var id=CABLES.generateUUID();
// var lights=[];

// var vUp=vec3.create();
// vec3.set(vUp,0,1,0);

// var posVec=vec3.create();

// var fb=new CGL.Framebuffer(cgl);
// // fb.setSize(512,512);
// tex.set( fb.getTextureColor() );
// texDepth.set ( fb.getTextureDepth() );


// var updateColor=function()
// {
//     cgl.frameStore.phong.lights[id].color=[ r.get(), g.get(), b.get() ];
//     cgl.frameStore.phong.lights[id].cone=cone.get();
// };

// var mpos=vec3.create();
// var tpos=vec3.create();


// var updateAttenuation=function()
// {
//     cgl.frameStore.phong.lights[id].attenuation=attenuation.get();
// };


// this.onDelete=function()
// {
//     // console.log('cgl.frameStore.phong.lights.length',cgl.frameStore.phong.lights.length);
// };

// var updateAll=function()
// {
//     if(!cgl.frameStore.phong)cgl.frameStore.phong={};
//     if(!cgl.frameStore.phong.lights)cgl.frameStore.phong.lights=[];
//     cgl.frameStore.phong.lights[id]={};
//     cgl.frameStore.phong.lights[id].id=id;
//     cgl.frameStore.phong.lights[id].pos=mpos;
//     cgl.frameStore.phong.lights[id].target=tpos;
//     cgl.frameStore.phong.lights[id].type=1;
//     cgl.frameStore.phong.lights[id].cone=cone.get();

//     updateColor();
//     updateAttenuation();
// };

// vecEye=vec3.create();
// vecTarget=vec3.create();

// function updateTarget()
// {
//     vec3.set(vecTarget,tx.get(),ty.get(),tz.get());
// }

// function updateEye()
// {
//     vec3.set(vecEye,x.get(),y.get(),z.get());
// }

// var depthMVP=mat4.create();
// var biasM=[
//     0.5, 0.0, 0.0, 0.0,
//     0.0, 0.5, 0.0, 0.0,
//     0.0, 0.0, 0.5, 0.0,
//     0.5, 0.5, 0.5, 1.0
//     ];

// function renderShadowMap()
// {
//     fb.renderStart(cgl);

//     cgl.pushViewMatrix();

//     mat4.lookAt(cgl.vMatrix, vecEye, vecTarget, vUp);

//     mat4.multiply( depthMVP,cgl.vMatrix,cgl.pMatrix );
//     // mat4.multiply( depthMVP,depthMVP, );
//     mat4.multiply( depthMVP,depthMVP,biasM );

//     trigger.trigger();

//     cgl.popViewMatrix();
//     fb.renderEnd(cgl);
// }

// exe.onTriggered=function()
// {
//     cgl.frameStore.phong.lights[id].shadowPass=1;
//     renderShadowMap();
//     cgl.frameStore.phong.lights[id].shadowPass=0;

//     vec3.transformMat4(mpos, vecEye, cgl.mvMatrix);
//     cgl.frameStore.phong.lights[id].pos=mpos;
//     cgl.frameStore.phong.lights[id].type=1;
//     vec3.transformMat4(tpos, vecTarget, cgl.mvMatrix);
//     cgl.frameStore.phong.lights[id].target=tpos;
//     cgl.frameStore.phong.lights[id].mul=mul.get();
//     cgl.frameStore.phong.lights[id].depthMVP=depthMVP;
//     cgl.frameStore.phong.lights[id].depthTex=fb.getTextureDepth().tex;


//     if(attachment.isLinked())
//     {
//         cgl.pushModelMatrix();
//         mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vecEye);
//         attachment.trigger();
//         cgl.popModelMatrix();

//         cgl.pushModelMatrix();
//         mat4.translate(cgl.mvMatrix,cgl.mvMatrix,vecTarget);
//         attachment.trigger();
//         cgl.popModelMatrix();
//     }

//     trigger.trigger();
// };

// r.set(1);
// g.set(1);
// b.set(1);
// attenuation.set(0);

// x.onValueChanged=updateEye;
// y.onValueChanged=updateEye;
// z.onValueChanged=updateEye;

// tx.onValueChanged=updateTarget;
// ty.onValueChanged=updateTarget;
// tz.onValueChanged=updateTarget;

// r.onValueChanged=updateColor;
// g.onValueChanged=updateColor;
// b.onValueChanged=updateColor;
// cone.onValueChanged=updateColor;

// attenuation.onValueChanged=updateAttenuation;

// updateAll();
