import { Framebuffer } from "./cgl_framebuffer";
import { fbs, Framebuffer2 } from "./cgl_framebuffer2";
import Geometry from "./cgl_geom";
import * as Markers from "./cgl_marker";
import MatrixStack from "./cgl_matrixstack";
import { Mesh, MESH } from "./cgl_mesh";
import extendMeshWithFeedback from "./cgl_mesh_feedback";



import { Uniform } from "./cgl_shader_uniform";
import { ShaderLibMods } from "./cgl_shader_lib";

import Shader, * as SHADER_VARS from "./cgl_shader";
import MESHES from "./cgl_simplerect";
import Context, * as BLENDS from "./cgl_state";
import * as Utils from "./cgl_utils";
import {
    Texture, tempTexture, tempTextureEmpty, DEFAULT_TEXTURE_SIZE,
} from "./cgl_texture";

import { TextureEffect } from "./cgl_textureeffect";

import { profileData } from "./cgl_profiledata";

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
    Texture,
    TextureEffect,
    ...fbs,
    ...Utils,
    profileData,
    tempTexture,
    tempTextureEmpty,
    DEFAULT_TEXTURE_SIZE,
};

window.CGL = CGL;
export { CGL };
