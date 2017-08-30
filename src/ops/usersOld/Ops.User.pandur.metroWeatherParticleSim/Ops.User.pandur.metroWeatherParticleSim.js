this.name="weather Simulation";
var cgl=this.patch.cgl;

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var width=this.addInPort(new Port(this,"texture width"));
var height=this.addInPort(new Port(this,"texture height"));

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var tex=this.addOutPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE));

var texture=new CGL.Texture(cgl,{isFloatingPointTexture:true});
texture.setSize(1024,1024);

var shaderSim=new CGL.Shader(cgl);
this.onLoaded=shaderSim.compile;


// simulation...

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'UNI sampler2D tex;'
    .endl()+'UNI float time;'
    .endl()+'IN vec2 texCoord;'

    .endl()+'float random(vec2 co)'
    .endl()+'{'
    .endl()+'   return fract(sin(dot(co.xy ,vec2(time+12.9898,78.233))) * 43758.5453);'
    .endl()+'}'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 old = texture2D( tex, texCoord );'

    .endl()+'   float c =random((0.2323)*gl_FragCoord.xy)*15.0;'
    .endl()+'   float c1=random((2.3455)*gl_FragCoord.xy)*15.0;'
    .endl()+'   float c2=random((1.7623)*gl_FragCoord.xy)*15.0;'

    .endl()+'   if(time!=0.0)'
    .endl()+'   {'
    .endl()+'       c =old.r+(random((0.2323)*gl_FragCoord.xy))*0.01;'
    .endl()+'       c1=old.g;'
    .endl()+'       c2=old.b;'
    .endl()+'   }'

    .endl()+'   if(c>15.0)c=random((0.2323)*gl_FragCoord.xy)*0.5;'

    .endl()+'   gl_FragColor = vec4(c,c1,c2,1.0);'
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
    .endl()+'UNI float numVertices;'
    .endl()+'UNI float time;'
    .endl()+'IN float attrVertIndex;'
    .endl()+'UNI sampler2D texPositions;'
    .endl()+''
    .endl()+srcGetPos
    .endl();

var srcPosBodyVert=''

    .endl()+'vec2 pixelPos=getPos(attrVertIndex,numVertices);'
    .endl()+'pos.xzy = texture2D( texPositions, pixelPos ).rgb;'
    .endl();


shaderSim.setSource(shaderSim.getDefaultVertexShader(),srcFrag);
tex.set(texture);
new CGL.Uniform(shaderSim,'t','tex',0);
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

        module=shaderPos.addModule(
        {
            name:'MODULE_VERTEX_POSITION',
            srcHeadVert:srcPosHeadVert,
            srcBodyVert:srcPosBodyVert
        });
    }

    cgl.setTexture(0,t);

    firstTime=false;
    trigger.trigger();
}


render.onTriggered=doRender;
