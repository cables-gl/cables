op.name="AnalyserTexture";

var refresh=op.addInPort(new Port(op,"refresh",CABLES.OP_PORT_TYPE_FUNCTION));
var fftArr=op.addInPort(new Port(op, "FFT Array",CABLES.OP_PORT_TYPE_ARRAY));


var amount=op.inValueSlider("Blur Amount");

var texOut=op.outTexture("texture_out");


var fftTexture=null;
var fftPosition=0;

var cgl=op.patch.cgl;
var texFFT=new CGL.Texture(cgl,
    {
        "wrap":CGL.Texture.CLAMP_TO_EDGE
    });
var tex=new CGL.Texture(cgl,
    {
        "wrap":CGL.Texture.CLAMP_TO_EDGE
    });

var data=[];

var line=0;
var height=256;

var buffer=new Uint8Array();

function updateFFT()
{
    var arr=fftArr.get();
    if(!arr)return;
    var width=arr.length;
    if(!width)return;

    if(data.length===0 || data.length!=width*4)
    {
        data.length=width*4;
        buffer=new Uint8Array(width*height*4);
    }
    line++;
    if(line>=height) line=0;

    fftPosition=line/height;

    for(var i=0;i<width;i++)
    {
        data[i*4+0]=arr[i];
        data[i*4+1]=arr[i];
        data[i*4+2]=arr[i];
        data[i*4+3]=255;
    }

    buffer.set(data,line*width*4);

    if(texFFT.width!=width || texFFT.height!=height)
    {
        texFFT.setSize(width,height);
        effect.setSourceTexture(texFFT);
    }

    texFFT.initFromData(
        buffer,
        width,
        height,
        CGL.Texture.FILTER_LINEAR,
        CGL.Texture.CLAMP_TO_EDGE);
}

// ----------

var scrollShader=''
    .endl()+'precision highp float;'
    .endl()+'IN vec2 texCoord;'
    .endl()+'UNI sampler2D texFFT;'
    .endl()+'UNI float posY;'

    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=texture2D(texFFT,vec2(texCoord.x,texCoord.y-posY));'
    // .endl()+'   col.r=1.0;'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

var shaderScroll=new CGL.Shader(cgl,'AnalyserTexture');
shaderScroll.setSource(shaderScroll.getDefaultVertexShader(),scrollShader);

var uniPosition=new CGL.Uniform(shaderScroll,'f','posY',0);


var effect=new CGL.TextureEffect(cgl,{});

var prevViewPort=[0,0,0,0];

function scrollTexture()
{
    var vp=cgl.getViewPort();
    prevViewPort[0]=vp[0];
    prevViewPort[1]=vp[1];
    prevViewPort[2]=vp[2];
    prevViewPort[3]=vp[3];

    uniPosition.setValue(fftPosition);


    // render background color...
    cgl.setShader(shaderScroll);
    effect.startEffect();
    effect.bind();
    /* --- */cgl.setTexture(0, texFFT.tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texFFT.tex );
    effect.finish();
    cgl.setPreviousShader();

    texOut.set(effect.getCurrentSourceTexture());

    effect.endEffect();

    cgl.setViewPort(prevViewPort[0],prevViewPort[1],prevViewPort[2],prevViewPort[3]);
}

// ------------------

var shaderBlur=new CGL.Shader(cgl);

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'IN vec2 texCoord;'
    .endl()+'UNI sampler2D tex;'
    .endl()+'UNI float dirX;'
    .endl()+'UNI float dirY;'
    .endl()+'UNI float amount;'
    .endl()+'UNI sampler2D texture;'

    .endl()+'vec2 delta=vec2(dirX*amount*0.2,dirY*amount*0.2);'

    .endl()+'float random(vec3 scale, float seed)'
    .endl()+'{'
    .endl()+'    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);'
    .endl()+'}'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'    vec4 color = vec4(0.0);'
    .endl()+'    float total = 0.0;'
    .endl()+'    '
    // .endl()+'    /* randomize the lookup values to hide the fixed number of samples */'
    .endl()+'    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);'

    .endl()+'    for (float t = -30.0; t <= 30.0; t++) {'
    .endl()+'        float percent = (t + offset - 0.5) / 30.0;'
    .endl()+'        float weight = 1.0 - abs(percent);'
    .endl()+'        vec4 sample = texture2D(texture, texCoord + delta * percent);'

    // .endl()+'        /* switch to pre-multiplied alpha to correctly blur transparent images */'
    .endl()+'        sample.rgb *= sample.a;'

    .endl()+'        color += sample * weight;'
    .endl()+'        total += weight;'
    .endl()+'    }'

    .endl()+'    gl_FragColor = color / total;'

    // .endl()+'    /* switch back from pre-multiplied alpha */'
    .endl()+'    gl_FragColor.rgb /= gl_FragColor.a + 0.00001;'
    .endl()+'}';


shaderBlur.setSource(shaderBlur.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shaderBlur,'t','tex',0);
var uniDirX=new CGL.Uniform(shaderBlur,'f','dirX',0);
var uniDirY=new CGL.Uniform(shaderBlur,'f','dirY',0);

var uniWidth=new CGL.Uniform(shaderBlur,'f','width',0);
var uniHeight=new CGL.Uniform(shaderBlur,'f','height',0);

var uniAmount=new CGL.Uniform(shaderBlur,'f','amount',amount.get());
amount.onValueChange(function(){ uniAmount.setValue(amount.get()); });

function blurTexture()
{
    cgl.setShader(shaderBlur);

    if(!effect.getCurrentSourceTexture())return;

    uniWidth.setValue(effect.getCurrentSourceTexture().width);
    uniHeight.setValue(effect.getCurrentSourceTexture().height);

    // first pass
    // if(dir===0 || dir==2)
    {
        effect.startEffect();

        effect.bind();
        /* --- */cgl.setTexture(0, effect.getCurrentSourceTexture().tex );
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, effect.getCurrentSourceTexture().tex );

        uniDirX.setValue(0.0);
        uniDirY.setValue(1.0);

        effect.finish();
        effect.endEffect();
    }

    // second pass
    // if(dir===0 || dir==1)
    {
        effect.startEffect();

        effect.bind();
        /* --- */cgl.setTexture(0, effect.getCurrentSourceTexture().tex );
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, effect.getCurrentSourceTexture().tex );

        uniDirX.setValue(1.0);
        uniDirY.setValue(0.0);

        effect.finish();
        effect.endEffect();
    }

    cgl.setPreviousShader();

}

// ---------------------


var shaderMirror=new CGL.Shader(cgl);

var doMirror=op.inValueBool("Mirror");
var mirrorWidth=op.addInPort(new Port(op,"mirror width",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));
var mirrorOffset=op.addInPort(new Port(op,"mirror offset",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));
var mirrorFlip=op.addInPort(new Port(op,"mirror flip",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));

mirrorFlip.set(true);
mirrorWidth.set(1);
var srcFragMirror=''
    .endl()+'precision highp float;'
    .endl()+'IN vec2 texCoord;'

    .endl()+'UNI sampler2D tex;'
    .endl()+'UNI float width;'
    .endl()+'UNI float flip;'
    .endl()+'UNI float offset;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   float axis=0.0;'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'

    .endl()+'   float x=(texCoord.x);'
    .endl()+'   if(texCoord.x>=0.5)x=1.0-texCoord.x;'

    .endl()+'   x*=width*2.0;'
    .endl()+'   if(flip==1.0)x=1.0-x;'
    .endl()+'   x*=1.0-offset;'

    .endl()+'   col=texture2D(tex,vec2(x,texCoord.y) );'

    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shaderMirror.setSource(shaderMirror.getDefaultVertexShader(),srcFragMirror);
var textureUniformMirror=new CGL.Uniform(shaderMirror,'t','tex',0);

var uniWidthMirror=new CGL.Uniform(shaderMirror,'f','width',mirrorWidth);
var uniOffsetMirror=new CGL.Uniform(shaderMirror,'f','offset',mirrorOffset);
var uniFlipMirror=new CGL.Uniform(shaderMirror,'f','flip',0);

mirrorFlip.onValueChanged=function()
{
    if(mirrorFlip.get())uniFlipMirror.setValue(1);
        else uniFlipMirror.setValue(0);
};


function mirrorTexture()
{
    cgl.setShader(shaderMirror);
    effect.startEffect();
    effect.bind();

    /* --- */cgl.setTexture(0, effect.getCurrentSourceTexture().tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, effect.getCurrentSourceTexture().tex );

    effect.finish();
    effect.endEffect();

    cgl.setPreviousShader();

};



refresh.onTriggered=function()
{
    if(!fftArr.get())return;
    updateFFT();
    scrollTexture();
    // if(doMirror.get())mirrorTexture();
    // blurTexture();
    texOut.set(texFFT);
};
