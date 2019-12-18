import { Framebuffer } from "./cgl_framebuffer";
import { Framebuffer2 } from "./cgl_framebuffer2";
import { Geometry } from "./cgl_geom";
import { BoundingBox } from "./cgl_boundingbox";
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

import { ShadowStore } from "./cgl_shadowstore";
import { TextureEffect } from "./cgl_textureeffect";
import { CONSTANTS } from "./constants";
import { profileData } from "./cgl_profiledata";

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
        ShadowStore,
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
