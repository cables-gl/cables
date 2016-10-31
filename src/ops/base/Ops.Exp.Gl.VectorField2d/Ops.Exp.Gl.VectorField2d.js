op.name="VectorField2d";

var render=op.inFunction("Render");
var reset=op.inFunction("Reset");
var next=op.outFunction("Next");
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

var cgl=op.patch.cgl;
var uniTime,uniTexture;

render.onLinkChanged=removeModule;


var doReset=true;
reset.onTriggered=function()
{
    doReset=true;
};


// simulation...

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'uniform sampler2D texField;'
    .endl()+'uniform float time;'
    .endl()+'varying vec2 texCoord;'
    
    .endl()+'float c;'
    .endl()+'float c1;'
    .endl()+'float c2;'
    

    .endl()+'float random(vec2 co)'
    .endl()+'{'
    .endl()+'    return fract(sin(dot(co.xy ,vec2(time+12.9898,78.233))) * 43758.5453);'
    .endl()+'}'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 old = texture2D( tex, texCoord );'

    .endl()+'       c =random((0.2323)*gl_FragCoord.xy);'
    .endl()+'       c1=random(c*gl_FragCoord.xy);'
    .endl()+'       c2=random(c1*gl_FragCoord.xy);'

    .endl()+'   vec4 field = texture2D( texField, vec2( old.r,old.g ));'
    .endl()+'   field -= 0.5; '
    .endl()+'   field *=0.003;'

    .endl()+'   if(time!=0.0)'
    .endl()+'   {'
    .endl()+'       c =old.r;'
    .endl()+'       c1=old.g;'
    .endl()+'       c2=old.b;'
    .endl()+'   }'


    // .endl()+'   if(c>15.0)c=random((0.2323)*gl_FragCoord.xy)*0.5;'

    .endl()+'   float x=( c+field.r );'
    .endl()+'   float y=( c1+field.g );'
    .endl()+'   float z=( (field.b)*31.1+0.5 );'
    
    .endl()+'   if(y>=1.0 || y<=0.0 || x>=1.0 || x<=0.0)'
    .endl()+'   {'
    .endl()+'       x=random(time*gl_FragCoord.xy);'
    .endl()+'       y=random(x*gl_FragCoord.xy);'
    .endl()+'   }'
    
    .endl()+'   gl_FragColor = vec4( x, y , z, 1.0);'
    .endl()+'}';



var simTexture=new CGL.Texture(cgl,{
    "isFloatingPointTexture":true,
    "filter":CGL.Texture.FILTER_NEAREST,
    "name":"simtex vectorfield2d",

});
simTexture.setSize(1024,1024);

var shaderSim=new CGL.Shader(cgl);
shaderSim.setSource(shaderSim.getDefaultVertexShader(),srcFrag);
// tex.set(simTexture);
var texSimUni=new CGL.Uniform(shaderSim,'t','tex',5);
var texFieldUni=new CGL.Uniform(shaderSim,'t','texField',6);
var uniTime2=new CGL.Uniform(shaderSim,'f','time',0);
var startTime=Date.now()/1000;

var effect=new CGL.TextureEffect(cgl,{fp:true});

effect.setSourceTexture(simTexture);
var firstTime=true;
simTexture.printInfo();

// draw

var srcHeadVert=''
    .endl()+'uniform float {{mod}}_time;'
    .endl()+'uniform sampler2D {{mod}}_texture;'
    .endl()+'attribute float attrVertIndex;'

    .endl();

var srcBodyVert=''

    .endl()+'   float size=1024.0;'
    .endl()+'   float tx = mod(attrVertIndex,size)/size;'
    .endl()+'   float ty = float( int((attrVertIndex/size)) )/size;'
    // .endl()+'   vec2 vec2(tx,ty);'

    .endl()+'vec4 {{mod}}_col=texture2D( {{mod}}_texture, vec2(tx,ty) );'

    .endl()+'{{mod}}_col.xyz-=0.5;'

    .endl()+'pos.xyz={{mod}}_col.xyz;'
    // .endl()+'pos.z=0.0;'
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
    cgl.setShader(shaderSim);
    t=effect.getCurrentSourceTexture().tex;
    effect.bind();

    cgl.setTexture(5,t);
    cgl.setTexture(6,textureField.get().tex);

    effect.finish();
    t=effect.getCurrentSourceTexture().tex;
    outSimTex.set(effect.getCurrentSourceTexture());
    effect.endEffect();
    
    cgl.setPreviousShader();

    cgl.resetViewPort();
    
    
    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();
        module=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:srcBodyVert
            });

        uniTime=new CGL.Uniform(shader,'f',module.prefix+'_time',0);
        uniTexture=new CGL.Uniform(shader,'t',module.prefix+'_texture',4);
        // setDefines();
    }

    // if(texture.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE4);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, t);
    }

    uniTime2.setValue(op.patch.freeTimer.get());
    uniTime.setValue(op.patch.freeTimer.get());
    next.trigger();
};














