const render=op.addInPort(new CABLES.Port(op,"Render",CABLES.OP_PORT_TYPE_FUNCTION));
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const numX=op.inValue("Num X",10);
const numY=op.inValue("Num Y",10);
const addX=op.inValue("X",0);
const addY=op.inValue("Y",0);
const addZ=op.inValue("Z",0);
const trigger=op.addOutPort(new CABLES.Port(op,"Next",CABLES.OP_PORT_TYPE_FUNCTION));

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

const amountUniform=new CGL.Uniform(shader,'f','amount',amount);
const timeUniform=new CGL.Uniform(shader,'f','time',1.0);

const srcFrag=''
    .endl()+'IN vec2 texCoord;'
    .endl()+'UNI sampler2D tex;'

    .endl()+'UNI float amount;'
    .endl()+'UNI float numX;'
    .endl()+'UNI float numY;'
    .endl()+'UNI float addX;'
    .endl()+'UNI float addY;'
    .endl()+'UNI float addZ;'
    
    .endl()+'float random(vec2 co)'
    .endl()+'{'
    .endl()+'   return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * (437511.5453+addZ));'
    .endl()+'}'

    +CGL.TextureEffect.getBlendCode()

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec2 seed=vec2(floor( texCoord.x*numX+addX),floor( texCoord.y*numY+addY));'

    .endl()+'   float r=random( seed );'
    .endl()+'   vec4 rnd=vec4( r,r,r,1.0 );'
    .endl()+'   vec4 base=texture2D(tex,texCoord);'
    
    .endl()+'   vec4 col=vec4( _blend(base.rgb,rnd.rgb) ,1.0);'
    .endl()+'   col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);'

    .endl()+'   gl_FragColor = col;'
    .endl()+'}';


shader.setSource(shader.getDefaultVertexShader(),srcFrag);
const textureUniform=new CGL.Uniform(shader,'t','tex',0);
numX.uniform==new CGL.Uniform(shader,'f','numX',numX);
numY.uniform==new CGL.Uniform(shader,'f','numY',numY);
addX.uniform==new CGL.Uniform(shader,'f','addX',addX);
addY.uniform==new CGL.Uniform(shader,'f','addY',addY);
addZ.uniform==new CGL.Uniform(shader,'f','addZ',addZ);

blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};

