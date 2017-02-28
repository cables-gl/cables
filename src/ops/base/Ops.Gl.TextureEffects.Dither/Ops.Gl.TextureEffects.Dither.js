op.name="Dither";

var render=op.inFunction("Render");
var trigger=op.outFunction("Trigger");

var amount=op.inValue("amount",2);
var threshold=op.inValueSlider("threshold",0.35);

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'varying vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'uniform float amount;'
    .endl()+'uniform float width;'
    .endl()+'uniform float height;'
    .endl()+'uniform float threshold;'
    .endl()+''

    .endl()+'vec4 lumcoeff = vec4(0.299,0.587,0.114, 0.);'

    .endl()+'   float mult = 1.0 / amount;'
    .endl()+'   mat4 adjustments = (mat4('
    .endl()+'       1, 13, 4, 16,'
    .endl()+'       9, 5, 12, 8,'
    .endl()+'       3, 15, 2, 14,'
    .endl()+'       11, 7, 10, 6'
    .endl()+'   ) - 8.) * mult;'
    
    .endl()+'   float getLuminance( vec4 color ) {'
    .endl()+'       return (0.2126*color.r + 0.7152*color.g + 0.0722*color.b);'
    .endl()+'   }'
    
    .endl()+'   float adjustFrag( float val, vec2 coord ) {'
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
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
    .endl()+'   col=texture2D(tex,texCoord);'

    .endl()+'    float vidLum = getLuminance(col);'
    .endl()+'    vidLum = adjustFrag(vidLum, texCoord.xy);'

    .endl()+'    if (vidLum > threshold) {'
    .endl()+'        gl_FragColor = vec4(1, 1, 1, 1);'
    .endl()+'    } else {'
    .endl()+'    	gl_FragColor = vec4(0, 0, 0, 1);'
    .endl()+'    }'


    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var amountUniform=new CGL.Uniform(shader,'f','amount',amount);
var uniWidth=new CGL.Uniform(shader,'f','width',0);
var uniHeight=new CGL.Uniform(shader,'f','height',0);
var unithreshold=new CGL.Uniform(shader,'f','threshold',threshold);


render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;


    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();


    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();
    
    

    trigger.trigger();
};
