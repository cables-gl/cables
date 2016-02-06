CABLES.Op.apply(this, arguments);
var cgl=this.patch.cgl;

this.name='GradientMaterial';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var screenSpace=this.addInPort(new Port(this,"screen space",OP_PORT_TYPE_VALUE,{ display:'bool' }));
var direction=this.addInPort(new Port(this,"direction",OP_PORT_TYPE_VALUE,{ display:'bool' }));
screenSpace.set(false);
direction.set(true);

var r=this.addInPort(new Port(this,"r1",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g=this.addInPort(new Port(this,"g1",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=this.addInPort(new Port(this,"b1",OP_PORT_TYPE_VALUE,{ display:'range' }));
var a=this.addInPort(new Port(this,"a1",OP_PORT_TYPE_VALUE,{ display:'range' }));

var r2=this.addInPort(new Port(this,"r2",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g2=this.addInPort(new Port(this,"g2",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b2=this.addInPort(new Port(this,"b2",OP_PORT_TYPE_VALUE,{ display:'range' }));
var a2=this.addInPort(new Port(this,"a2",OP_PORT_TYPE_VALUE,{ display:'range' }));

var r3=this.addInPort(new Port(this,"r3",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g3=this.addInPort(new Port(this,"g3",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b3=this.addInPort(new Port(this,"b3",OP_PORT_TYPE_VALUE,{ display:'range' }));
var a3=this.addInPort(new Port(this,"a3",OP_PORT_TYPE_VALUE,{ display:'range' }));

r.val=0.2;
g.val=0.2;
b.val=0.2;
a.val=1.0;

r2.val=0.73;
g2.val=0.73;
b2.val=0.73;
a2.val=1.0;

r3.val=1.0;
g3.val=1.0;
b3.val=1.0;
a3.val=1.0;

var colA=[];
var colB=[];
var colC=[];

var w=0,h=0;

var doRender=function()
{
    if(w!=cgl.getViewPort()[2] || h!=cgl.getViewPort()[3])
    {
        w=cgl.getViewPort()[2];
        h=cgl.getViewPort()[3];
    }

    uniformWidth.setValue(w);
    uniformHeight.setValue(h);

    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();
};

var srcFrag=''
    .endl()+'precision highp float;'
    // .endl()+'varying vec3 norm;'
    .endl()+'varying vec2 texCoord;'
    .endl()+'uniform vec4 colA;'
    .endl()+'uniform vec4 colB;'
    .endl()+'uniform vec4 colC;'
    .endl()+'uniform float width,height;'

    .endl()+''
    .endl()+'void main()'
    .endl()+'{'


    .endl()+'   #ifdef USE_TEXCOORDS'
    .endl()+'       vec2 coords=texCoord;'
    .endl()+'   #endif'

    .endl()+'   #ifdef USE_FRAGCOORDS'
    .endl()+'       vec2 coords=vec2(gl_FragCoord.x/width,gl_FragCoord.y/height);'
    .endl()+'   #endif'


    .endl()+'   #ifdef DIRECTION_VERTICAL'
    .endl()+'   if(coords.y<=0.5)'
    .endl()+'       gl_FragColor = vec4(mix(colA, colB, coords.y*2.0));'
    .endl()+'   else'
    .endl()+'       gl_FragColor = vec4(mix(colB, colC, (coords.y-0.5)*2.0));'
    .endl()+'   #endif'

    .endl()+'   #ifndef DIRECTION_VERTICAL'
    .endl()+'       if(coords.x<=0.5)'
    .endl()+'           gl_FragColor = vec4(mix(colA, colB, coords.x*2.0));'
    .endl()+'       else'
    .endl()+'           gl_FragColor = vec4(mix(colB, colC, (coords.x-0.5)*2.0));'
    .endl()+'   #endif'
    
    .endl()+'}';

var shader=new CGL.Shader(cgl,'GradientMaterial');
this.onLoaded=shader.compile;
shader.setSource(shader.getDefaultVertexShader(),srcFrag);
shader.define("USE_TEXCOORDS");
var uniformWidth=new CGL.Uniform(shader,'f','width',w);
var uniformHeight=new CGL.Uniform(shader,'f','height',h);



r.onValueChanged=g.onValueChanged=b.onValueChanged=a.onValueChanged=function()
{
    colA=[r.val,g.val,b.val,a.val];
    if(!r.uniform) r.uniform=new CGL.Uniform(shader,'4f','colA',colA);
    else r.uniform.setValue(colA);
};

r2.onValueChanged=g2.onValueChanged=b2.onValueChanged=a2.onValueChanged=function()
{
    colB=[r2.val,g2.val,b2.val,a2.val];
    if(!r2.uniform) r2.uniform=new CGL.Uniform(shader,'4f','colB',colB);
    else r2.uniform.setValue(colB);
};

r3.onValueChanged=g3.onValueChanged=b3.onValueChanged=a3.onValueChanged=function()
{
    colC=[r3.val,g3.val,b3.val,a3.val];
    if(!r3.uniform) r3.uniform=new CGL.Uniform(shader,'4f','colC',colC);
    else r3.uniform.setValue(colC);
};

screenSpace.onValueChanged=function()
{
    if(screenSpace.get())
    {
        shader.define("USE_FRAGCOORDS");
        shader.removeDefine("USE_TEXCOORDS");
    }
    else
    {
        shader.define("USE_TEXCOORDS");
        shader.removeDefine("USE_FRAGCOORDS");
    }

};

direction.onValueChanged=function()
{
    if(direction.get()) shader.removeDefine("DIRECTION_VERTICAL");
        else shader.define("DIRECTION_VERTICAL");

};


r3.onValueChanged();
r2.onValueChanged();
r.onValueChanged();
render.onTriggered=doRender;
doRender();
