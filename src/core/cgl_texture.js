
var CGL=CGL || {};

CGL.Texture=function(cgl,options)
{
    if(!cgl) throw "no cgl";
    var self = this;
    this.tex = cgl.gl.createTexture();
    this.width = 0;
    this.height = 0;
    this.flip = true;
    this.filter = CGL.Texture.FILTER_NEAREST;
    this.wrap = CGL.Texture.CLAMP_TO_EDGE;
    var texType= cgl.gl.TEXTURE_2D;
    if(options && options.type)texType=options.type;
    var textureType='default';

    this.unpackAlpha=true;

    if(options)
    {
        if(options.isDepthTexture) textureType='depth';
        if(options.isFloatingPointTexture) textureType='floatingpoint';
        if(options.filter) this.filter=options.filter;
        if(options.wrap) this.wrap=options.wrap;
        this.flip=options.flip;
    }

    this.isPowerOfTwo=function()
    {
        return _isPowerOfTwo(this.width) && _isPowerOfTwo(this.width);
    };

    function _isPowerOfTwo (x)
    {
        return ( x == 1 || x == 2 || x == 4 || x == 8 || x == 16 || x == 32 || x == 64 || x == 128 || x == 256 || x == 512 || x == 1024 || x == 2048 || x == 4096 || x == 8192 || x == 16384);
    }

    function setFilter()
    {
        if(!_isPowerOfTwo(self.width) || !_isPowerOfTwo(self.height) )
        {
            cgl.gl.texParameteri(texType, cgl.gl.TEXTURE_MAG_FILTER, cgl.gl.NEAREST);
            cgl.gl.texParameteri(texType, cgl.gl.TEXTURE_MIN_FILTER, cgl.gl.NEAREST);

            cgl.gl.texParameteri(texType, cgl.gl.TEXTURE_WRAP_S, cgl.gl.CLAMP_TO_EDGE);
            cgl.gl.texParameteri(texType, cgl.gl.TEXTURE_WRAP_T, cgl.gl.CLAMP_TO_EDGE);
        }
        else
        {
            if(self.wrap==CGL.Texture.WRAP_CLAMP_TO_EDGE)
            {
                cgl.gl.texParameteri(texType, cgl.gl.TEXTURE_WRAP_S, cgl.gl.CLAMP_TO_EDGE);
                cgl.gl.texParameteri(texType, cgl.gl.TEXTURE_WRAP_T, cgl.gl.CLAMP_TO_EDGE);
            }

            if(self.wrap==CGL.Texture.WRAP_REPEAT)
            {
                cgl.gl.texParameteri(texType, cgl.gl.TEXTURE_WRAP_S, cgl.gl.REPEAT);
                cgl.gl.texParameteri(texType, cgl.gl.TEXTURE_WRAP_T, cgl.gl.REPEAT);
            }

            if(self.wrap==CGL.Texture.WRAP_MIRRORED_REPEAT)
            {
                cgl.gl.texParameteri(texType, cgl.gl.TEXTURE_WRAP_S, cgl.gl.MIRRORED_REPEAT);
                cgl.gl.texParameteri(texType, cgl.gl.TEXTURE_WRAP_T, cgl.gl.MIRRORED_REPEAT);
            }

            if(self.filter==CGL.Texture.FILTER_NEAREST)
            {
                cgl.gl.texParameteri(texType, cgl.gl.TEXTURE_MAG_FILTER, cgl.gl.NEAREST);
                cgl.gl.texParameteri(texType, cgl.gl.TEXTURE_MIN_FILTER, cgl.gl.NEAREST);
            }
            else if(self.filter==CGL.Texture.FILTER_LINEAR)
            {
                cgl.gl.texParameteri(texType, cgl.gl.TEXTURE_MIN_FILTER, cgl.gl.LINEAR);
                cgl.gl.texParameteri(texType, cgl.gl.TEXTURE_MAG_FILTER, cgl.gl.LINEAR);
            }
            else if(self.filter==CGL.Texture.FILTER_MIPMAP)
            {
                cgl.gl.texParameteri(texType, cgl.gl.TEXTURE_MAG_FILTER, cgl.gl.LINEAR);
                cgl.gl.texParameteri(texType, cgl.gl.TEXTURE_MIN_FILTER, cgl.gl.LINEAR_MIPMAP_LINEAR);
            }
            else
            {
                console.log('unknown texture filter!',self.filter);
            }
        }
    }


    this.setSize=function(w,h)
    {

        if(self.width==w && self.height==h)return;


        self.width=w;
        self.height=h;

        // console.log('self.width',self.width,self.height);

        cgl.gl.bindTexture(texType, self.tex);
        // console.log('resize',w,h,self.filter);

        var uarr=null;
        // if(!isDataTexture)
        // {
        //     var arr=[];
        //     arr.length=w*h*4;
        //     // for(var x=0;x<w;x++)
        //     // {
        //     //     for(var y=0;y<h;y++)
        //     //     {
        //     //         // var index=x+y*w;
        //     //         arr.push( parseInt( (x/w)*255,10) );
        //     //         arr.push(0);
        //     //         arr.push( parseInt((y/w)*255,10));
        //     //         arr.push(255);
        //     //     }
        //     // }
        //     uarr=new Uint8Array(arr);
        // }

        setFilter();

        if(textureType=='floatingpoint')
        {
            if(!cgl.gl.getExtension('OES_texture_float'))
            {
                console.log('no floating point texture extension!');
            }else {
                console.log('yay fp tex');
            }
            cgl.gl.texImage2D(texType, 0, cgl.gl.RGBA, w,h, 0, cgl.gl.RGBA, cgl.gl.FLOAT, null);
        }
        else
        if(textureType=='depth')
        {
            cgl.gl.texImage2D(texType, 0, cgl.gl.DEPTH_COMPONENT, w,h, 0, cgl.gl.DEPTH_COMPONENT, cgl.gl.UNSIGNED_SHORT, null);
        }
        else
        {
            cgl.gl.texImage2D(texType, 0, cgl.gl.RGBA, w, h, 0, cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE, uarr);
        }


        if(_isPowerOfTwo(self.width) && _isPowerOfTwo(self.height) && self.filter==CGL.Texture.FILTER_MIPMAP)
        {
            cgl.gl.generateMipmap(texType);
        }

        cgl.gl.bindTexture(texType, null);
    };

    this.initFromData=function(data,w,h,filter,wrap)
    {
        cgl.gl.pixelStorei(cgl.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.unpackAlpha);
        this.filter=filter;
        this.wrap=wrap;
        self.width=w;
        self.height=h;

        cgl.gl.bindTexture(texType, self.tex);
        cgl.gl.pixelStorei(cgl.gl.UNPACK_FLIP_Y_WEBGL, !self.flip);
        cgl.gl.texImage2D(texType, 0, cgl.gl.RGBA, w, h, 0, cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE, data);

        setFilter();

        if(_isPowerOfTwo(self.width) && _isPowerOfTwo(self.height) && self.filter==CGL.Texture.FILTER_MIPMAP)
        {
            cgl.gl.generateMipmap(texType);
        }

        cgl.gl.bindTexture(texType, null);
    };

    this.initTexture=function(img,filter)
    {
        cgl.gl.pixelStorei(cgl.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.unpackAlpha);
        if(img.width)self.width=img.width;
        if(img.height)self.height=img.height;
        if(filter)this.filter=filter;

        cgl.gl.bindTexture(texType, self.tex);
        cgl.gl.pixelStorei(cgl.gl.UNPACK_FLIP_Y_WEBGL, !self.flip);

        cgl.gl.texImage2D(texType, 0, cgl.gl.RGBA, cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE, self.image);

        setFilter();

        if(_isPowerOfTwo(self.width) && _isPowerOfTwo(self.height) && self.filter==CGL.Texture.FILTER_MIPMAP)
        {
            cgl.gl.generateMipmap(texType);
        }

        cgl.gl.bindTexture(texType, null);
    };

    this.delete=function()
    {
        cgl.gl.deleteTexture(this.tex);
    };

    this.setSize(8,8);

    // this.preview=function()
    // {
    //     CGL.Texture.previewTexture=self;
    // };

};

CGL.Texture.load=function(cgl,url,finishedCallback,settings)
{
    var loadingId=cgl.patch.loading.start('texture',url);
    var texture=new CGL.Texture(cgl);

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
    // console.log('IIIMMMGGG',img,img.width,img.height);
    texture.initTexture(img);
    return texture;
};


// deprecated!
CGL.Texture.fromImage=function(cgl,img,filter,wrap)
{
    var texture=new CGL.Texture(cgl);
    texture.flip=false;
    if(filter)texture.filter=filter;
    if(wrap)texture.wrap=wrap;
    texture.image = img;
    texture.initTexture(img);
    return texture;
};

CGL.Texture.FILTER_NEAREST=0;
CGL.Texture.FILTER_LINEAR=1;
CGL.Texture.FILTER_MIPMAP=2;

CGL.Texture.WRAP_REPEAT=0;
CGL.Texture.WRAP_MIRRORED_REPEAT=1;
CGL.Texture.WRAP_CLAMP_TO_EDGE=2;


// ---------------------------------------------------------------------------

// CGL.Texture.previewTexture=null;
// CGL.Texture.texturePreviewer=null;
// CGL.Texture.texturePreview=function(cgl)
// {
//     var size=2;
//     var geom=new CGL.Geometry();
//
//     geom.vertices = [
//          size/2,  size/2,  0.0,
//         -size/2,  size/2,  0.0,
//          size/2, -size/2,  0.0,
//         -size/2, -size/2,  0.0
//     ];
//
//     geom.texCoords = [
//          1.0, 1.0,
//          0.0, 1.0,
//          1.0, 0.0,
//          0.0, 0.0
//     ];
//
//     geom.verticesIndices = [
//         0, 1, 2,
//         3, 1, 2
//     ];
//
//     var mesh=new CGL.Mesh(cgl,geom);
//
//     var srcFrag=''
//         .endl()+'precision highp float;'
//         .endl()+'varying vec2 texCoord;'
//         .endl()+'uniform sampler2D tex;'
//         .endl()+'uniform float time;'
//
//         .endl()+''
//         .endl()+'void main()'
//         .endl()+'{'
//
//         .endl()+'   vec4 col;'
//
//         .endl()+'bool isEven = mod(time+texCoord.y+texCoord.x,0.2)>0.1;'
//         .endl()+'vec4 col1 = vec4(0.2,0.2,0.2,1.0);'
//         .endl()+'vec4 col2 = vec4(0.5,0.5,0.5,1.0);'
//         .endl()+'col = (isEven)? col1:col2;'
//
//         .endl()+'vec4 colTex = texture2D(tex,texCoord);;'
//         .endl()+'col = mix(col,colTex,colTex.a);'
//
//         .endl()+'   gl_FragColor = col;'
//         .endl()+'}';
//
//
//     var shader=new CGL.Shader(cgl,"texturepreview");
//     shader.setSource(shader.getDefaultVertexShader(),srcFrag);
//
//     var timeUni=new CGL.Uniform(shader,'f','time',0);
//     var textureUniform=new CGL.Uniform(shader,'t','tex',0);
//     var startTime=Date.now()/1000.0;
//
//     this.render=function(tex)
//     {
//         // console.log('previewing ',tex.width,tex.height);
//         cgl.gl.clearColor(0,0,0,0);
//         cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
//
//         timeUni.setValue( (Date.now()/1000.0-startTime)*0.1 );
//
//         cgl.setShader(shader);
//
//         if(tex)
//         {
//             cgl.gl.activeTexture(cgl.gl.TEXTURE0);
//             cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, tex.tex);
//         }
//
//         mesh.render(cgl.getShader());
//         cgl.setPreviousShader();
//     };
//
// };
