import { ShaderGraph } from "./cgl_shadergraph.js";

export class SgLangWebGl
{
    lang = ShaderGraph.LANG_GLSL;
    strTypeVec4 = "vec4";
    strTypeVec3 = "vec3";
    strTypeVec2 = "vec2";
    constructor()
    {

    }

    isTypeDef(str)
    {
        return str == "void" || str == "float" || str == "sampler2D" || str == "vec2" || str == "vec3" || str == "vec4" || str == "void" || str == "mat4" || str == "mat3" || str == "mat2" || str == "out";
    }

}
