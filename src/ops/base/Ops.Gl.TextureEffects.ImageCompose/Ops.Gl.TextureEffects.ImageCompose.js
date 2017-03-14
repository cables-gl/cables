op.name='image compose';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var useVPSize=op.addInPort(new Port(op,"use viewport size",OP_PORT_TYPE_VALUE,{ display:'bool' }));
var width=op.addInPort(new Port(op,"width",OP_PORT_TYPE_VALUE));
var height=op.addInPort(new Port(op,"height",OP_PORT_TYPE_VALUE));
// var tfilter=op.addInPort(new Port(op,"filter",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['nearest','linear','mipmap']}));
var tfilter=op.inValueSelect("filter",['nearest','linear','mipmap']);
var twrap=op.inValueSelect("wrap",['clamp to edge','repeat','mirrored repeat']);
var bgAlpha=op.inValueSlider("Background Alpha",1);
var fpTexture=op.inValueBool("HDR");

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var texOut=op.outTexture("texture_out");

texOut.set(null);
var cgl=op.patch.cgl;
var effect=null;

var tex=null;

var w=8,h=8;
var prevViewPort=[0,0,0,0];
var reInitEffect=true;

var bgFrag=''
    .endl()+'precision highp float;'
    .endl()+'uniform float a;'
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   gl_FragColor = vec4(0.0,0.0,0.0,a);'
    .endl()+'}';
var bgShader=new CGL.Shader(cgl,'imgcompose bg');
bgShader.setSource(bgShader.getDefaultVertexShader(),bgFrag);
var uniBgAlpha=new CGL.Uniform(bgShader,'f','a',bgAlpha);

var selectedFilter=CGL.Texture.FILTER_LINEAR;
var selectedWrap=CGL.Texture.WRAP_CLAMP_TO_EDGE;


function initEffect()
{
    if(effect)effect.delete();
    if(tex)tex.delete();

    effect=new CGL.TextureEffect(cgl,{"isFloatingPointTexture":fpTexture.get()});

    tex=new CGL.Texture(cgl,
        {
            "isFloatingPointTexture":fpTexture.get(),
            "filter":selectedFilter,
            "wrap":selectedWrap,
            "width": width.get(),
            "height": height.get(),
        });

    effect.setSourceTexture(tex);
    texOut.set(null);
    // texOut.set(effect.getCurrentSourceTexture());

    reInitEffect=false;
    
    // op.log("reinit effect");
    // tex.printInfo();
}

fpTexture.onChange=function()
{
    reInitEffect=true;
};


function updateResolution()
{
    if(!effect)initEffect();

    if(useVPSize.get())
    {
        w=cgl.getViewPort()[2];
        h=cgl.getViewPort()[3];
    }
    else
    {
        w=(width.get());
        h=(height.get());
    }

    if((w!=tex.width || h!= tex.height) && (w!==0 && h!==0))
    {
        height.set(h);
        width.set(w);
        tex.filter=CGL.Texture.FILTER_LINEAR;
        tex.setSize(w,h);
        
        effect.setSourceTexture(tex);
        // texOut.set(effect.getCurrentSourceTexture());
    }

    if(texOut.get())
        if(!texOut.get().isPowerOfTwo()) op.uiAttr({warning:'texture dimensions not power of two! - texture filtering will not work.'});
            else op.uiAttr({warning:''}); //todo only when needed...

}


useVPSize.onValueChanged=function()
{
    if(useVPSize.get())
    {
        width.onValueChanged=null;
        height.onValueChanged=null;
    }
    else
    {
        width.onValueChanged=updateResolution;
        height.onValueChanged=updateResolution;
    }
    updateResolution();
};


var doRender=function()
{
    if(!effect || reInitEffect)
    {
        initEffect();
    }
    var vp=cgl.getViewPort();
    prevViewPort[0]=vp[0];
    prevViewPort[1]=vp[1];
    prevViewPort[2]=vp[2];
    prevViewPort[3]=vp[3];

    updateResolution();

    cgl.currentTextureEffect=effect;
    effect.setSourceTexture(tex);

    effect.startEffect();

    // render background color...
    cgl.setShader(bgShader);
    cgl.currentTextureEffect.bind();
    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();



    trigger.trigger();
    texOut.set(effect.getCurrentSourceTexture());
    
    effect.endEffect();

    cgl.setViewPort(prevViewPort[0],prevViewPort[1],prevViewPort[2],prevViewPort[3]);

};


function onWrapChange()
{
    if(twrap.get()=='repeat') selectedWrap=CGL.Texture.WRAP_REPEAT;
    if(twrap.get()=='mirrored repeat') selectedWrap=CGL.Texture.WRAP_MIRRORED_REPEAT;
    if(twrap.get()=='clamp to edge') selectedWrap=CGL.Texture.WRAP_CLAMP_TO_EDGE;

    reInitEffect=true;
    updateResolution();
}

twrap.set('clamp to edge');
twrap.onValueChanged=onWrapChange;




function onFilterChange()
{
    if(tfilter.get()=='nearest') selectedFilter=CGL.Texture.FILTER_NEAREST;
    if(tfilter.get()=='linear')  selectedFilter=CGL.Texture.FILTER_LINEAR;
    // if(tfilter.get()=='mipmap')  selectedFilter=CGL.Texture.FILTER_MIPMAP;

    reInitEffect=true;
    updateResolution();
    // effect.setSourceTexture(tex);
    // updateResolution();
}

tfilter.set('linear');
tfilter.onValueChanged=onFilterChange;

useVPSize.set(true);
render.onTriggered=doRender;

width.set(640);
height.set(360);