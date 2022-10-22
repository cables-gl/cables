import { Framebuffer } from "./cgl_framebuffer";
import { Framebuffer2 } from "./cgl_framebuffer2";
import { Marker, WireCube, WirePoint } from "./cgl_marker";
import { Mesh, MESH } from "./cgl_mesh";
import { Uniform } from "./cgl_shader_uniform";
import { ShaderLibMods } from "./cgl_shader_lib";
import { UniColorShader } from "./cgl_unicolorshader";


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
import { ProfileData } from "./cgl_profiledata";
import { MatrixStack } from "../cg/cg_matrixstack";
import { Geometry } from "../cg/cg_geom";
import { BoundingBox } from "../cg/cg_boundingbox";

const CGL = Object.assign(
    {
        Framebuffer,
        Framebuffer2,
        Geometry,
        BoundingBox,
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
        ProfileData,
        UniColorShader
    },
    CONSTANTS.BLEND_MODES,
    CONSTANTS.SHADER,
    CONSTANTS.MATH,
    CONSTANTS.BLEND_MODES,
);

window.CGL = CGL;

export { CGL };
