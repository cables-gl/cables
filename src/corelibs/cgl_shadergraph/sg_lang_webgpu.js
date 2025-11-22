import { ShaderGraph } from "./cgl_shadergraph.js";

export class SgLangWebGpu
{
    lang = ShaderGraph.LANG_WGSL;

    strTypeVec4 = "vec4f";
    strTypeVec3 = "vec3f";
    strTypeVec2 = "vec2f";

    constructor()
    {

    }

    getVarDefString(type, val)
    {

    }

    isTypeDef(str)
    {
        return str == "fn" || str == "float" || str == "sampler2D"
             || str == this.strTypeVec4
             || str == this.strTypeVec3
             || str == this.strTypeVec2
             || str == "void" || str == "mat4" || str == "mat3" || str == "mat2" || str == "out";
    }
}
