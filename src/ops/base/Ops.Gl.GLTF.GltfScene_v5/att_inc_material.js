let whiteTex = null;
let neutralNormalTex = null;
let greyTex = null;

function getTextureSourceForIndex(gltf, idx)
{
    let t = gltf.json.textures[idx];
    if (t.extensions && t.extensions.KHR_texture_basisu) t = t.extensions.KHR_texture_basisu;

    return t.source;
}

function getTextureSamplerForIndex(gltf, idx)
{
    let t = gltf.json.textures[idx];
    if (t.extensions && t.extensions.KHR_texture_basisu) t = t.extensions.KHR_texture_basisu;

    return gltf.json.samplers[t.sampler];
}

let GltfMaterial = class
{
    _matDiffuseColor = [1, 1, 1, 1];
    _matPbrMetalness = 0.0;
    _matPbrRoughness = 1.0;
    _matUnlit = 0;
    _matTexNormal = null;
    _matTexDiffuse = null;
    _matTexLightmap = null;
    _matTexOcclusion = null;
    _matTexMetalRough = null;
    _matTexEmissive = null;
    texTransform = [1, 1, 0, 0];

    constructor(gltf, obj)
    {
        this.json = obj || {};
        if (!whiteTex)whiteTex = CGL.Texture.getColorTexture(cgl, 255, 255, 255, 1);
        if (!neutralNormalTex)neutralNormalTex = CGL.Texture.getColorTexture(cgl, 128, 128, 255, 1);
        if (!greyTex)greyTex = CGL.Texture.getColorTexture(cgl, 128, 128, 128, 1);

        if (this.json.extensions && this.json.extensions.hasOwnProperty("KHR_materials_unlit")) this._matUnlit = 1;

        if (this.json.extensions && this.json.extensions.hasOwnProperty("KHR_materials_emissive_strength"))
            console.log("todo: emissive strength", this.json.extensions.KHR_materials_emissive_strength.emissiveStrength);

        if (this.json.extensions && this.json.extensions.hasOwnProperty("KHR_materials_ior"))
            console.log("todo: ior", this.json.extensions.KHR_materials_ior.ior);

        if (this.json.extensions && this.json.extensions.hasOwnProperty("KHR_materials_clearcoat"))
            console.log("todo: clearcoat", this.json.extensions.KHR_materials_clearcoat.clearcoatFactor);

        if (this.json.extensions && this.json.extensions.hasOwnProperty("CABLES_material"))
        {

            if (this.json.extensions.CABLES_material.lightMapTexture)
            {
                const idx = getTextureSourceForIndex(gltf, this.json.extensions.CABLES_material.lightMapTexture.index);
                gltf.textures[idx] = gltf.textures[idx] || new GltfTexture(gltf, idx, this.json.extensions.CABLES_material.lightMapTexture);
                this._matTexLightmap = gltf.textures[idx];
            }

        }

        if (this.json.pbrMetallicRoughness)
        {
            if (this.json.pbrMetallicRoughness.hasOwnProperty("baseColorFactor")) this._matDiffuseColor = this.json.pbrMetallicRoughness.baseColorFactor;
            if (this.json.pbrMetallicRoughness.hasOwnProperty("metallicFactor")) this._matPbrMetalness = this.json.pbrMetallicRoughness.metallicFactor;
            if (this.json.pbrMetallicRoughness.hasOwnProperty("roughnessFactor")) this._matPbrRoughness = this.json.pbrMetallicRoughness.roughnessFactor;
            if (this.json.pbrMetallicRoughness.hasOwnProperty("baseColorTexture"))
            {
                const idx = getTextureSourceForIndex(gltf, this.json.pbrMetallicRoughness.baseColorTexture.index);

                gltf.textures[idx] = gltf.textures[idx] || new GltfTexture(gltf, idx, this.json.pbrMetallicRoughness.baseColorTexture, getTextureSamplerForIndex(gltf, this.json.pbrMetallicRoughness.baseColorTexture.index));

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
                }
            }
            if (this.json.pbrMetallicRoughness.hasOwnProperty("metallicRoughnessTexture"))
            {
                const idx = getTextureSourceForIndex(gltf, this.json.pbrMetallicRoughness.metallicRoughnessTexture.index);
                gltf.textures[idx] = gltf.textures[idx] || new GltfTexture(gltf, idx, this.json.pbrMetallicRoughness.metallicRoughnessTexture);
                this._matTexMetalRough = gltf.textures[idx];
            }
        }
        if (this.json.hasOwnProperty("normalTexture"))
        {
            const idx = getTextureSourceForIndex(gltf, this.json.normalTexture.index);
            gltf.textures[idx] = gltf.textures[idx] || new GltfTexture(gltf, idx, this.json.normalTexture);
            this._matTexNormal = gltf.textures[idx];
        }
        if (this.json.hasOwnProperty("emissiveTexture"))
        {
            const idx = getTextureSourceForIndex(gltf, this.json.emissiveTexture.index);
            gltf.textures[idx] = gltf.textures[idx] || new GltfTexture(gltf, idx, this.json.emissiveTexture);
            this._matTexEmissive = gltf.textures[idx];
        }
        if (this.json.hasOwnProperty("occlusionTexture"))
        {
            const idx = getTextureSourceForIndex(gltf, this.json.occlusionTexture.index);
            gltf.textures[idx] = gltf.textures[idx] || new GltfTexture(gltf, idx, this.json.occlusionTexture);
            this._matTexOcclusion = gltf.textures[idx];
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

        const uniPbrMetalness = currentShader.materialPropUniforms.pbrMetalness;
        const uniPbrRoughness = currentShader.materialPropUniforms.pbrRoughness;
        const uniDiff = currentShader.materialPropUniforms.diffuseColor;
        const uniTexDiff = currentShader.materialPropUniforms.diffuseTexture;
        const uniTexMr = currentShader.materialPropUniforms.metalRoughnessTexture;
        const uniTexOcc = currentShader.materialPropUniforms.occlusionTexture;
        const uniTexLight = currentShader.materialPropUniforms.lightmapTexture;
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

        if (uniPbrMetalness && !(uniTexMr && uniTexMr.isValidLoc()))
            if (this._matPbrMetalness != null)
            {
                this._matPbrMetalnessOrig = uniPbrMetalness.getValue();
                uniPbrMetalness.setValue(this._matPbrMetalness);
            }

        if (uniPbrRoughness && !(uniTexMr && uniTexMr.isValidLoc()))
            if (this._matPbrRoughness != null)
            {
                this._matPbrRoughnessOrig = uniPbrRoughness.getValue();
                uniPbrRoughness.setValue(this._matPbrRoughness);
            }

        if (inUseMatTexProps.get())
        {
            if (uniTexTrans && this.texTransform)
                uniTexTrans.setValue(this.texTransform);

            if (uniTexDiff && uniTexDiff.isValidLoc())
                currentShader.setUniformTexture(currentShader.materialPropUniforms.diffuseTexture, (this._matTexDiffuse || whiteTex).tex, cgl.gl.TEXTURE_2D);

            if (uniTexMr && uniTexMr.isValidLoc())
            {
                uniPbrRoughness?.setValue(1);
                uniPbrMetalness?.setValue(1);
                currentShader.setUniformTexture(currentShader.materialPropUniforms.metalRoughnessTexture, (this._matTexMetalRough || whiteTex).tex, cgl.gl.TEXTURE_2D);
            }

            if (uniTexOcc && uniTexOcc.isValidLoc())
                currentShader.setUniformTexture(currentShader.materialPropUniforms.occlusionTexture, (this._matTexOcclusion || whiteTex).tex, cgl.gl.TEXTURE_2D);

            if (uniTexLight && uniTexLight.isValidLoc())
            {
                currentShader.setUniformTexture(currentShader.materialPropUniforms.lightmapTexture, (this._matTexLightmap || whiteTex).tex, cgl.gl.TEXTURE_2D);
                // console.log("lightmapppp",this._matTexLightmap);

            }

            if (uniTexNormal && uniTexNormal.isValidLoc())
            {
                currentShader.setUniformTexture(currentShader.materialPropUniforms.normalTexture, (this._matTexNormal || neutralNormalTex).tex, cgl.gl.TEXTURE_2D);
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
        if (uniTexNormal) currentShader.setUniformTexture(currentShader.materialPropUniforms.normalTexture, neutralNormalTex.tex, cgl.gl.TEXTURE_2D);

        const uniTexOcclusion = currentShader.materialPropUniforms.occlusionTexture;
        if (uniTexOcclusion) currentShader.setUniformTexture(currentShader.materialPropUniforms.occlusionTexture, whiteTex.tex, cgl.gl.TEXTURE_2D);

        const uniTexDiff = currentShader.materialPropUniforms.diffuseTexture;
        if (uniTexDiff) currentShader.setUniformTexture(currentShader.materialPropUniforms.occlusionTexture, whiteTex.tex, cgl.gl.TEXTURE_2D);

        const uniTexMr = currentShader.materialPropUniforms.metalRoughnessTexture;
        if (uniTexMr) currentShader.setUniformTexture(currentShader.materialPropUniforms.metalRoughnessTexture, whiteTex.tex, cgl.gl.TEXTURE_2D);
    }
};
