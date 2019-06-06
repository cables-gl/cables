var render=op.inTrigger("Render");
var reset=op.inTrigger("Reset");
var next=op.outTrigger("Next");
var textureField=op.inTexture("textureField");
var shader=null;
var outSimTex=op.outTexture("sim tex");

function removeModule()
{
    if(shader && module)
    {
        shader.removeModule(module);
        shader=null;
    }
}

const cgl=op.patch.cgl;
var uniTime,uniTexture;
var module=null;

render.onLinkChanged=removeModule;


var doReset=true;
reset.onTriggered=function()
{
    doReset=true;
};


// simulation...

var srcFrag=''

    .endl()+'UNI sampler2D tex;'
    .endl()+'UNI sampler2D texField;'
    .endl()+'UNI float time;'
    .endl()+'IN vec2 texCoord;'


    .endl()+'float random(vec2 co)'
    .endl()+'{'
    .endl()+'    return fract(sin(dot(co.xy ,vec2(time+12.9898,78.233))) * 437.5453);'
    .endl()+'}'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 old=texture2D(tex,texCoord);'
    .endl()+'   vec4 field=texture2D(texField,texCoord);'
    .endl()+'   vec4 newPos=old+field*0.3;'

    .endl()+'   if(newPos.y>=1.0 || newPos.y<=0.0 || newPos.x>=1.0 || newPos.x<=0.0)'
    .endl()+'   {'
    .endl()+'       newPos.x=random(time*texCoord.xy);'
    .endl()+'       newPos.y=random(time*texCoord.xx);'
    .endl()+'       newPos.z=1.0;'
    .endl()+'   }'

    .endl()+'   outColor=vec4(newPos.xyz, 1.0);'
    // .endl()+'   outColor=vec4(field.xyz, 1.0);'
    // .endl()+'   outColor=vec4(texCoord.x*2.0,texCoord.y*2.0,sin(time+texCoord.x)*0.5,1.0);'
    .endl()+'}';



var simTexture=new CGL.Texture(cgl,
    {
        "width":1024,
        "height":1024,
        "isFloatingPointTexture":true,
        "filter":CGL.Texture.FILTER_NEAREST,
        "wrap":CGL.Texture.WRAP_CLAMP_TO_EDGE,
        "name":"simtex vectorfield2d",
    });

// simTexture.setSize(1024,1024);

var shaderSim=new CGL.Shader(cgl);
shaderSim.setSource(shaderSim.getDefaultVertexShader(),srcFrag);
// tex.set(simTexture);
var texSimUni=new CGL.Uniform(shaderSim,'t','tex',5);
var texFieldUni=new CGL.Uniform(shaderSim,'t','texField',6);
var uniTime2=new CGL.Uniform(shaderSim,'f','time',0);
var startTime=Date.now()/1000;
var effect=new CGL.TextureEffect(cgl);

effect.setSourceTexture(simTexture);
var firstTime=true;
simTexture.printInfo();

// draw

var srcHeadVert=''
    .endl()+'UNI float {{mod}}_time;'
    .endl()+'UNI sampler2D {{mod}}_texture;'

    .endl();

var srcBodyVert=''

    .endl()+'float size=1024.0;'
    .endl()+'float tx=mod(attrVertIndex,size)/size;'
    .endl()+'float ty=float(int((attrVertIndex/size)))/size;'
    // .endl()+'   vec2 vec2(tx,ty);'

    .endl()+'vec4 {{mod}}_col=texture2D( {{mod}}_texture, texCoord );' //vec2(tx,ty)

    // .endl()+'{{mod}}_col.xyz-=0.5;'
    // .endl()+'{{mod}}_col.z*=0.1;'

    .endl()+'pos.xyz={{mod}}_col.xyz;'
    // .endl()+'pos.z=0.0;'

    // .endl()+'pos.x=attrVertIndex*0.001;'

    .endl();


var t=null;
render.onTriggered=function()
{

    if(!textureField.get())return;
    // simulation shader

    if(doReset && uniTime)
    {
        doReset=false;
        uniTime2.setValue(0);
        uniTime.setValue(0);
    }

    effect.startEffect();
    t=effect.getCurrentSourceTexture().tex;
    cgl.setShader(shaderSim);

    effect.bind();

    cgl.setTexture(5,t);
    cgl.setTexture(6,textureField.get().tex);

    effect.finish();
    t=effect.getCurrentSourceTexture().tex;

    outSimTex.set(effect.getCurrentSourceTexture());
    cgl.setPreviousShader();
    effect.endEffect();

    cgl.resetViewPort();

    if(cgl.getShader()!=shader)
    {
        if(shader)removeModule();

        shader=cgl.getShader();
        module=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:srcBodyVert
            });

        uniTime=new CGL.Uniform(shader,'f',module.prefix+'_time',0);
        uniTexture=new CGL.Uniform(shader,'t',module.prefix+'_texture',4);
    }

    cgl.setTexture(4,t);

    uniTime2.setValue(op.patch.freeTimer.get());
    uniTime.setValue(op.patch.freeTimer.get());

    next.trigger();
};
