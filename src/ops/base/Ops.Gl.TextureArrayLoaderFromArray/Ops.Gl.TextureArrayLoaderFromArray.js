var filenames=op.inArray("urls");

var tfilter=op.inValueSelect("filter",['nearest','linear','mipmap']);
var wrap=op.inValueSelect("wrap",['repeat','mirrored repeat','clamp to edge'],"clamp to edge");
var flip=op.addInPort(new CABLES.Port(op,"flip",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));
var unpackAlpha=op.addInPort(new CABLES.Port(op,"unpackPreMultipliedAlpha",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));

var arrOut=op.outArray('TextureArray');

// var textureOut=op.outTexture("texture");
var width=op.addOutPort(new CABLES.Port(op,"width",CABLES.OP_PORT_TYPE_VALUE));
var height=op.addOutPort(new CABLES.Port(op,"height",CABLES.OP_PORT_TYPE_VALUE));
var loading=op.addOutPort(new CABLES.Port(op,"loading",CABLES.OP_PORT_TYPE_VALUE));
var ratio=op.outValue("Aspect Ratio");

flip.set(false);
unpackAlpha.set(false);

var cgl=op.patch.cgl;
var cgl_filter=0;
var cgl_wrap=0;
var loadingId=null;
var arr=[];
arrOut.set(arr);

flip.onChange=function(){reload();};
filenames.onChange=reload;

tfilter.onChange=onFilterChange;
wrap.onChange=onWrapChange;
unpackAlpha.onChange=function(){ reload(); };

var timedLoader=0;

var setTempTexture=function()
{
    var t=CGL.Texture.getTempTexture(cgl);
    // textureOut.set(t);
};

function reload(nocache)
{
    clearTimeout(timedLoader);
    timedLoader=setTimeout(function()
    {
        realReload(nocache);
    },30);
}

function loadImage(_i,_url,nocache,cb)
{
    var url=_url;
    var i=_i;
    if(!url)return;
    // url=url.replace("XXX",i);

    // console.log(url);

    url=op.patch.getFilePath(url);
    if(nocache)url+='?rnd='+CABLES.generateUUID();

    // if((filename.get() && filename.get().length>1))
    {
        loading.set(true);

        var tex=CGL.Texture.load(cgl,url,
            function(err)
            {
                // console.log('tex loaded!!');

                if(err)
                {
                    setTempTexture();
                    op.uiAttr({'error':'could not load texture "'+url+'"'});
                    if(cb)cb();
                    return;
                }
                else op.uiAttr({'error':null});
                // textureOut.set(tex);
                width.set(tex.width);
                height.set(tex.height);
                ratio.set(tex.width/tex.height);


                arr[i]=tex;
                if(!tex.isPowerOfTwo()) op.uiAttr(
                    {
                        hint:'texture dimensions not power of two! - texture filtering will not work.',
                        warning:null
                    });
                    else op.uiAttr(
                        {
                            hint:null,
                            warning:null
                        });

                // textureOut.set(null);
                // textureOut.set(tex);

                // tex.printInfo();
                arrOut.set(null);
                arrOut.set(arr);
                if(cb)cb();

            },{
                wrap:cgl_wrap,
                flip:flip.get(),
                unpackAlpha:unpackAlpha.get(),
                filter:cgl_filter
            });


        // textureOut.set(null);
        // textureOut.set(tex);

        // if(!textureOut.get() && nocache)
        // {
        // }
        loading.set(false);
    }


}

function realReload(nocache)
{
    var files=filenames.get();

    if(!files||files.length==0)return;

    if(loadingId)cgl.patch.loading.finished(loadingId);
    loadingId=cgl.patch.loading.start('texturearray',CABLES.uuid());

    // arr.length=files.length;


    for(var i=0;i<files.length;i++)
    {
        arr[i]=CGL.Texture.getEmptyTexture(cgl);
        console.log('load',files[i]);
        var cb=null;
        if(i==files.length-1)cb=function()
            {
                cgl.patch.loading.finished(loadingId);
                console.log('loaded all');
            };
        loadImage(i,files[i],nocache,cb);
    }
}

function onFilterChange()
{
    if(tfilter.get()=='nearest') cgl_filter=CGL.Texture.FILTER_NEAREST;
    if(tfilter.get()=='linear') cgl_filter=CGL.Texture.FILTER_LINEAR;
    if(tfilter.get()=='mipmap') cgl_filter=CGL.Texture.FILTER_MIPMAP;

    reload();
}

function onWrapChange()
{
    if(wrap.get()=='repeat') cgl_wrap=CGL.Texture.WRAP_REPEAT;
    if(wrap.get()=='mirrored repeat') cgl_wrap=CGL.Texture.WRAP_MIRRORED_REPEAT;
    if(wrap.get()=='clamp to edge') cgl_wrap=CGL.Texture.WRAP_CLAMP_TO_EDGE;

    reload();
}

op.onFileChanged=function(fn)
{
    // if(filename.get() && filename.get().indexOf(fn)>-1)
    // {
    //     textureOut.set(null);
    //     textureOut.set(CGL.Texture.getTempTexture(cgl));

    //     realReload(true);
    // }
};


tfilter.set('linear');
wrap.set('repeat');

