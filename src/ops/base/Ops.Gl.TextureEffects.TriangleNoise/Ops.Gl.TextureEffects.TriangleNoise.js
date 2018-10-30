const render=op.inTrigger("Render");
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const scale=op.inValue("scale",10);
const angle=op.inValue("angle");
const add=op.inValue("Add");
const trigger=op.addOutPort(new CABLES.Port(op,"Next",CABLES.OP_PORT_TYPE_FUNCTION));
const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

const srcFrag=''
    .endl()+'IN vec2 texCoord;'
    .endl()+'UNI float scale;'
    .endl()+'UNI float angle;'
    .endl()+'UNI float ratio;'
    .endl()+'UNI float add;'
    
    .endl()+'float rand(vec2 co)'
    .endl()+'{'
    .endl()+'    return fract(sin(dot(co.xy ,vec2(13.98987,28.533))) * 4758.6453+add*0.1);'
    .endl()+'}'
    
    .endl()+'float GetLocation(vec2 s, float d)'
    .endl()+'{'
    .endl()+'    vec2 f = s*d;'
    .endl()+'    f = f + vec2(0,0.5)*floor(f).x;'
    .endl()+'    s = fract(f);'
    .endl()+'    f = floor(f);'
    
    .endl()+'    d = s.y - 0.5;'
    .endl()+'    float l = abs(d) + 0.5 * s.x;'
    .endl()+'    float ff = f.x+f.y;'
    .endl()+'    f = mix(f, f+sign(d)*vec2(0,0.5), step(0.5, l));'
    .endl()+'    l = mix(ff, ff+sign(d)*0.5, step(0.5, l));'
    
    .endl()+'    float r=mod(rand(f)*2.0,2.0);'
    .endl()+'    if(r>1.0)r=2.0-r;'
    
    .endl()+'    return r;'
    .endl()+'}'
    
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'    vec2 coord=texCoord;'
    .endl()+'    coord.y*=ratio;'
    
    .endl()+'    float sin_factor = sin(angle*0.01745329251);'
    .endl()+'    float cos_factor = cos(angle*0.01745329251);'
    .endl()+'    coord = vec2((coord.x - 0.5) , coord.y - ratio/2.0) * mat2(cos_factor, sin_factor, -sin_factor, cos_factor);'
    
    .endl()+'    float a=GetLocation(coord,scale);'
    .endl()+'    gl_FragColor = vec4(a,a,a,1.);'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);
const addUniform=new CGL.Uniform(shader,'f','add',add);
const scaleUniform=new CGL.Uniform(shader,'f','scale',scale);
const angleUniform=new CGL.Uniform(shader,'f','angle',angle);
const ratioUniform=new CGL.Uniform(shader,'f','ratio',0.57);

var oldRatio=-1;

blendMode.onValueChanged=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    var ratio=cgl.canvasHeight/cgl.canvasWidth;
    if(ratio!=oldRatio)
    {
        ratioUniform.setValue(ratio);
        oldRatio=ratio;
    }

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};

