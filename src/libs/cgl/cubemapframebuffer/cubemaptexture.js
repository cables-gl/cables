const DEFAULT_TEXTURE_SIZE = 8;

class CubemapTexture
{
    constructor(cgl, options)
    {
        if (!options) options = {
            "width": DEFAULT_TEXTURE_SIZE,
            "height": DEFAULT_TEXTURE_SIZE
        };

        this._cgl = cgl;

        this._cubemapFaces = [
            this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];

        this.tex = this._cgl.gl.createTexture();
        this.cubemap = this.tex;
        this.id = CABLES.uuid();

        this.texTarget = this._cgl.gl.TEXTURE_CUBE_MAP;
        this.anisotropic = 0;

        this.filter = options.filter || CGL.Texture.FILTER_NEAREST;
        this.wrap = options.wrap || CGL.Texture.WRAP_CLAMP_TO_EDGE;
        this.unpackAlpha = options.unpackAlpha || true;

        this.flip = options.flip || true;
        this.flipped = false;
        this._fromData = true;
        this.name = options.name || "unknown cubemap texture";

        this._cgl.profileData.profileTextureNew++;

        this.setSize(options.width, options.height);
    }

    setSize(w, h)
    {
        if (w != w || w <= 0 || !w) w = DEFAULT_TEXTURE_SIZE;
        if (h != h || h <= 0 || !h) h = DEFAULT_TEXTURE_SIZE;

        if (w > this._cgl.maxTexSize || h > this._cgl.maxTexSize) console.error("texture size too big! " + w + "x" + h + " / max: " + this._cgl.maxTexSize);

        w = Math.min(w, this._cgl.maxTexSize);
        h = Math.min(h, this._cgl.maxTexSize);

        w = Math.floor(w);
        h = Math.floor(h);

        if (this.width == w && this.height == h) return;

        this.width = w;
        this.height = h;

        this._cgl.gl.bindTexture(this.texTarget, this.tex);
        this._cgl.profileData.profileTextureResize++;

        if (this.textureType == CGL.Texture.TYPE_FLOAT && this.filter == CGL.Texture.FILTER_LINEAR && !this._cgl.gl.getExtension("OES_texture_float_linear"))
        {
            console.warn("this graphics card does not support floating point texture linear interpolation! using NEAREST");
            this.filter = CGL.Texture.FILTER_NEAREST;
        }

        this._setFilter();

        for (let i = 0; i < 6; i++)
        {
            if (this._cgl.glVersion == 1)
            {
                // if (this._cgl.glUseHalfFloatTex)
                // {
                //     const ext = this._cgl.gl.getExtension("OES_texture_half_float");
                //     if (this._cgl.glVersion == 1 && !ext) throw new Error("no half float texture extension");

                //     this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, this._cgl.gl.RGBA, this.width, this.height, 0, this._cgl.gl.RGBA, ext.HALF_FLOAT_OES, null);
                // }
                // else
                // {
                //     const ext = this._cgl.gl.getExtension("OES_texture_float");

                //     this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, this._cgl.gl.RGBA, this.width, this.height, 0, this._cgl.gl.RGBA, this._cgl.gl.FLOAT, null);
                // }
                this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, this._cgl.gl.RGBA, this.width, this.height, 0, this._cgl.gl.RGBA, this._cgl.gl.UNSIGNED_BYTE, null);
            }
            else
            {
                this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, this._cgl.gl.RGBA, this.width, this.height, 0, this._cgl.gl.RGBA, this._cgl.gl.UNSIGNED_BYTE, null);
            }
            // * NOTE: was gl.RGBA32F && gl.FLOAT instead of gl.RGBA && gl.UNSIGNED_BYTE
        }

        this.updateMipMap();
        this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, null);
    }

    _setFilter()
    {
        if (!this._fromData)
        {
            this._cgl.gl.pixelStorei(this._cgl.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.unpackAlpha);
        }

        if (this.textureType == CGL.Texture.TYPE_FLOAT && this.filter == CGL.Texture.FILTER_MIPMAP)
        {
            console.log("texture: HDR and mipmap filtering at the same time is not possible");
            this.filter = CGL.Texture.FILTER_LINEAR;
        }

        if (this._cgl.glVersion == 1 && !this.isPowerOfTwo())
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
                console.log("unknown texture filter!", this.filter);
                throw new Error("unknown texture filter!" + this.filter);
            }

            // if (this.anisotropic)
            // {
            //     const ext = this._cgl.gl.getExtension("EXT_texture_filter_anisotropic");
            //     if (ext)
            //     {
            //         const max = this._cgl.gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
            //         this._cgl.gl.texParameterf(this._cgl.gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(max, this.anisotropic));
            //     }
            // }
        }
    }

    isPowerOfTwo(x)
    {
        return x == 1 || x == 2 || x == 4 || x == 8 || x == 16 || x == 32 || x == 64 || x == 128 || x == 256 || x == 512 || x == 1024 || x == 2048 || x == 4096 || x == 8192 || x == 16384;
    }

    updateMipMap()
    {
        if ((this._cgl.glVersion == 2 || this.isPowerOfTwo()) && this.filter == CGL.Texture.FILTER_MIPMAP)
        {
            this._cgl.gl.generateMipmap(this.texTarget);
            this._cgl.profileData.profileGenMipMap++;
        }
    }
}

export { CubemapTexture };
