var render=op.addInPort(new Port(op,"Render",OP_PORT_TYPE_FUNCTION));

var blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
var amount=op.inValueSlider("Amount",1);

var numX=op.inValue("Num X",10);
var numY=op.inValue("Num Y",10);

var addX=op.inValue("X",0);
var addY=op.inValue("Y",0);

var addZ=op.inValue("Z",0);

var trigger=op.addOutPort(new Port(op,"Next",OP_PORT_TYPE_FUNCTION));


var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

var amountUniform=new CGL.Uniform(shader,'f','amount',amount);
var timeUniform=new CGL.Uniform(shader,'f','time',1.0);

var srcFrag=''
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  IN vec2 texCoord;'
    .endl()+'  UNI sampler2D tex;'
    .endl()+'#endif'

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
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
numX.uniform==new CGL.Uniform(shader,'f','numX',numX);
numY.uniform==new CGL.Uniform(shader,'f','numY',numY);
addX.uniform==new CGL.Uniform(shader,'f','addX',addX);
addY.uniform==new CGL.Uniform(shader,'f','addY',addY);
addZ.uniform==new CGL.Uniform(shader,'f','addZ',addZ);

blendMode.onValueChanged=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;


    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};

