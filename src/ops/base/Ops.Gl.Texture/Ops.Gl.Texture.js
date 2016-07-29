op.name='texture';

var filename=op.addInPort(new Port(op,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'image' } ));
var tfilter=op.addInPort(new Port(op,"filter",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['nearest','linear','mipmap']}));
var wrap=op.addInPort(new Port(op,"wrap",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['repeat','mirrored repeat','clamp to edge']}));
var flip=op.addInPort(new Port(op,"flip",OP_PORT_TYPE_VALUE,{display:'bool'}));
var unpackAlpha=op.addInPort(new Port(op,"unpackPreMultipliedAlpha",OP_PORT_TYPE_VALUE,{display:'bool'}));

var textureOut=op.addOutPort(new Port(op,"texture",OP_PORT_TYPE_TEXTURE,{preview:true}));
var width=op.addOutPort(new Port(op,"width",OP_PORT_TYPE_VALUE));
var height=op.addOutPort(new Port(op,"height",OP_PORT_TYPE_VALUE));




flip.set(true);
unpackAlpha.set(true);

var cgl=op.patch.cgl;
var cgl_filter=0;
var cgl_wrap=0;
var opInstanced=false;


flip.onValueChange(function(){reload();});
filename.onValueChange(reload);

tfilter.onValueChange(onFilterChange);
wrap.onValueChange(onWrapChange);
unpackAlpha.onValueChange(function(){ reload(); });



var setTempTexture=function()
{
    textureOut.set(CGL.Texture.getTemporaryTexture(cgl,64,cgl_filter,cgl_wrap));
};

this.onLoaded=function()
{
    opInstanced=true;
    reload();
};


function reload(nocache)
{
    if(!opInstanced)return;
    var url=op.patch.getFilePath(filename.get());
    if(nocache)url+='?rnd='+CABLES.generateUUID();

    console.log('startloading ',filename.get());


    if((filename.get() && filename.get().length>1))
    {
        var tex=CGL.Texture.load(cgl,url,
            function(err)
            {
                console.log('tex loaded!!');

                if(err)
                {
                    setTempTexture();
                    op.uiAttr({'error':'could not load texture'});
                    return;
                }
                op.uiAttr({'error':null});
                textureOut.set(tex);
                width.set(tex.width);
                height.set(tex.height);
    
                if(!tex.isPowerOfTwo()) op.uiAttr({warning:'texture dimensions not power of two! - texture filtering will not work.'});
                    else op.uiAttr({warning:''});

            },{
                wrap:cgl_wrap,
                flip:flip.get(),
                unpackAlpha:unpackAlpha.get(),
                filter:cgl_filter
            });
        textureOut.set(null);
        textureOut.set(tex);

    }
    else
    {
        setTempTexture();
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

textureOut.onPreviewChanged=function()
{
    if(textureOut.showPreview) CGL.Texture.previewTexture=textureOut.get();
};

op.onFileUploaded=function(fn)
{
    if(filename.get() && filename.get().endsWith(fn))
    {
        reload(true);
    }
};




tfilter.set('linear');
wrap.set('repeat');