var render=op.inTrigger("Render");
var blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
var amount=op.inValueSlider("Amount",1);
var trigger=op.outTrigger("Trigger");
var strength=op.inValue("strength",2);
var threshold=op.inValueSlider("threshold",0.35);

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
//op.onLoaded=shader.compile;
var amountUniform=new CGL.Uniform(shader,'f','amount',amount);

var srcFrag=''
    .endl()+'IN vec2 texCoord;'
    .endl()+'UNI sampler2D tex;'
    .endl()+'UNI float strength;'
    .endl()+'UNI float amount;'
    .endl()+'UNI float width;'
    .endl()+'UNI float height;'
    .endl()+'UNI float threshold;'
    .endl()+''

    .endl()+'const vec4 lumcoeff = vec4(0.299,0.587,0.114, 0.);'

    .endl()+'   float getLuminance( vec4 color ) {'
    .endl()+'       return (0.2126*color.r + 0.7152*color.g + 0.0722*color.b);'
    .endl()+'   }'
    +CGL.TextureEffect.getBlendCode()

    .endl()+'   float adjustFrag( mat4 adjustments,float val, vec2 coord ) {'
    .endl()+'       vec2 coordMod = mod(vec2(coord.x*width,coord.y*height), 4.0);'
    .endl()+'       int xMod = int(coordMod.x);'
    .endl()+'       int yMod = int(coordMod.y);'

    .endl()+'       vec4 col;'
    .endl()+'       if (xMod == 0) col = adjustments[0];'
    .endl()+'       else if (xMod == 1) col = adjustments[1];'
    .endl()+'   	else if (xMod == 2) col = adjustments[2];'
    .endl()+'   	else if (xMod == 3) col = adjustments[3];'

    .endl()+'       float adjustment;'
    .endl()+'       if (yMod == 0) adjustment = col.x;'
    .endl()+'       else if (yMod == 1) adjustment = col.y;'
    .endl()+'       else if (yMod == 2) adjustment = col.z;'
    .endl()+'       else if (yMod == 3) adjustment = col.w;'

    .endl()+'       return val + (val * adjustment);'
    .endl()+'   }'

    .endl()+'void main()'
    .endl()+'{'

    .endl()+'   mat4 adjustments = ((mat4('
    .endl()+'       1, 13, 4, 16,'
    .endl()+'       9, 5, 12, 8,'
    .endl()+'       3, 15, 2, 14,'
    .endl()+'       11, 7, 10, 6'
    .endl()+'   ) - 8.) *  1.0 / strength);'

    .endl()+'   vec4 base=texture2D(tex,texCoord);'
    .endl()+'   vec4 color;'

    .endl()+'    float lum = getLuminance(base);'
    .endl()+'    lum = adjustFrag(adjustments,lum, texCoord.xy);'



    .endl()+'    if (lum > threshold) {'
    .endl()+'        color = vec4(1, 1, 1, 1);'
    .endl()+'    } else {'
    .endl()+'    	color = vec4(0, 0, 0, 1);'
    .endl()+'    }'


    .endl()+'   vec4 col=vec4( _blend(base.rgb,color.rgb) ,1.0);'
    .endl()+'   col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);'
    .endl()+'  	gl_FragColor = col;'



    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var strengthUniform=new CGL.Uniform(shader,'f','strength',strength);
var uniWidth=new CGL.Uniform(shader,'f','width',0);
var uniHeight=new CGL.Uniform(shader,'f','height',0);
var unithreshold=new CGL.Uniform(shader,'f','threshold',threshold);

blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};


render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;


    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();


    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

    /* --- */cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();



    trigger.trigger();
};
