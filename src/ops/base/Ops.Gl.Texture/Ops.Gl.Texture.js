CABLES.Op.apply(this, arguments);
this.name='texture';
var self=this;
var cgl=this.patch.cgl;

var filename=this.addInPort(new Port(this,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'image' } ));
var tfilter=this.addInPort(new Port(this,"filter",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['nearest','linear','mipmap']}));
var wrap=this.addInPort(new Port(this,"wrap",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['repeat','mirrored repeat','clamp to edge']}));

var textureOut=this.addOutPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE,{preview:true}));

var width=this.addOutPort(new Port(this,"width",OP_PORT_TYPE_VALUE));
var height=this.addOutPort(new Port(this,"height",OP_PORT_TYPE_VALUE));

var flip=this.addInPort(new Port(this,"flip",OP_PORT_TYPE_VALUE,{display:'bool'}));
var unpackAlpha=this.addInPort(new Port(this,"unpackPreMultipliedAlpha",OP_PORT_TYPE_VALUE,{display:'bool'}));
flip.set(false);
unpackAlpha.set(true);

var cgl_filter=0;
var cgl_wrap=0;

var setTempTexture=function()
{
    textureOut.set(CGL.Texture.getTemporaryTexture(cgl,64,cgl_filter,cgl_wrap));
};



var reload=function(nocache)
{
    var url=self.patch.getFilePath(filename.get());
    if(nocache)url+='?rnd='+generateUUID();

    if(  (filename.get() && filename.get().length>1 ))
    {
        // console.log("load texture ",filename.get());
        var tex=CGL.Texture.load(cgl,url,function(err)
        {
            if(err)
            {
                console.log('error loading image');
                setTempTexture();
                self.uiAttr({'error':'could not load texture'});
                return;
            }
            self.uiAttr({'error':null});
            textureOut.val=tex;
            width.set(tex.width);
            height.set(tex.height);

            if(!tex.isPowerOfTwo()) self.uiAttr({warning:'texture dimensions not power of two! - texture filtering will not work.'});
                else self.uiAttr({warning:''});

        },{
            wrap:wrap.get(),
            flip:flip.get(),
            unpackAlpha:unpackAlpha.get(),
            filter:cgl_filter
        });
        textureOut.set(tex);
    }
    else
    {
        setTempTexture();
    }
};

var onFilterChange=function()
{
    if(tfilter.get()=='nearest') cgl_filter=CGL.Texture.FILTER_NEAREST;
    if(tfilter.get()=='linear') cgl_filter=CGL.Texture.FILTER_LINEAR;
    if(tfilter.get()=='mipmap') cgl_filter=CGL.Texture.FILTER_MIPMAP;

    reload();
};

var onWrapChange=function()
{
    if(wrap.get()=='repeat') cgl_wrap=CGL.Texture.WRAP_REPEAT;
    if(wrap.get()=='mirrored repeat') cgl_wrap=CGL.Texture.WRAP_MIRRORED_REPEAT;
    if(wrap.get()=='clamp to edge') cgl_wrap=CGL.Texture.WRAP_CLAMP_TO_EDGE;

    reload();
};

textureOut.onPreviewChanged=function()
{
    if(textureOut.showPreview) CGL.Texture.previewTexture=textureOut.get();
};

this.onFileUploaded=function(fn)
{
    if(filename.get() && filename.get().endsWith(fn))
    {
        console.log('found!');
        reload(true);
    }
};

flip.onValueChange(function(){reload(true);});
filename.onValueChange(reload);

tfilter.onValueChange(onFilterChange);
wrap.onValueChange(onWrapChange);
unpackAlpha.onValueChange(function()
    {
        reload(true);
    });
    
    
    
tfilter.set('mipmap');
wrap.set('repeat');