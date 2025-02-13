import Framebuffer2 from "./cgl_framebuffer2.js";
import { Marker, WireCube, WirePoint } from "./cgl_marker.js";
import { Mesh, MESH } from "./cgl_mesh.js";
import { Uniform } from "./cgl_shader_uniform.js";
import { ShaderLibMods } from "./cgl_shader_lib.js";
import { UniColorShader } from "./cgl_unicolorshader.js";

import { Shader } from "./cgl_shader.js";
import { MESHES } from "./cgl_simplerect.js";
import {
    isWindows, getWheelSpeed, getWheelDelta, onLoadingAssetsFinished,
} from "./cgl_utils.js";
import {
    Texture,
} from "./cgl_texture.js";

import { TextureEffect } from "./cgl_textureeffect.js";
import { CONSTANTS } from "./constants.js";
import { ProfileData } from "./cgl_profiledata.js";
import { MatrixStack } from "../cg/cg_matrixstack.js";
import { Geometry } from "../cg/cg_geom.js";
import { BoundingBox } from "../cg/cg_boundingbox.js";
import CglContext from "./cgl_state.js";

const CGL = {
    "Framebuffer2": Framebuffer2,
    "Geometry": Geometry,
    "BoundingBox": BoundingBox,
    "Marker": Marker,
    "WirePoint": WirePoint,
    "WireCube": WireCube,
    "MatrixStack": MatrixStack,
    "Mesh": Mesh,
    "MESH": MESH,
    "ShaderLibMods": ShaderLibMods,
    "Shader": Shader,
    "Uniform": Uniform,
    "MESHES": MESHES,
    "Context": CglContext,
    "Texture": Texture,
    "TextureEffect": TextureEffect,
    "isWindows": isWindows,
    "getWheelSpeed": getWheelSpeed,
    "getWheelDelta": getWheelDelta,
    "onLoadingAssetsFinished": onLoadingAssetsFinished,
    "ProfileData": ProfileData,
    "UniColorShader": UniColorShader,
    ...CONSTANTS.BLEND_MODES,
    ...CONSTANTS.SHADER,
    ...CONSTANTS.MATH,
    ...CONSTANTS.BLEND_MODES,
};

window.CGL = CGL;

export { CGL };
