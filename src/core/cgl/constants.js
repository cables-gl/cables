const SHADER = {

    // default attributes
    SHADERVAR_VERTEX_POSITION: "vPosition",
    SHADERVAR_VERTEX_NUMBER: "attrVertIndex",
    SHADERVAR_VERTEX_TEXCOORD: "attrTexCoord",
    SHADERVAR_INSTANCE_MMATRIX: "instMat",

    // default uniforms
    SHADERVAR_UNI_PROJMAT: "projMatrix",
    SHADERVAR_UNI_VIEWMAT: "viewMatrix",
    SHADERVAR_UNI_MODELMAT: "modelMatrix",
    SHADERVAR_UNI_NORMALMAT: "normalMatrix",
    SHADERVAR_UNI_INVVIEWMAT: "inverseViewMatrix",
    SHADERVAR_UNI_VIEWPOS: "camPos",
};

const BLENDS = {
    BLEND_NONE: 0,
    BLEND_NORMAL: 1,
    BLEND_ADD: 2,
    BLEND_SUB: 3,
    BLEND_MUL: 4,
};

const DEG2RAD = Math.PI / 180.0;
const RAD2DEG = 180.0 / Math.PI;
export default {
    SHADER, BLENDS, RAD2DEG, DEG2RAD,
};
