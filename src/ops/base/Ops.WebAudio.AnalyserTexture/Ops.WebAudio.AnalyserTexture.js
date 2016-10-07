op.name="AnalyserTexture";

var refresh=this.addInPort(new Port(this,"refresh",OP_PORT_TYPE_FUNCTION));
var fftArr=this.addInPort(new Port(this, "FFT Array",OP_PORT_TYPE_ARRAY));

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
    .endl()+'varying vec2 texCoord;'
    .endl()+'uniform sampler2D texFFT;'
    .endl()+'uniform float posY;'

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

    effect.startEffect();

    // render background color...
    cgl.setShader(shaderScroll);
    effect.bind();
    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texFFT.tex );
    effect.finish();
    cgl.setPreviousShader();

    texOut.set(effect.getCurrentSourceTexture());

    cgl.setViewPort(prevViewPort[0],prevViewPort[1],prevViewPort[2],prevViewPort[3]);
}

refresh.onTriggered=function()
{
    updateFFT();
    scrollTexture();
    // texOut.set(texFFT);
};

