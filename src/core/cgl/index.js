import Framebuffer from "./cgl_framebuffer";
import Framebuffer2, { fbs } from "./cgl_framebuffer2";
import Geometry from "./cgl_geom";
import * as Markers from "./cgl_marker";
import MatrixStack from "./cgl_matrixstack";
import Mesh, { MESH } from "./cgl_mesh";
import extendMeshWithFeedback from "./cgl_mesh_feedback";
import ShaderLibMods from "./cgl_shader_lib";
import Uniform from "./cgl_shader_uniform";
import Shader, * as SHADER_VARS from "./cgl_shader";
import MESHES from "./cgl_simplerect";
import Context, * as BLENDS from "./cgl_state";
import * as Utils from "./cgl_utils";
import Texture, * as TEXTURE_VARS from "./cgl_texture";
import TextureEffect from "./cgl_textureeffect";

extendMeshWithFeedback(Mesh);
const { BLENDS: _BLENDS } = BLENDS;
const { SHADER_VARS: _SHADER_VARS } = SHADER_VARS;
// console.log({ SHADER_VARS, BLENDS, yolo });
const CGL = {
    ..._SHADER_VARS,
    ..._BLENDS,
    Framebuffer,
    Framebuffer2,
    Geometry,
    ...Markers,
    MatrixStack,
    Mesh,
    MESH,
    ShaderLibMods,
    Shader,
    Uniform,
    MESHES,
    Context,
    ...TEXTURE_VARS,
    Texture,
    TextureEffect,
    ...fbs,
    ...Utils,
    // currentTextureEffect() {},
    /* FROM cgl_framebuffer2.js */
    // Framebuffer2DrawTargetsDefault: null,
    // Framebuffer2BlittingFramebuffer: null,
    // Framebuffer2FinalFramebuffer: null,
};

console.log("CGL before export", CGL);

export default CGL;
