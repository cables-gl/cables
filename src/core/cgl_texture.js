
var CGL=CGL || {};

CGL.Texture=function(__cgl,options)
{
    if(!__cgl) throw "no cgl";

    this._cgl=__cgl;
    this.tex = this._cgl.gl.createTexture();
    this.width = 0;
    this.height = 0;
    this.flip = true;
    this.filter = CGL.Texture.FILTER_NEAREST;
    this.wrap = CGL.Texture.CLAMP_TO_EDGE;
    this.texTarget= this._cgl.gl.TEXTURE_2D;
    if(options && options.type)this.texTarget=options.type;
    this.textureType=CGL.Texture.TYPE_DEFAULT;
    this.unpackAlpha=true;
    this.name="unknown";

    if(options)
    {
        this.name=options.name||this.name;
        if(options.isDepthTexture) this.textureType=CGL.Texture.TYPE_DEPTH;
        if(options.isFloatingPointTexture) this.textureType=CGL.Texture.TYPE_FLOAT;

        if("textureType" in options) this.textureType=options.textureType;
        if("filter" in options) this.filter=options.filter;
        if("wrap" in options) this.wrap=options.wrap;
        if("unpackAlpha" in options) this.unpackAlpha=options.unpackAlpha;
        if("flip" in options) this.flip=options.flip;
    }

    if(options && options.width && options.height)this.setSize(options.width, options.height);
        else this.setSize(8,8);
};

CGL.Texture.prototype.compareSettings=function(tex)
{
    if(!tex)return false;
    return (
        tex.width==this.width &&
        tex.height==this.height &&
        tex.filter==this.filter &&
        tex.wrap==this.wrap &&
        tex.textureType==this.textureType &&
        tex.unpackAlpha==this.unpackAlpha &&
        tex.flip==this.flip
    );
};

CGL.Texture.prototype.clone=function()
{
    var newTex=new CGL.Texture(this._cgl,
        {
            "filter":this.filter,
            "wrap":this.wrap,
            "textureType":this.textureType,
            "unpackAlpha":this.unpackAlpha,
            "flip":this.flip,
            "width":this.width,
            "height":this.height,
        });

    if(!this.compareSettings(newTex))
    {
        console.error('Cloned texture settings do not compare!');
    }

    return newTex;
};



CGL.Texture.prototype.setSize=function(w,h)
{
    if(this.width==w && this.height==h)return;

    this.width=w;
    this.height=h;

    this._cgl.gl.bindTexture(this.texTarget, this.tex);
    CGL.profileTextureResize++;

    var uarr=null;
    this._setFilter();


    if(this.textureType==CGL.Texture.TYPE_FLOAT)
    {
        if(!this._cgl.gl.getExtension('OES_texture_float')) throw "no floating point texture extension";
        this._cgl.gl.texImage2D(this.texTarget, 0, this._cgl.gl.RGBA, w,h, 0, this._cgl.gl.RGBA, this._cgl.gl.FLOAT, null);
    }
    else
    if(this.textureType==CGL.Texture.TYPE_DEPTH)
    {
        this._cgl.gl.texImage2D(this.texTarget, 0, this._cgl.gl.DEPTH_COMPONENT, w,h, 0, this._cgl.gl.DEPTH_COMPONENT, this._cgl.gl.UNSIGNED_SHORT, null);
    }
    else
    {
        this._cgl.gl.texImage2D(this.texTarget, 0, this._cgl.gl.RGBA, w, h, 0, this._cgl.gl.RGBA, this._cgl.gl.UNSIGNED_BYTE, uarr);
    }

    if( (this._cgl.glVersion==2 || this.isPowerOfTwo()) && this.filter==CGL.Texture.FILTER_MIPMAP)
    {
        this._cgl.gl.generateMipmap(this.texTarget);
    }

    this._cgl.gl.bindTexture(this.texTarget, null);
};

CGL.Texture.prototype.initFromData=function(data,w,h,filter,wrap)
{
    this._cgl.gl.pixelStorei(this._cgl.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.unpackAlpha);
    this.filter=filter;
    this.wrap=wrap;
    this.width=w;
    this.height=h;


    this._cgl.gl.bindTexture(this.texTarget, this.tex);
    this._cgl.gl.pixelStorei(this._cgl.gl.UNPACK_FLIP_Y_WEBGL, !this.flip);
    this._cgl.gl.texImage2D(this.texTarget, 0, this._cgl.gl.RGBA, w, h, 0, this._cgl.gl.RGBA, this._cgl.gl.UNSIGNED_BYTE, data);

    this._setFilter();

    if( (this._cgl.glVersion==2 || this.isPowerOfTwo()) && this.filter==CGL.Texture.FILTER_MIPMAP)
    {
        this._cgl.gl.generateMipmap(this.texTarget);
    }

    this._cgl.gl.bindTexture(this.texTarget, null);
};

CGL.Texture.prototype.initTexture=function(img,filter)
{
    this._cgl.gl.pixelStorei(this._cgl.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.unpackAlpha);
    if(img.width)this.width=img.width;
    if(img.height)this.height=img.height;
    if(filter)this.filter=filter;

    this._cgl.gl.bindTexture(this.texTarget, this.tex);
    this._cgl.gl.pixelStorei(this._cgl.gl.UNPACK_FLIP_Y_WEBGL, !this.flip);
    this._cgl.gl.texImage2D(this.texTarget, 0, this._cgl.gl.RGBA, this._cgl.gl.RGBA, this._cgl.gl.UNSIGNED_BYTE, this.image);

    this._setFilter();

    if( (this._cgl.glVersion==2 || this.isPowerOfTwo()) && this.filter==CGL.Texture.FILTER_MIPMAP) this._cgl.gl.generateMipmap(this.texTarget);

    this._cgl.gl.bindTexture(this.texTarget, null);
};

CGL.Texture.prototype.delete=function()
{
    CGL.profileTextureDelete++;
    this._cgl.gl.deleteTexture(this.tex);
};

CGL.Texture.prototype.isPowerOfTwo=function()
{
    return CGL.Texture.isPowerOfTwo(this.width) && CGL.Texture.isPowerOfTwo(this.height);
};

CGL.Texture.prototype.printInfo=function()
{
    console.log(this.getInfo());
};

CGL.Texture.prototype.getInfo=function()
{
    var obj={};

    obj.name=this.name;
    obj["power of two"]=this.isPowerOfTwo();
    obj.size=this.width+" x "+this.height;

    var targetString=this.texTarget;
    if(this.texTarget==this._cgl.gl.TEXTURE_2D)targetString="TEXTURE_2D";
    obj.target=targetString;

    obj.unpackAlpha=this.unpackAlpha;

    if(this.textureType==CGL.Texture.TYPE_FLOAT) obj.textureType='TYPE_FLOAT';
    else if(this.textureType==CGL.Texture.TYPE_DEPTH) obj.textureType='TYPE_DEPTH';
    else if(this.textureType==CGL.Texture.TYPE_DEFAULT) obj.textureType='TYPE_DEFAULT';
    else obj.textureType='UNKNOWN';

    if(this.wrap==CGL.Texture.WRAP_CLAMP_TO_EDGE) obj.wrap="CLAMP_TO_EDGE";
    else if(this.wrap==CGL.Texture.WRAP_REPEAT) obj.wrap="WRAP_REPEAT";
    else if(this.wrap==CGL.Texture.WRAP_MIRRORED_REPEAT) obj.wrap="WRAP_MIRRORED_REPEAT";
    else obj.wrap="UNKNOWN";

    if(this.filter==CGL.Texture.FILTER_NEAREST) obj.filter="filter: FILTER_NEAREST";
    else if(this.filter==CGL.Texture.FILTER_LINEAR) obj.filter="filter: FILTER_LINEAR";
    else if(this.filter==CGL.Texture.FILTER_MIPMAP) obj.filter="filter: FILTER_MIPMAP";
    else obj.filter="filter: UNKNOWN";
    return obj;
};

CGL.Texture.prototype._setFilter=function()
{
    this._cgl.gl.pixelStorei(this._cgl.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.unpackAlpha);
    if( this._cgl.glVersion==1 && !this.isPowerOfTwo() )
    {
        // console.log( 'non power of two',this.width,this.height );
        this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.NEAREST);
        this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.NEAREST);

        this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.CLAMP_TO_EDGE);
        this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.CLAMP_TO_EDGE);

        this.filter=CGL.Texture.FILTER_NEAREST;
        this.wrap=CGL.Texture.WRAP_CLAMP_TO_EDGE;
    }
    else
    {
        if(this.wrap==CGL.Texture.WRAP_CLAMP_TO_EDGE)
        {
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.CLAMP_TO_EDGE);
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.CLAMP_TO_EDGE);
        }

        if(this.wrap==CGL.Texture.WRAP_REPEAT)
        {
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.REPEAT);
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.REPEAT);
        }

        if(this.wrap==CGL.Texture.WRAP_MIRRORED_REPEAT)
        {
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.MIRRORED_REPEAT);
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.MIRRORED_REPEAT);
        }

        if(this.filter==CGL.Texture.FILTER_NEAREST)
        {
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.NEAREST);
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.NEAREST);
        }
        else if(this.filter==CGL.Texture.FILTER_LINEAR)
        {
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.LINEAR);
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.LINEAR);
        }
        else if(this.filter==CGL.Texture.FILTER_MIPMAP)
        {
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.LINEAR);
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.LINEAR_MIPMAP_LINEAR);
        }
        else
        {
            console.log('unknown texture filter!',this.filter);
            var err = new Error();
            throw err;
        }
    }
};

CGL.Texture.load=function(cgl,url,finishedCallback,settings)
{
    var loadingId=cgl.patch.loading.start('texture',url);
    var texture=new CGL.Texture(cgl);

    texture.name=url;

    if(CABLES.UI) gui.jobs().start({id:'loadtexture'+loadingId,title:'loading texture ('+url+')'});

    texture.image = new Image();
    texture.image.crossOrigin = '';

    if(settings && settings.hasOwnProperty('filter')) texture.filter=settings.filter;
    if(settings && settings.hasOwnProperty('flip')) texture.flip=settings.flip;
    if(settings && settings.hasOwnProperty('wrap')) texture.wrap=settings.wrap;
    if(settings && settings.hasOwnProperty('unpackAlpha')) texture.unpackAlpha=settings.unpackAlpha;

    texture.image.onabort=texture.image.onerror=function(e)
    {
        cgl.patch.loading.finished(loadingId);
        var error={'error':true};
        if(finishedCallback)finishedCallback(error);
    };

    texture.image.onload=function(e)
    {
        texture.initTexture(texture.image);
        cgl.patch.loading.finished(loadingId);
        if(CABLES.UI) gui.jobs().finish('loadtexture'+loadingId);

        if(finishedCallback)finishedCallback();
    };
    texture.image.src = url;

    return texture;
};

CGL.tempTexture=null;
CGL.Texture.getTempTexture=function(cgl)
{
    if(!CGL.tempTexture) CGL.tempTexture=CGL.Texture.getTemporaryTexture(cgl,256,CGL.Texture.FILTER_LINEAR,CGL.Texture.REPEAT);
    return CGL.tempTexture;
};

CGL.Texture.getTemporaryTexture=function(cgl,size,filter,wrap)
{
    var temptex=new CGL.Texture(cgl);
    var arr=[];
    for(var y=0;y<size;y++)
    {
        for(var x=0;x<size;x++)
        {
            if((x+y)%64<32)
            {
                arr.push(200+y/size*25+x/size*25);
                arr.push(200+y/size*25+x/size*25);
                arr.push(200+y/size*25+x/size*25);
            }
            else
            {
                arr.push(40+y/size*25+x/size*25);
                arr.push(40+y/size*25+x/size*25);
                arr.push(40+y/size*25+x/size*25);
            }
            arr.push(255);
        }
    }

    var data = new Uint8Array(arr);
    temptex.initFromData(data,size,size,filter,wrap);

    return temptex;
};

CGL.Texture.createFromImage=function(cgl,img,options)
{
    var texture=new CGL.Texture(cgl,options);
    texture.flip=false;
    texture.image = img;
    texture.width=img.width;
    texture.height=img.height;
    texture.initTexture(img);

    return texture;
};

// deprecated!
CGL.Texture.fromImage=function(cgl,img,filter,wrap)
{
    console.error('deprecated texture from image...');

    var texture=new CGL.Texture(cgl);
    texture.flip=false;
    if(filter)texture.filter=filter;
    if(wrap)texture.wrap=wrap;
    texture.image = img;
    texture.initTexture(img);
    return texture;
};

CGL.Texture.isPowerOfTwo=function(x)
{
    return ( x == 1 || x == 2 || x == 4 || x == 8 || x == 16 || x == 32 || x == 64 || x == 128 || x == 256 || x == 512 || x == 1024 || x == 2048 || x == 4096 || x == 8192 || x == 16384);
};

CGL.Texture.FILTER_NEAREST=0;
CGL.Texture.FILTER_LINEAR=1;
CGL.Texture.FILTER_MIPMAP=2;

CGL.Texture.WRAP_REPEAT=0;
CGL.Texture.WRAP_MIRRORED_REPEAT=1;
CGL.Texture.WRAP_CLAMP_TO_EDGE=2;

CGL.Texture.TYPE_DEFAULT=0;
CGL.Texture.TYPE_DEPTH=1;
CGL.Texture.TYPE_FLOAT=2;

// ---------------------------------------------------------------------------
