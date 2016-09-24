op.name='image compose';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var useVPSize=op.addInPort(new Port(op,"use viewport size",OP_PORT_TYPE_VALUE,{ display:'bool' }));
var width=op.addInPort(new Port(op,"width",OP_PORT_TYPE_VALUE));
var height=op.addInPort(new Port(op,"height",OP_PORT_TYPE_VALUE));
// var tfilter=op.addInPort(new Port(op,"filter",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['nearest','linear','mipmap']}));
var tfilter=op.inValueSelect("filter",['nearest','linear','mipmap']);
var bgAlpha=op.inValueSlider("Background Alpha",0);
var fpTexture=op.inValueBool("HDR");

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
// var texOut=op.addOutPort(new Port(op,"texture_out",OP_PORT_TYPE_TEXTURE,{preview:true}));
var texOut=op.outTexture("texture_out");

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



function initEffect()
{
    if(effect)effect.delete();
    if(tex)tex.delete();

    effect=new CGL.TextureEffect(cgl,{isFloatingPointTexture:fpTexture.get()});

    tex=new CGL.Texture(cgl,
        {
            isFloatingPointTexture:fpTexture.get(),
            filter:CGL.Texture.FILTER_LINEAR
        });

    effect.setSourceTexture(tex);
    texOut.set(effect.getCurrentSourceTexture());

    reInitEffect=false;

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
        tex.setSize(w,h);

        effect.setSourceTexture(tex);
        texOut.set(effect.getCurrentSourceTexture());
    }

    if(texOut.get())
        if(!texOut.get().isPowerOfTwo()) op.uiAttr({warning:'texture dimensions not power of two! - texture filtering will not work.'});
            else op.uiAttr({warning:''});

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

    cgl.setViewPort(prevViewPort[0],prevViewPort[1],prevViewPort[2],prevViewPort[3]);

};



function onFilterChange()
{
    var newFilter=tex.filter;
    if(tfilter.get()=='nearest') newFilter=CGL.Texture.FILTER_NEAREST;
    if(tfilter.get()=='linear')  newFilter=CGL.Texture.FILTER_LINEAR;
    if(tfilter.get()=='mipmap')  newFilter=CGL.Texture.FILTER_MIPMAP;
    if(newFilter!=tex.filter)tex.width=0;
    tex.filter=newFilter;

    effect.setSourceTexture(tex);
    updateResolution();
}

tfilter.set('linear');
tfilter.onValueChanged=onFilterChange;

useVPSize.set(true);
render.onTriggered=doRender;

width.set(640);
height.set(360);
