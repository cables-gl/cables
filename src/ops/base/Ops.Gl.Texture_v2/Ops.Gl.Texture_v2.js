const
    filename=op.inUrl("File","image"),
    tfilter=op.inSwitch("Filter",['nearest','linear','mipmap']),
    wrap=op.inValueSelect("Wrap",['repeat','mirrored repeat','clamp to edge'],"clamp to edge"),
    aniso=op.inSwitch("Anisotropic",[0,1,2,4,8,16],0),
    flip=op.inValueBool("Flip",false),
    unpackAlpha=op.inValueBool("Pre Multiplied Alpha",false),
    active=op.inValueBool("Active",true),
    textureOut=op.outTexture("Texture"),
    width=op.outValue("Width"),
    height=op.outValue("Height"),
    ratio=op.outValue("Aspect Ratio"),
    loaded=op.outValue("Loaded");

op.setPortGroup("Size",[width,height]);

unpackAlpha.hidePort();

op.toWorkPortsNeedToBeLinked(textureOut);

const cgl=op.patch.cgl;

var loadedFilename=null;
var loadingId=null;
var tex=null;
var cgl_filter=0;
var cgl_wrap=0;
var cgl_aniso=0;
var timedLoader=0;

filename.onChange=flip.onChange=function(){reloadSoon();};
aniso.onChange=tfilter.onChange=onFilterChange;
wrap.onChange=onWrapChange;
unpackAlpha.onChange=function(){ reloadSoon(); };

loaded.set(false);

tfilter.set('mipmap');
wrap.set('repeat');

textureOut.set(CGL.Texture.getEmptyTexture(cgl));

active.onChange=function()
{
    if(active.get())
    {
        if(loadedFilename!=filename.get()) realReload();
    }
    else textureOut.set(CGL.Texture.getEmptyTexture(cgl));
};

var setTempTexture=function()
{
    var t=CGL.Texture.getTempTexture(cgl);
    textureOut.set(t);
};

function reloadSoon(nocache)
{
    clearTimeout(timedLoader);
    timedLoader=setTimeout(function()
    {
        realReload(nocache);
    },30);
}

function realReload(nocache)
{
    if(!active.get())return;
    if(!loadingId)loadingId=cgl.patch.loading.start('textureOp',filename.get());

    var url=op.patch.getFilePath(String(filename.get()));
    if(nocache)url+='?rnd='+CABLES.generateUUID();


    loadedFilename=filename.get();

    if((filename.get() && filename.get().length>1))
    {
        loaded.set(false);

        op.setUiAttrib({"extendTitle":CABLES.basename(url)});

        if(tex)tex.delete();
        tex=CGL.Texture.load(cgl,url,
            function(err)
            {
                if(err)
                {
                    setTempTexture();
                    console.log(err);
                    op.setUiError('urlerror','could not load texture:<br/>"'+filename.get()+'"',2);
                    cgl.patch.loading.finished(loadingId);
                    return;
                }
                else op.setUiError('urlerror',null);
                textureOut.set(tex);
                width.set(tex.width);
                height.set(tex.height);
                ratio.set(tex.width/tex.height);

                if(!tex.isPowerOfTwo())  op.setUiError('npot','Texture dimensions not power of two! - Texture filtering will not work in WebGL 1.',0);
                else op.setUiError('npot',null);

                textureOut.set(null);
                textureOut.set(tex);

            },{
                anisotropic:cgl_aniso,
                wrap:cgl_wrap,
                flip:flip.get(),
                unpackAlpha:unpackAlpha.get(),
                filter:cgl_filter
            });

        textureOut.set(null);
        textureOut.set(tex);

        loaded.set(true);

        cgl.patch.loading.finished(loadingId);
    }
    else
    {
        cgl.patch.loading.finished(loadingId);
        setTempTexture();
    }
}

function onFilterChange()
{
    if(tfilter.get()=='nearest') cgl_filter=CGL.Texture.FILTER_NEAREST;
    else if(tfilter.get()=='linear') cgl_filter=CGL.Texture.FILTER_LINEAR;
    else if(tfilter.get()=='mipmap') cgl_filter=CGL.Texture.FILTER_MIPMAP;
    else if(tfilter.get()=='Anisotropic') cgl_filter=CGL.Texture.FILTER_ANISOTROPIC;

    cgl_aniso=parseFloat(aniso.get());

    reloadSoon();
}

function onWrapChange()
{
    if(wrap.get()=='repeat') cgl_wrap=CGL.Texture.WRAP_REPEAT;
    if(wrap.get()=='mirrored repeat') cgl_wrap=CGL.Texture.WRAP_MIRRORED_REPEAT;
    if(wrap.get()=='clamp to edge') cgl_wrap=CGL.Texture.WRAP_CLAMP_TO_EDGE;

    reloadSoon();
}

op.onFileChanged=function(fn)
{
    if(filename.get() && filename.get().indexOf(fn)>-1)
    {
        textureOut.set(null);
        textureOut.set(CGL.Texture.getTempTexture(cgl));
        realReload(true);
    }
};

