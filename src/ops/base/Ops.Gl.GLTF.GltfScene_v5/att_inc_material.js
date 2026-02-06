let GltfMaterial = class
{
    constructor(obj)
    {
        this.json = obj || {};

        if (!this.json.pbrMetallicRoughness.hasOwnProperty("baseColorFactor")) this._matDiffuseColor = [1, 1, 1, 1];
        else this._matDiffuseColor = this.json.pbrMetallicRoughness.baseColorFactor;

        this._matDiffuseColor = this.json.pbrMetallicRoughness.baseColorFactor;

        if (!this.json.pbrMetallicRoughness.hasOwnProperty("metallicFactor")) this._matPbrMetalness = 0.0;
        else this._matPbrMetalness = this.json.pbrMetallicRoughness.metallicFactor;

        if (!this.json.pbrMetallicRoughness.hasOwnProperty("roughnessFactor")) this._matPbrRoughness = 1.0;
        else this._matPbrRoughness = this.json.pbrMetallicRoughness.roughnessFactor;
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

        if (uniDiff && this._matDiffuseColor)
        {
            this._matDiffuseColorOrig = [uniDiff.getValue()[0], uniDiff.getValue()[1], uniDiff.getValue()[2], uniDiff.getValue()[3]];
            uniDiff.setValue(this._matDiffuseColor);
        }

        if (uniPbrMetalness)
            if (this._matPbrMetalness != null)
            {
                this._matPbrMetalnessOrig = uniPbrMetalness.getValue();
                uniPbrMetalness.setValue(this._matPbrMetalness);
            }
            else
                uniPbrMetalness.setValue(0);

        if (uniPbrRoughness)
            if (this._matPbrRoughness != null)
            {
                this._matPbrRoughnessOrig = uniPbrRoughness.getValue();
                uniPbrRoughness.setValue(this._matPbrRoughness);
            }
            else
            {
                uniPbrRoughness.setValue(0);
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
