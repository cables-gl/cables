let GltfMaterial = class
{
    constructor(gltf, obj)
    {
        this.json = obj || {};

        this._matDiffuseColor = [1, 1, 1, 1];
        this._matPbrMetalness = 0.0;
        this._matPbrRoughness = 1.0;
        this._matTexNormal = null;
        this._matTexDiffuse = null;

        if (this.json.pbrMetallicRoughness)
        {
            if (this.json.pbrMetallicRoughness.hasOwnProperty("baseColorFactor")) this._matDiffuseColor = this.json.pbrMetallicRoughness.baseColorFactor;
            if (this.json.pbrMetallicRoughness.hasOwnProperty("metallicFactor")) this._matPbrMetalness = this.json.pbrMetallicRoughness.metallicFactor;
            if (this.json.pbrMetallicRoughness.hasOwnProperty("roughnessFactor")) this._matPbrRoughness = this.json.pbrMetallicRoughness.roughnessFactor;
            if (this.json.pbrMetallicRoughness.hasOwnProperty("baseColorTexture"))
            {
                console.log("jo start texture", this.json);
                const idx = this.json.pbrMetallicRoughness.baseColorTexture.index;
                gltf.textures[idx] = gltf.textures[idx] || new GltfTexture(gltf, idx);
                this._matTexDiffuse = gltf.textures[idx];
            }
        }
        if (this.json.hasOwnProperty("normalTexture"))
        {
            console.log("jo start texture", this.json);
            const idx = this.json.normalTexture.index;
            gltf.textures[idx] = gltf.textures[idx] || new GltfTexture(gltf, idx);
            this._matTexNormal = gltf.textures[idx];
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
        const uniTexNormal = currentShader.materialPropUniforms.normalTexture;

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

        if (uniTexDiff && this._matTexDiffuse)
        {
            currentShader.pushTexture(currentShader.materialPropUniforms.diffuseTexture, this._matTexDiffuse.tex.tex, cgl.gl.TEXTURE_2D);
        }

        if (uniTexNormal && this._matTexNormal)
        {
            currentShader.pushTexture(currentShader.materialPropUniforms.normalTexture, this._matTexNormal.tex.tex, cgl.gl.TEXTURE_2D);
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
    }
};
