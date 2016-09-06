var cgl=op.patch.cgl;

op.name='GradientMaterial';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var screenSpace=op.addInPort(new Port(op,"screen space",OP_PORT_TYPE_VALUE,{ display:'bool' }));
var direction=op.addInPort(new Port(op,"direction",OP_PORT_TYPE_VALUE,{ display:'bool' }));
screenSpace.set(false);
direction.set(true);

var r=op.addInPort(new Port(op,"r1",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g=op.addInPort(new Port(op,"g1",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new Port(op,"b1",OP_PORT_TYPE_VALUE,{ display:'range' }));
var a=op.addInPort(new Port(op,"a1",OP_PORT_TYPE_VALUE,{ display:'range' }));

var r2=op.addInPort(new Port(op,"r2",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g2=op.addInPort(new Port(op,"g2",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b2=op.addInPort(new Port(op,"b2",OP_PORT_TYPE_VALUE,{ display:'range' }));
var a2=op.addInPort(new Port(op,"a2",OP_PORT_TYPE_VALUE,{ display:'range' }));

var r3=op.addInPort(new Port(op,"r3",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g3=op.addInPort(new Port(op,"g3",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b3=op.addInPort(new Port(op,"b3",OP_PORT_TYPE_VALUE,{ display:'range' }));
var a3=op.addInPort(new Port(op,"a3",OP_PORT_TYPE_VALUE,{ display:'range' }));

r.set(0.2);
g.set(0.2);
b.set(0.2);
a.set(1.0);

r2.set(0.73);
g2.set(0.73);
b2.set(0.73);
a2.set(1.0);

r3.set(1.0);
g3.set(1.0);
b3.set(1.0);
a3.set(1.0);

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
op.onLoaded=shader.compile;
shader.setSource(shader.getDefaultVertexShader(),srcFrag);
shader.define("USE_TEXCOORDS");
var uniformWidth=new CGL.Uniform(shader,'f','width',w);
var uniformHeight=new CGL.Uniform(shader,'f','height',h);



r.onValueChanged=g.onValueChanged=b.onValueChanged=a.onValueChanged=function()
{
    colA=[r.get(),g.get(),b.get(),a.get()];
    if(!r.uniform) r.uniform=new CGL.Uniform(shader,'4f','colA',colA);
    else r.uniform.setValue(colA);
};

r2.onValueChanged=g2.onValueChanged=b2.onValueChanged=a2.onValueChanged=function()
{
    colB=[r2.get(),g2.get(),b2.get(),a2.get()];
    if(!r2.uniform) r2.uniform=new CGL.Uniform(shader,'4f','colB',colB);
    else r2.uniform.setValue(colB);
};

r3.onValueChanged=g3.onValueChanged=b3.onValueChanged=a3.onValueChanged=function()
{
    colC=[r3.get(),g3.get(),b3.get(),a3.get()];
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
