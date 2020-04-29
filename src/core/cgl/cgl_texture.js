import { profileData } from "./cgl_profiledata";
import { uuid } from "../utils";
import { Log } from "../log";



var DEFAULT_TEXTURE_SIZE = 8;

/**
 * A Texture
 * @external CGL
 * @namespace Texture
 * @constructor
 * @param {Context} cgl
 * @param {Object} [options]
 * @hideconstructor
 * @class
 * @example
 * // generate a 256x256 pixel texture of random colors
 * const size=256;
 * const data = new Uint8Array(size*size*4);
 *
 * for(var x=0;x<size*size*4;x++) data[ x*4+3]=255;
 *
 * const tex=new CGL.Texture(cgl);
 * tex.initFromData(data,size,size,CGL.Texture.FILTER_NEAREST,CGL.Texture.WRAP_REPEAT);
 */
const Texture = function (__cgl, options)
{
    if (!__cgl) throw "no cgl";

    this._cgl = __cgl;
    this.tex = this._cgl.gl.createTexture();
    this.id = uuid();
    this.width = 0;
    this.height = 0;
    this.flip = true;
    this.flipped=false;
    this.shadowMap = false;
    this.anisotropic=0;
    this.filter = Texture.FILTER_NEAREST;
    this.wrap = Texture.WRAP_CLAMP_TO_EDGE;
    this.texTarget = this._cgl.gl.TEXTURE_2D;
    if (options && options.type) this.texTarget = options.type;
    this.textureType = Texture.TYPE_DEFAULT;
    this.unpackAlpha = true;
    this._fromData = true;
    this.name = "unknown";

    if (options)
    {
        this.name = options.name || this.name;
        if (options.isDepthTexture) this.textureType = Texture.TYPE_DEPTH;
        if (options.isFloatingPointTexture) this.textureType = Texture.TYPE_FLOAT;

        if ("textureType" in options) this.textureType = options.textureType;
        if ("filter" in options) this.filter = options.filter;
        if ("wrap" in options) this.wrap = options.wrap;
        if ("unpackAlpha" in options) this.unpackAlpha = options.unpackAlpha;
        if ("flip" in options) this.flip = options.flip;
        if ("shadowMap" in options) this.shadowMap = options.shadowMap;
        if ("anisotropic" in options) this.anisotropic = options.anisotropic;
    }
    else
    {
        options = {
            width: DEFAULT_TEXTURE_SIZE,
            height: DEFAULT_TEXTURE_SIZE,
        };
    }

    var w=Math.min(options.width,this._cgl.maxTexSize);
    var h=Math.min(options.height,this._cgl.maxTexSize);

    profileData.profileTextureNew++;

    this.setSize(w, h);
};

/**
 * returns true if otherTexture has same options (width/height/filter/wrap etc)
 * @function compareSettings
 * @memberof Texture
 * @instance
 * @param {Texture} otherTexture
 * @returns {Boolean}
 */
Texture.prototype.compareSettings = function (tex)
{
    if (!tex) return false;
    return tex.width == this.width && tex.height == this.height && tex.filter == this.filter && tex.wrap == this.wrap && tex.textureType == this.textureType && tex.unpackAlpha == this.unpackAlpha && tex.flip == this.flip;
};

/**
 * returns a new texture with the same settings (does not copy texture itself)
 * @function clone
 * @memberof Texture
 * @instance
 * @returns {Texture}
 */
Texture.prototype.clone = function ()
{
    var newTex = new Texture(this._cgl, {
        name: this.name,
        filter: this.filter,
        wrap: this.wrap,
        textureType: this.textureType,
        unpackAlpha: this.unpackAlpha,
        flip: this.flip,
        width: this.width,
        height: this.height,
    });

    if (!this.compareSettings(newTex))
    {
        console.error("Cloned texture settings do not compare!");
        Log.log(this);
        Log.log(newTex);
    }

    return newTex;
};

/**
 * set pixel size of texture
 * @function setSize
 * @memberof Texture
 * @instance
 * @param {Number} width
 * @param {Number} height
 */
Texture.prototype.setSize = function (w, h)
{
    if (w != w || w <= 0 || !w) w = DEFAULT_TEXTURE_SIZE;
    if (h != h || h <= 0 || !h) h = DEFAULT_TEXTURE_SIZE;
    w = Math.floor(w);
    h = Math.floor(h);
    if (this.width == w && this.height == h) return;

    this.width = w;
    this.height = h;

    this._cgl.gl.bindTexture(this.texTarget, this.tex);
    profileData.profileTextureResize++;

    var uarr = null;

    if (this.textureType == Texture.TYPE_FLOAT && this.filter == Texture.FILTER_LINEAR && !this._cgl.gl.getExtension('OES_texture_float_linear'))
    {
        console.warn('this graphics card does not support floating point texture linear interpolation!');
        this.filter = Texture.FILTER_NEAREST;
    }

    this._setFilter();

    if (this.textureType == Texture.TYPE_FLOAT)
    {
        // if(this._cgl.glVersion==1 && !this._cgl.gl.getExtension('OES_texture_float')) throw "no float texture extension";
        // should also check for HALF_FLOAT and use this if this is available, but no float... (some ios devices)

        if (this._cgl.glVersion == 1)
        {
            if (this._cgl.glUseHalfFloatTex)
            {
                var ext = this._cgl.gl.getExtension("OES_texture_half_float");
                if (this._cgl.glVersion == 1 && !ext) throw "no half float texture extension";

                this._cgl.gl.texImage2D(this.texTarget, 0, this._cgl.gl.RGBA, w, h, 0, this._cgl.gl.RGBA, ext.HALF_FLOAT_OES, null);
            }
            else
            {
                var ext = this._cgl.gl.getExtension("OES_texture_float");

                this._cgl.gl.texImage2D(this.texTarget, 0, this._cgl.gl.RGBA, w, h, 0, this._cgl.gl.RGBA, this._cgl.gl.FLOAT, null); // UNSIGNED_SHORT
            }
        }
        else this._cgl.gl.texImage2D(this.texTarget, 0, this._cgl.gl.RGBA32F, w, h, 0, this._cgl.gl.RGBA, this._cgl.gl.FLOAT, null);
    }
    else if (this.textureType == Texture.TYPE_DEPTH)
    {
        if (this._cgl.glVersion == 1)
        {
            // if(this._cgl.gl.getExtension('OES_texture_half_float'))
            // {
            //     Log.log("is half float");
            //     var tcomp=this._cgl.gl.DEPTH_COMPONENT;
            //     this._cgl.gl.texImage2D(this.texTarget, 0, tcomp, w,h, 0, this._cgl.gl.DEPTH_COMPONENT, this._cgl.gl.HALD_FLOAT_OES, null);
            // }
            // else
            {
                var tcomp = this._cgl.gl.DEPTH_COMPONENT;
                this._cgl.gl.texImage2D(this.texTarget, 0, tcomp, w, h, 0, this._cgl.gl.DEPTH_COMPONENT, this._cgl.gl.UNSIGNED_SHORT, null);
            }
        }
        else
        {
            var tcomp = this._cgl.gl.DEPTH_COMPONENT32F;
            this._cgl.gl.texImage2D(this.texTarget, 0, tcomp, w, h, 0, this._cgl.gl.DEPTH_COMPONENT, this._cgl.gl.FLOAT, null);
        }
    }
    else
    {
        this._cgl.gl.texImage2D(this.texTarget, 0, this._cgl.gl.RGBA, w, h, 0, this._cgl.gl.RGBA, this._cgl.gl.UNSIGNED_BYTE, uarr);
    }

    // if( ( this._cgl.glVersion==2 || this.isPowerOfTwo()) && this.filter==Texture.FILTER_MIPMAP)
    // {
    //     this._cgl.gl.generateMipmap(this.texTarget);
    // }
    this.updateMipMap();

    this._cgl.gl.bindTexture(this.texTarget, null);
};

/**
 * @function initFromData
 * @memberof Texture
 * @instance
 * @description create texturem from rgb data
 * @param {Array<Number>} data rgb color array [r,g,b,a,r,g,b,a,...]
 * @param {Number} width
 * @param {Number} height
 * @param {Number} filter
 * @param {Number} wrap
 */
Texture.prototype.initFromData = function (data, w, h, filter, wrap)
{
    this.filter = filter;
    this.wrap = wrap;
    if(filter == undefined) this.filter = Texture.FILTER_LINEAR;
    if(wrap == undefined) this.wrap = Texture.CLAMP_TO_EDGE;
    this.width = w;
    this.height = h;
    this._fromData = true;
    this._cgl.gl.bindTexture(this.texTarget, this.tex);
    this._cgl.gl.texImage2D(this.texTarget, 0, this._cgl.gl.RGBA, w, h, 0, this._cgl.gl.RGBA, this._cgl.gl.UNSIGNED_BYTE, data);
    this._setFilter();

    // if( (this._cgl.glVersion==2 || this.isPowerOfTwo()) && this.filter==Texture.FILTER_MIPMAP)
    // {
    //     this._cgl.gl.generateMipmap(this.texTarget);
    // }
    this.updateMipMap();

    this._cgl.gl.bindTexture(this.texTarget, null);
};

Texture.prototype.updateMipMap = function ()
{
    if ((this._cgl.glVersion == 2 || this.isPowerOfTwo()) && this.filter == Texture.FILTER_MIPMAP)
    {
        this._cgl.gl.generateMipmap(this.texTarget);
        profileData.profileGenMipMap++;
    }
};

/**
 * set texture data from an image/canvas object
 * @function initTexture
 * @memberof Texture
 * @instance
 * @param {Object} image
 * @param {Number} filter
 */
Texture.prototype.initTexture = function (img, filter)
{
    this._fromData = false;
    // if(filter) this.unpackAlpha=filter.unpackAlpha||this.unpackAlpha;

    this._cgl.gl.pixelStorei(this._cgl.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.unpackAlpha);
    if (img.width) this.width = img.width;
    if (img.height) this.height = img.height;
    if (filter) this.filter = filter;

    this._cgl.gl.bindTexture(this.texTarget, this.tex);

    this.flipped=!this.flip;
    this._cgl.gl.pixelStorei(this._cgl.gl.UNPACK_FLIP_Y_WEBGL, this.flipped);

    this._cgl.gl.texImage2D(this.texTarget, 0, this._cgl.gl.RGBA, this._cgl.gl.RGBA, this._cgl.gl.UNSIGNED_BYTE, img);

    this._setFilter();
    this.updateMipMap();

    this._cgl.gl.bindTexture(this.texTarget, null);
    this._cgl.gl.pixelStorei(this._cgl.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
};

/**
 * delete texture. use this when texture is no longer needed
 * @function delete
 * @memberof Texture
 * @instance
 */
Texture.prototype.delete = function ()
{
    this.width=0;
    this.height=0;
    profileData.profileTextureDelete++;
    this._cgl.gl.deleteTexture(this.tex);
};

/**
 * @function isPowerOfTwo
 * @memberof Texture
 * @instance
 * @description return true if texture width and height are both power of two
 * @return {Boolean}
 */
Texture.prototype.isPowerOfTwo = function ()
{
    return Texture.isPowerOfTwo(this.width) && Texture.isPowerOfTwo(this.height);
};

Texture.prototype.printInfo = function ()
{
    Log.log(this.getInfo());
};

Texture.prototype.getInfoReadable = function ()
{
    var info = this.getInfo();
    var html = "";

    info.name = info.name.substr(0, info.name.indexOf("?rnd="));

    for (var i in info)
    {
        html += "* " + i + ":  **" + info[i] + "**\n";
    }

    return html;
};

Texture.prototype.getInfo = function ()
{
    var obj = {};

    obj.name = this.name;
    obj["power of two"] = this.isPowerOfTwo();
    obj.size = this.width + " x " + this.height;

    var targetString = this.texTarget;
    if (this.texTarget == this._cgl.gl.TEXTURE_2D) targetString = "TEXTURE_2D";
    obj.target = targetString;

    obj.unpackAlpha = this.unpackAlpha;

    if (this.textureType == Texture.TYPE_FLOAT) obj.textureType = "TYPE_FLOAT";
    else if (this.textureType == Texture.TYPE_DEPTH) obj.textureType = "TYPE_DEPTH";
    else if (this.textureType == Texture.TYPE_DEFAULT) obj.textureType = "TYPE_DEFAULT";
    else obj.textureType = "UNKNOWN";

    if (this.wrap == Texture.WRAP_CLAMP_TO_EDGE) obj.wrap = "CLAMP_TO_EDGE";
    else if (this.wrap == Texture.WRAP_REPEAT) obj.wrap = "WRAP_REPEAT";
    else if (this.wrap == Texture.WRAP_MIRRORED_REPEAT) obj.wrap = "WRAP_MIRRORED_REPEAT";
    else obj.wrap = "UNKNOWN";

    if (this.filter == Texture.FILTER_NEAREST) obj.filter = "FILTER_NEAREST";
    else if (this.filter == Texture.FILTER_LINEAR) obj.filter = "FILTER_LINEAR";
    else if (this.filter == Texture.FILTER_MIPMAP) obj.filter = "FILTER_MIPMAP";
    // else if (this.filter == Texture.FILTER_ANISOTROPIC) obj.filter = "FILTER_ANISOTROPIC";
    
    else obj.filter = "UNKNOWN";
    return obj;
};

Texture.prototype._setFilter = function ()
{
    if (!this._fromData)
    {
        this._cgl.gl.pixelStorei(this._cgl.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.unpackAlpha);
    }

    if (this.shadowMap)
    {
        Log.log("shadowmap tex");
        this._cgl.gl.texParameteri(this._cgl.gl.TEXTURE_2D, this._cgl.gl.TEXTURE_COMPARE_MODE, this._cgl.gl.COMPARE_REF_TO_TEXTURE);
        this._cgl.gl.texParameteri(this._cgl.gl.TEXTURE_2D, this._cgl.gl.TEXTURE_COMPARE_FUNC, this._cgl.gl.LEQUAL);
    }

    if(this.textureType == Texture.TYPE_FLOAT && this.filter == Texture.FILTER_MIPMAP)
    {
        Log.log("texture: HDR and mipmap filtering at the same time is not possible");
        this.filter = Texture.FILTER_LINEAR;
    }

    if (this._cgl.glVersion == 1 && !this.isPowerOfTwo())
    {
        // Log.log( 'non power of two',this.width,this.height );
        this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.NEAREST);
        this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.NEAREST);

        this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.CLAMP_TO_EDGE);
        this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.CLAMP_TO_EDGE);

        this.filter = Texture.FILTER_NEAREST;
        this.wrap = Texture.WRAP_CLAMP_TO_EDGE;
    }
    else
    {
        if (this.wrap == Texture.WRAP_CLAMP_TO_EDGE)
        {
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.CLAMP_TO_EDGE);
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.CLAMP_TO_EDGE);
        }
        else if (this.wrap == Texture.WRAP_REPEAT)
        {
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.REPEAT);
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.REPEAT);
        }
        else if (this.wrap == Texture.WRAP_MIRRORED_REPEAT)
        {
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.MIRRORED_REPEAT);
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.MIRRORED_REPEAT);
        }

        if (this.filter == Texture.FILTER_NEAREST)
        {
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.NEAREST);
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.NEAREST);
        }
        else if (this.filter == Texture.FILTER_LINEAR)
        {
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.LINEAR);
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.LINEAR);
        }
        else if (this.filter == Texture.FILTER_MIPMAP)
        {
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.LINEAR);
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.LINEAR_MIPMAP_LINEAR);
        }
        else
        {
            Log.log("unknown texture filter!", this.filter);
            throw new Error("unknown texture filter!" + this.filter);
        }

        if(this.anisotropic)
        {
            var ext=this._cgl.gl.getExtension('EXT_texture_filter_anisotropic');
            if(ext)
            {
                var max = this._cgl.gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
                this._cgl.gl.texParameterf(this._cgl.gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(max,this.anisotropic));
            }
        }
    }
};

/**
 * @function load
 * @static
 * @memberof Texture
 * @description load an image from an url
 * @param {Context} cgl
 * @param {String} url
 * @param {Function} onFinished
 * @param {Object} options
 * @return {Texture}
 */
Texture.load = function (cgl, url, finishedCallback, settings)
{
    var loadingId = cgl.patch.loading.start("texture", url);
    var texture = new Texture(cgl);

    texture.name = url;

    if(cgl.patch.isEditorMode()) gui.jobs().start({ id: "loadtexture" + loadingId, title: "loading texture (" + url + ")" });

    texture.image = new Image();
    texture.image.crossOrigin = "anonymous";


    if (settings && settings.hasOwnProperty("filter")) texture.filter = settings.filter;
    if (settings && settings.hasOwnProperty("flip")) texture.flip = settings.flip;
    if (settings && settings.hasOwnProperty("wrap")) texture.wrap = settings.wrap;
    if (settings && settings.hasOwnProperty("anisotropic")) texture.anisotropic = settings.anisotropic;
    if (settings && settings.hasOwnProperty("unpackAlpha")) texture.unpackAlpha = settings.unpackAlpha;

    texture.image.onabort = texture.image.onerror = function (e)
    {
        Log.warn("[cgl.texture.load] error loading texture", e);
        cgl.patch.loading.finished(loadingId);
        var error = { error: true };
        if (finishedCallback) finishedCallback(error);
        if(cgl.patch.isEditorMode()) gui.jobs().finish("loadtexture" + loadingId);
    };

    texture.image.onload = function (e)
    {
        texture.initTexture(texture.image);
        cgl.patch.loading.finished(loadingId);
        if (cgl.patch.isEditorMode()) gui.jobs().finish("loadtexture" + loadingId);

        if (finishedCallback) finishedCallback(null,texture);
    };
    texture.image.src = url;

    return texture;
};

/**
 * @static
 * @function getTempTexture
 * @memberof Texture
 * @description returns the default temporary texture (grey diagonal stipes)
 * @param {Context} cgl
 * @return {Texture}
 */
Texture.getTempTexture = function (cgl)
{
    if(!cgl)console.error('[getTempTexture] no cgl!');
    if (!cgl.tempTexture) cgl.tempTexture = Texture.getTemporaryTexture(cgl, 256, Texture.FILTER_LINEAR, Texture.REPEAT);
    return tempTexture;
};

/**
 * @function getEmptyTexture
 * @memberof Texture
 * @instance
 * @description returns a reference to a small empty texture
 * @return {Texture}
 */
Texture.getEmptyTexture = function (cgl)
{
    if(!cgl)console.error('[getEmptyTexture] no cgl!');
    if (cgl.tempTextureEmpty) return cgl.tempTextureEmpty;

    cgl.tempTextureEmpty = new Texture(cgl);
    var data = new Uint8Array(8 * 8 * 4); // .fill(0);

    cgl.tempTextureEmpty.initFromData(data, 8, 8, Texture.FILTER_NEAREST, Texture.WRAP_REPEAT);

    return cgl.tempTextureEmpty;
};

/**
 * @function getRandomTexture
 * @memberof Texture
 * @static
 * @description returns a reference to a random texture
 * @return {Texture}
 */
Texture.getRandomTexture = function (cgl)
{
    if(!cgl)console.error('[getRandomTexture] no cgl!');
    if (cgl.randomTexture) return cgl.randomTexture;

    const size = 256;
    const data = new Uint8Array(size * size * 4);

    for (var x = 0; x < size * size; x++)
    {
        data[x * 4 + 0] = Math.random() * 255;
        data[x * 4 + 1] = Math.random() * 255;
        data[x * 4 + 2] = Math.random() * 255;
        data[x * 4 + 3] = 255;
    }

    cgl.randomTexture = new Texture(cgl);
    cgl.randomTexture.initFromData(data, size, size, Texture.FILTER_NEAREST, Texture.WRAP_REPEAT);

    return cgl.randomTexture;
};

/**
 * @static
 * @function getTempGradientTexture
 * @memberof Texture
 * @description returns a gradient texture from black to white
 * @param {Context} cgl
 * @return {Texture}
 */
Texture.getTempGradientTexture = function (cgl)
{
    if(!cgl)console.error('[getTempGradientTexture] no cgl!');

    if (cgl.tempTextureGradient) return cgl.tempTextureGradient;
    var temptex = new Texture(cgl);
    const size = 256;
    var data = new Uint8Array(size * size * 4); // .fill(0);

    for (var y = 0; y < size; y++)
    {
        for (var x = 0; x < size; x++)
        {
            data[(x + y * size) * 4 + 0] = data[(x + y * size) * 4 + 1] = data[(x + y * size) * 4 + 2] = 255 - y;
            data[(x + y * size) * 4 + 3] = 255;
        }
    }

    temptex.initFromData(data, size, size, Texture.FILTER_NEAREST, Texture.WRAP_REPEAT);
    cgl.tempTextureGradient = temptex;
    return temptex;
};

Texture.getTemporaryTexture = function (cgl, size, filter, wrap)
{
    var temptex = new Texture(cgl);
    var arr = [];
    for (var y = 0; y < size; y++)
    {
        for (var x = 0; x < size; x++)
        {
            if ((x + y) % 64 < 32)
            {
                arr.push(200 + (y / size) * 25 + (x / size) * 25);
                arr.push(200 + (y / size) * 25 + (x / size) * 25);
                arr.push(200 + (y / size) * 25 + (x / size) * 25);
            }
            else
            {
                arr.push(40 + (y / size) * 25 + (x / size) * 25);
                arr.push(40 + (y / size) * 25 + (x / size) * 25);
                arr.push(40 + (y / size) * 25 + (x / size) * 25);
            }
            arr.push(255);
        }
    }

    var data = new Uint8Array(arr);
    temptex.initFromData(data, size, size, filter, wrap);

    return temptex;
};

/**
 * @static
 * @function createFromImage
 * @memberof Texture
 * @description create texturem from image data (e.g. image or canvas)
 * @param {Context} cgl
 * @param {Object} image
 * @param {Object} options
 */
Texture.createFromImage = function (cgl, img, options)
{
    options=options||{};
    var texture = new Texture(cgl, options);
    texture.flip = false;
    texture.image = img;
    texture.width = img.width;
    texture.height = img.height;
    texture.initTexture(img, options.filter);

    return texture;
};

// deprecated!
Texture.fromImage = function (cgl, img, filter, wrap)
{
    Log.error("deprecated texture from image...");

    var texture = new Texture(cgl);
    texture.flip = false;
    if (filter) texture.filter = filter;
    if (wrap) texture.wrap = wrap;
    texture.image = img;
    texture.initTexture(img);
    return texture;
};

/**
 * @static
 * @function isPowerOfTwo
 * @memberof Texture
 * @description returns true if x is power of two
 * @param {Number} x
 * @return {Boolean}
 */
Texture.isPowerOfTwo = function (x)
{
    return x == 1 || x == 2 || x == 4 || x == 8 || x == 16 || x == 32 || x == 64 || x == 128 || x == 256 || x == 512 || x == 1024 || x == 2048 || x == 4096 || x == 8192 || x == 16384;
};

Texture.FILTER_NEAREST = 0;
Texture.FILTER_LINEAR = 1;
Texture.FILTER_MIPMAP = 2;


Texture.WRAP_REPEAT = 0;
Texture.WRAP_MIRRORED_REPEAT = 1;
Texture.WRAP_CLAMP_TO_EDGE = 2;

Texture.TYPE_DEFAULT = 0;
Texture.TYPE_DEPTH = 1;
Texture.TYPE_FLOAT = 2;

export { Texture };
