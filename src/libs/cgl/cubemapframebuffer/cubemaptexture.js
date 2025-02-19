const DEFAULT_TEXTURE_SIZE = 8;

export class CubemapTexture
{
    constructor(cgl, options)
    {
        this.id = CABLES.uuid();
        this.name = options.name || "unknown cubemap texture";
        this._cgl = cgl;
        this.textureType = CGL.Texture.TYPE_DEFAULT;
        this._options = options;

        if (!this._cgl.gl) return;

        this._cubemapFaces = [
            this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];

        this.cubemap = this.tex = this._cgl.gl.createTexture();

        this.texTarget = this._cgl.gl.TEXTURE_CUBE_MAP;

        this.width = DEFAULT_TEXTURE_SIZE;
        this.height = DEFAULT_TEXTURE_SIZE;

        this.filter = options.filter || CGL.Texture.FILTER_NEAREST;
        this.wrap = options.wrap || CGL.Texture.WRAP_CLAMP_TO_EDGE;
        this.unpackAlpha = options.unpackAlpha || true;

        this.flip = options.flip || true;

        if (!options.hasOwnProperty("pixelFormat") || !options.pixelFormat)
        {
            if (options.isFloatingPointTexture) options.pixelFormat = CGL.Texture.PFORMATSTR_RGBA32F;
            else options.pixelFormat = CGL.Texture.PFORMATSTR_RGBA8UB;
        }

        this.pixelFormat = options.pixelFormat;

        // if (options.isFloatingPointTexture) this.textureType = Texture.TYPE_FLOAT;

        this._cgl.profileData.profileTextureNew++;

        this.setSize(options.width, options.height);
    }

    getInfo()
    {
        return { "pixelFormat": this.pixelFormat };
    }

    setSize(w, h)
    {
        // if (this.width == w && this.height == h) return;

        this.delete();
        this.cubemap = this.tex = this._cgl.gl.createTexture();

        this._cgl.checkFrameStarted("cubemap corelib setsize");

        if (w != w || w <= 0 || !w) w = DEFAULT_TEXTURE_SIZE;
        if (h != h || h <= 0 || !h) h = DEFAULT_TEXTURE_SIZE;

        if (w > this._cgl.maxTexSize || h > this._cgl.maxTexSize) console.error("texture size too big! " + w + "x" + h + " / max: " + this._cgl.maxTexSize);

        w = Math.min(w, this._cgl.maxTexSize);
        h = Math.min(h, this._cgl.maxTexSize);

        w = Math.floor(w);
        h = Math.floor(h);

        this.width = w;
        this.height = h;

        this._cgl.gl.bindTexture(this.texTarget, this.tex);
        this._cgl.profileData.profileTextureResize++;

        const info = CGL.Texture.setUpGlPixelFormat(this._cgl, this._options.pixelFormat);
        this.pixelFormat = info.pixelFormat;

        if (CGL.Texture.isPixelFormatHalfFloat(info.pixelFormat))
        {
            const extcb = this._cgl.enableExtension("EXT_color_buffer_half_float");

            if (!this._cgl.enableExtension("OES_texture_float_linear"))
            {
                this.filter = CGL.Texture.FILTER_NEAREST;
            }
        }
        else if (CGL.Texture.isPixelFormatFloat(info.pixelFormat))
        {
            if (!this._cgl.enableExtension("OES_texture_float_linear"))
            {
                console.log("no linear pixelformat,using nearest");
                this.filter = CGL.Texture.FILTER_NEAREST;
            }
        }
        // console.log("cubemaptex setfilter...");

        for (let i = 0; i < 6; i++)
        {
            // console.log("cube tex ", i);

            // if (this._cgl.glVersion == 1)console.log("webgl1");
            // {
            // if (this._cgl.glUseHalfFloatTex)
            // {
            //     const ext = this._cgl.enableExtension("OES_texture_half_float");
            //     if (this._cgl.glVersion == 1 && !ext) throw new Error("no half float texture extension");

            //     this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, this._cgl.gl.RGBA, this.width, this.height, 0, this._cgl.gl.RGBA, ext.HALF_FLOAT_OES, null);
            // }
            // else
            // {
            //     const ext = this._cgl.enableExtension("OES_texture_float");

            //     this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, this._cgl.gl.RGBA, this.width, this.height, 0, this._cgl.gl.RGBA, this._cgl.gl.FLOAT, null);
            // }
            //     this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, this._cgl.gl.RGBA, this.width, this.height, 0, this._cgl.gl.RGBA, this._cgl.gl.UNSIGNED_BYTE, null);
            // }
            // else
            // {
            // this._cgl.enableExtension("EXT_color_buffer_float");
            // this._cgl.enableExtension("OES_texture_float_linear"); // yes, i am sure, this is a webgl 1 and 2 ext

            // console.log(info);
            this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, info.glInternalFormat, this.width, this.height, 0, info.glDataFormat, info.glDataType, null);

            // if (this.textureType == Texture.TYPE_FLOAT)
            // {
            //     // console.log("cubemap FLOAT TEX", this._options);
            //     this._cgl.enableExtension("EXT_color_buffer_float");
            //     this._cgl.enableExtension("OES_texture_float_linear"); // yes, i am sure, this is a webgl 1 and 2 ext

            //     this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, this._cgl.gl.RGBA32F, this.width, this.height, 0, this._cgl.gl.RGBA, this._cgl.gl.FLOAT, null);
            // }
            // else
            // {
            //     this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, this._cgl.gl.RGBA, this.width, this.height, 0, this._cgl.gl.RGBA, this._cgl.gl.UNSIGNED_BYTE, null);
            // }
            // }
            // * NOTE: was gl.RGBA32F && gl.FLOAT instead of gl.RGBA && gl.UNSIGNED_BYTE
        }

        this._setFilter();

        // console.log("cubemaptex update mips ..");
        this.updateMipMap();
        // console.log("cubemaptex ende");
        this._cgl.gl.bindTexture(this.texTarget, null);
    }

    _setFilter()
    {
        this._cgl.checkFrameStarted("cubemap corelib");

        this._cgl.gl.pixelStorei(this._cgl.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.unpackAlpha);

        if (CGL.Texture.isPixelFormatFloat(this.pixelFormat) && this.filter == CGL.Texture.FILTER_MIPMAP)
        {
            console.log("texture: HDR and mipmap filtering at the same time is not possible");
            this.filter = CGL.Texture.FILTER_LINEAR;
        }

        if (this._cgl.glVersion == 1 && !CGL.Texture.isPowerOfTwo())
        {
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.NEAREST);
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.NEAREST);

            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.CLAMP_TO_EDGE);
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.CLAMP_TO_EDGE);

            this.filter = CGL.Texture.FILTER_NEAREST;
            this.wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
        }
        else
        {
            if (this.wrap == CGL.Texture.WRAP_CLAMP_TO_EDGE)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.CLAMP_TO_EDGE);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.CLAMP_TO_EDGE);
            }
            else if (this.wrap == CGL.Texture.WRAP_REPEAT)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.REPEAT);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.REPEAT);
            }
            else if (this.wrap == CGL.Texture.WRAP_MIRRORED_REPEAT)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.MIRRORED_REPEAT);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.MIRRORED_REPEAT);
            }
            else
            {
                throw new Error("[CubemapTexture] unknown texture filter!" + this.filter);
            }

            if (this.filter == CGL.Texture.FILTER_NEAREST)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.NEAREST);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.NEAREST);
            }
            else if (this.filter == CGL.Texture.FILTER_LINEAR)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.LINEAR);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.LINEAR);
            }
            else if (this.filter == CGL.Texture.FILTER_MIPMAP)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.LINEAR);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.LINEAR_MIPMAP_LINEAR);
            }
            else
            {
                throw new Error("[CubemapTexture] unknown texture filter!" + this.filter);
            }
        }
    }

    updateMipMap()
    {
        // if (!((this._cgl.glVersion == 2 || Texture.isPowerOfTwo()) && this.filter == CGL.Texture.FILTER_MIPMAP)) return;

        if (this.filter == CGL.Texture.FILTER_MIPMAP)
        {
            this._cgl.gl.bindTexture(this.texTarget, this.tex);
            this._cgl.gl.generateMipmap(this.texTarget);
            this._cgl.profileData.profileGenMipMap++;
        }
    }

    delete()
    {
        this._cgl.gl.deleteTexture(this.tex);
    }
}
