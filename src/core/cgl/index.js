import { Framebuffer } from "./cgl_framebuffer";
import { Framebuffer2 } from "./cgl_framebuffer2";
import { Geometry } from "./cgl_geom";
import { Marker, WireCube, WirePoint } from "./cgl_marker";
import { MatrixStack } from "./cgl_matrixstack";
import { Mesh, MESH } from "./cgl_mesh";
import { Uniform } from "./cgl_shader_uniform";
import { ShaderLibMods } from "./cgl_shader_lib";

import { Shader } from "./cgl_shader";
import { MESHES } from "./cgl_simplerect";
import { Context } from "./cgl_state";
import {
    isWindows, getWheelSpeed, getWheelDelta, onLoadingAssetsFinished,
} from "./cgl_utils";
import {
    Texture,
} from "./cgl_texture";

import { TextureEffect } from "./cgl_textureeffect";
import { CONSTANTS } from "./constants";
import { profileData } from "./cgl_profiledata";

// console.log({ SHADER_VARS, BLENDS, yolo });
const CGL = Object.assign(
    {
        Framebuffer,
        Framebuffer2,
        Geometry,
        Marker,
        WirePoint,
        WireCube,
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
        isWindows,
        getWheelSpeed,
        getWheelDelta,
        onLoadingAssetsFinished,
        profileData,
    },
    CONSTANTS.BLEND_MODES,
    CONSTANTS.SHADER,
    CONSTANTS.MATH,
    CONSTANTS.BLEND_MODES,
);

window.CGL = CGL;

export { CGL };
