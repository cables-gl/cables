let whiteTex = null;
let greyTex = null;

let GltfMaterial = class
{
    constructor(gltf, obj)
    {
        this._matDiffuseColor = [1, 1, 1, 1];
        this._matPbrMetalness = 0.0;
        this._matPbrRoughness = 1.0;
        this._matUnlit = 0;
        this._matTexNormal = null;
        this._matTexDiffuse = null;
        this._matTexOcclusion = null;
        this._matTexMetalRough = null;
        this.json = obj || {};
        this.texTransform = [1, 1, 0, 0];

        if (!whiteTex)whiteTex = CGL.Texture.getColorTexture(cgl, 255, 255, 255, 1);
        if (!greyTex)greyTex = CGL.Texture.getColorTexture(cgl, 128, 128, 128, 1);

        if (this.json.extensions && this.json.extensions.hasOwnProperty("KHR_materials_unlit")) this._matUnlit = 1;

        if (this.json.pbrMetallicRoughness)
        {
            if (this.json.pbrMetallicRoughness.hasOwnProperty("baseColorFactor")) this._matDiffuseColor = this.json.pbrMetallicRoughness.baseColorFactor;
            if (this.json.pbrMetallicRoughness.hasOwnProperty("metallicFactor")) this._matPbrMetalness = this.json.pbrMetallicRoughness.metallicFactor;
            if (this.json.pbrMetallicRoughness.hasOwnProperty("roughnessFactor")) this._matPbrRoughness = this.json.pbrMetallicRoughness.roughnessFactor;
            if (this.json.pbrMetallicRoughness.hasOwnProperty("baseColorTexture"))
            {
                // const idx = this.json.pbrMetallicRoughness.baseColorTexture.index;

                const idx = gltf.json.textures[this.json.pbrMetallicRoughness.baseColorTexture.index].source;
                gltf.textures[idx] = gltf.textures[idx] || new GltfTexture(gltf, idx, this.json.pbrMetallicRoughness.baseColorTexture);
                this._matTexDiffuse = gltf.textures[idx];

                if (this.json.pbrMetallicRoughness.baseColorTexture.extensions &&
                 this.json.pbrMetallicRoughness.baseColorTexture.extensions.KHR_texture_transform)
                {
                    this.texTransform = [

                        this.json.pbrMetallicRoughness.baseColorTexture.extensions.KHR_texture_transform.scale[0],
                        this.json.pbrMetallicRoughness.baseColorTexture.extensions.KHR_texture_transform.scale[1],
                        this.json.pbrMetallicRoughness.baseColorTexture.extensions.KHR_texture_transform.offset[0],
                        this.json.pbrMetallicRoughness.baseColorTexture.extensions.KHR_texture_transform.offset[1]
                    ];
                    // console.log("textrans", this.texTransform);
                }
            }
            if (this.json.pbrMetallicRoughness.hasOwnProperty("metallicRoughnessTexture"))
            {
                const idx = gltf.json.textures[this.json.pbrMetallicRoughness.metallicRoughnessTexture.index].source;
                gltf.textures[idx] = gltf.textures[idx] || new GltfTexture(gltf, idx, this.json.pbrMetallicRoughness.metallicRoughnessTexture);
                this._matTexMetalRough = gltf.textures[idx];
            }
        }
        if (this.json.hasOwnProperty("normalTexture"))
        {
            const idx = gltf.json.textures[this.json.normalTexture.index].source;
            gltf.textures[idx] = gltf.textures[idx] || new GltfTexture(gltf, idx, this.json.normalTexture);
            this._matTexNormal = gltf.textures[idx];
        }
        if (this.json.hasOwnProperty("occlusionTexture"))
        {
            // const idx = this.json.occlusionTexture.index;
            const idx = gltf.json.textures[this.json.occlusionTexture.index].source;

            console.log("occlusion texture", gltf.textures[idx], idx, gltf.json.textures[idx], this.json);
            gltf.textures[idx] = gltf.textures[idx] || new GltfTexture(gltf, idx, this.json.occlusionTexture);
            this._matTexOcclusion = gltf.textures[idx];

            // console.log(this._matTexOcclusion)
        }
    }

    get name()
    {
        return this.json.name || "unnamed material";
    }

    bind(cgl, currentShader)
    {
        if (!currentShader) return console.log("no shader");
        if (!currentShader.materialPropUniforms) return console.log("noo");

        // currentShader.popTextures();
        const uniPbrMetalness = currentShader.materialPropUniforms.pbrMetalness;
        const uniPbrRoughness = currentShader.materialPropUniforms.pbrRoughness;
        const uniDiff = currentShader.materialPropUniforms.diffuseColor;
        const uniTexDiff = currentShader.materialPropUniforms.diffuseTexture;
        const uniTexOcc = currentShader.materialPropUniforms.occlusionTexture;
        const uniTexNormal = currentShader.materialPropUniforms.normalTexture;
        const uniUnlit = currentShader.materialPropUniforms.unlit;
        const uniTexTrans = currentShader.materialPropUniforms.texTransform;

        if (uniUnlit)
        {
            uniUnlit.setValue(this._matUnlit);
            // console.log("this._matUnlit",this._matUnlit);
        }
        if (uniDiff && this._matDiffuseColor)
        {
            // console.log("joo uniDiff");
            this._matDiffuseColorOrig = [uniDiff.getValue()[0], uniDiff.getValue()[1], uniDiff.getValue()[2], uniDiff.getValue()[3]];
            uniDiff.setValue(this._matDiffuseColor);
        }

        if (uniPbrMetalness)
            if (this._matPbrMetalness != null)
            {
                this._matPbrMetalnessOrig = uniPbrMetalness.getValue();
                uniPbrMetalness.setValue(this._matPbrMetalness);
            }

        if (uniPbrRoughness)
            if (this._matPbrRoughness != null)
            {
                this._matPbrRoughnessOrig = uniPbrRoughness.getValue();
                uniPbrRoughness.setValue(this._matPbrRoughness);
            }

        if (inUseMatTexProps.get())
        {
            if (uniTexTrans && this.texTransform)
            {
                // console.log("textransssssssssssss",this.texTransform)
                uniTexTrans.setValue(this.texTransform);
            }

            // console.log("text",currentShader.materialPropUniforms);
            if (uniTexDiff)
            {
                // console.log("text",currentShader.materialPropUniforms.difuseTexture);
                // if(this._matTexOcclusion)
                // currentShader.pushTexture(currentShader.materialPropUniforms.diffuseTexture, this._matTexOcclusion.tex, cgl.gl.TEXTURE_2D);
                if (uniTexDiff.isValidLoc())
                    currentShader.setUniformTexture(currentShader.materialPropUniforms.diffuseTexture, (this._matTexDiffuse || whiteTex).tex, cgl.gl.TEXTURE_2D);
                // else console.log("nivalid texdiff", uniTexDiff);

                // console.log("diffuseuni",currentShader.materialPropUniforms.diffuseTexture)
            }

            if (uniTexOcc)
            {
                // console.log("text",currentShader.materialPropUniforms.diffuseTexture);
                // if(this._matTexOcclusion)
                if (uniTexOcc.isValidLoc())
                {
                    currentShader.setUniformTexture(currentShader.materialPropUniforms.occlusionTexture, (this._matTexOcclusion || whiteTex).tex, cgl.gl.TEXTURE_2D);
                    // console.log("1111");
                }
                // else
                // currentShader.pushTexture(currentS c c chader.materialPropUniforms.diffuseTexture, this._matTexDiffuse.tex, cgl.gl.TEXTURE_2D);

                // console.log("diffuseuni",currentShader.materialPropUniforms.diffuseTexture)
            }
            if (uniTexNormal)
            {
                if (uniTexNormal.isValidLoc())
                    currentShader.setUniformTexture(currentShader.materialPropUniforms.normalTexture, (this._matTexNormal || whiteTex).tex, cgl.gl.TEXTURE_2D);
            }
        }
    }

    unbind(cgl, currentShader)
    {
        if (!currentShader) return;
        const uniDiff = currentShader.uniformColorDiffuse;

        const uniPbrMetalness = currentShader.uniformPbrMetalness;
        const uniPbrRoughness = currentShader.uniformPbrRoughness;

        if (uniDiff && this._matDiffuseColor) uniDiff.setValue(this._matDiffuseColorOrig);
        if (uniPbrMetalness && this._matPbrMetalnessOrig != undefined) uniPbrMetalness.setValue(this._matPbrMetalnessOrig);
        if (uniPbrRoughness && this._matPbrRoughnessOrig != undefined) uniPbrRoughness.setValue(this._matPbrRoughnessOrig);

        const uniTexNormal = currentShader.materialPropUniforms.normalTexture;
        if (uniTexNormal) currentShader.setUniformTexture(currentShader.materialPropUniforms.normalTexture, greyTex.tex, cgl.gl.TEXTURE_2D);

        const uniTexOcclusion = currentShader.materialPropUniforms.occlusionTexture;
        if (uniTexOcclusion) currentShader.setUniformTexture(currentShader.materialPropUniforms.occlusionTexture, whiteTex.tex, cgl.gl.TEXTURE_2D);

        const uniTexDiff = currentShader.materialPropUniforms.diffuseTexture;
        if (uniTexDiff) currentShader.setUniformTexture(currentShader.materialPropUniforms.occlusionTexture, whiteTex.tex, cgl.gl.TEXTURE_2D);
    }
};
