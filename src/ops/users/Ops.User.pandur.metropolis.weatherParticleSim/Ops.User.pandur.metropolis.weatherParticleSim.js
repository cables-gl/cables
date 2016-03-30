this.name="weather Simulation";
var cgl=this.patch.cgl;

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var width=this.addInPort(new Port(this,"texture width"));
var height=this.addInPort(new Port(this,"texture height"));
var texField=this.addInPort(new Port(this,"field tex",OP_PORT_TYPE_TEXTURE));

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var tex=this.addOutPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE));

var texture=new CGL.Texture(cgl,{isFloatingPointTexture:true});
texture.setSize(1024,1024);
   
var shaderSim=new CGL.Shader(cgl);
this.onLoaded=shaderSim.compile;


// simulation...

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'uniform sampler2D texField;'
    .endl()+'uniform float time;'
    .endl()+'varying vec2 texCoord;'

    .endl()+'float random(vec2 co)'
    .endl()+'{'
    .endl()+'   return fract(sin(dot(co.xy ,vec2(time+12.9898,78.233))) * 43758.5453);'
    .endl()+'}'


    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 old = texture2D( tex, texCoord );'
    
    .endl()+'   float x=random((4.22)*gl_FragCoord.xy);'
    .endl()+'   float y=(random((1.255+time*0.01)*gl_FragCoord.xy)+random((2.3455+time*0.01)*gl_FragCoord.xy))*0.01;'
    .endl()+'   float z=random((2.3455)*gl_FragCoord.xy);'
    .endl()+'   float w=1.0;'

    .endl()+'   if(time!=0.0)'
    .endl()+'   {'
    .endl()+'       x=old.r+ random((4.22)*gl_FragCoord.xy)*  0.0052;'
    .endl()+'       y=old.g;'
    .endl()+'       z=old.b;'
    .endl()+'       w=old.a;'
    .endl()+'   }'
    
    
    .endl()+'   vec4 fieldCol=texture2D( texField, vec2(x,z) );'
    
    
    .endl()+'   x+= (fieldCol.r-0.5)*-0.007*fieldCol.a;'
    .endl()+'   z+= (fieldCol.g-0.5)*0.007*fieldCol.a;'
    // .endl()+'   y = fieldCol.g*0.03;'
    
    .endl()+'   if(x>1.0){'
    .endl()+'       x =0.0;'
    .endl()+'       z=random((2.3455)*gl_FragCoord.xy);'
    .endl()+'   }'
    
    .endl()+'   if(z>1.0)z=1.0;'
    
    .endl()+'   gl_FragColor = vec4(x,y,z,w);'
    .endl()+'}';

// positioning,..

var srcGetPos=''
    .endl()+'vec2 getPos(float index,float num)'
    .endl()+'{'
    .endl()+'   float size=1024.0;'
    .endl()+'   float tx = mod(attrVertIndex,size)/size;'
    .endl()+'   float ty = float( int((attrVertIndex/size)) )/size;'
    .endl()+'   return vec2(tx,ty);'
    .endl()+'}';

var srcPosHeadVert=''
    .endl()+'uniform float numVertices;'
    .endl()+'uniform float time;'
    .endl()+'attribute float attrVertIndex;'
    .endl()+'uniform sampler2D texPositions;'
    
    .endl()+'varying vec2 pixelPos;'

    .endl()+''
    .endl()+srcGetPos
    .endl();

var srcPosBodyVert=''

    .endl()+'pixelPos=getPos(attrVertIndex,numVertices);'
    .endl()+'pos.xzy = texture2D( texPositions, pixelPos ).rgb*1.0;'
    .endl();

// particle color

var srcPosHeadFrag=''
    .endl()+'uniform sampler2D texField;'
    .endl()+'varying vec2 pixelPos;'

    .endl();
    
var srcPosBodyFrag=''
    // .endl()+'col.xyz = vec3(1.0,0.0,0.0);'
    .endl()+'col.xzy = texture2D( texField, pixelPos ).rgb;'
    .endl()+'col.g = 1.0;'
    .endl()+'col.b = 1.0;'
    .endl()+'col.r = 1.0;'
    .endl()+'col.a = col.r*0.035;'
    .endl();




shaderSim.setSource(shaderSim.getDefaultVertexShader(),srcFrag);
tex.set(texture);
new CGL.Uniform(shaderSim,'t','tex',0);
new CGL.Uniform(shaderSim,'t','texField',1);

var uniTime=new CGL.Uniform(shaderSim,'f','time',0);
var startTime=Date.now()/1000;

var effect=new CGL.TextureEffect(cgl,{fp:true});
var shaderPos=null;
function removeModule()
{
    if(shaderPos && module)
    {
        shaderPos.removeModule(module);
        shaderPos=null;
    }
}

effect.setSourceTexture(texture);
var firstTime=true;

function doRender()
{
    if(!firstTime) uniTime.setValue(Date.now()/1000-startTime);
    
    // simulation shader
    
    var t=effect.getCurrentSourceTexture().tex;
    cgl.setShader(shaderSim);
    effect.bind();

    cgl.setTexture(0,t);
    cgl.setTexture(1,texField.get().tex);

    effect.finish();
    cgl.setPreviousShader();

    cgl.resetViewPort();

    // positioning shader
    
    if(cgl.getShader()!=shaderPos)
    {
        if(shaderPos) removeModule();
        console.log('re init shader module particlepos');

        shaderPos=cgl.getShader();
        new CGL.Uniform(shaderPos,'t','tex',0);
        new CGL.Uniform(shaderPos,'t','texField',1);
        
        module=shaderPos.addModule(
        {
            name:'MODULE_VERTEX_POSITION',
            srcHeadVert:srcPosHeadVert,
            srcBodyVert:srcPosBodyVert
        });
        moduleFrag=shaderPos.addModule(
        {
            name:'MODULE_COLOR',
            srcHeadFrag:srcPosHeadFrag,
            srcBodyFrag:srcPosBodyFrag
        });
    }

    cgl.setTexture(0,t);
    cgl.setTexture(1,texField.get().tex);


    firstTime=false;
    trigger.trigger();
}


render.onTriggered=doRender;


