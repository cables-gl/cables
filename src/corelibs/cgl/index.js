import { Anim } from "cables";
import { Framebuffer2 } from "./cgl_framebuffer2.js";
import { Marker, WireCube, WirePoint } from "./cgl_marker.js";
import { Mesh, MESH } from "./cgl_mesh.js";
import { Uniform } from "./cgl_shader_uniform.js";
import { ShaderLibMods } from "./cgl_shader_lib.js";
import { UniColorShader } from "./cgl_unicolorshader.js";
import { Shader } from "./cgl_shader.js";
import { MESHES } from "./cgl_simplerect.js";
import { getWheelSpeed, getWheelDelta, onLoadingAssetsFinished } from "./cgl_utils.js";
import { Texture } from "./cgl_texture.js";
import { TextureEffect } from "./cgl_textureeffect.js";
import { CONSTANTS } from "./constants.js";
import { ProfileData } from "./cgl_profiledata.js";
import { MatrixStack, Geometry, BoundingBox } from "../cg/index.js";
import { CglContext } from "./cgl_state.js";

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
    "getWheelSpeed": getWheelSpeed,
    "getWheelDelta": getWheelDelta,
    "Context": CglContext,
    "Texture": Texture,
    "TextureEffect": TextureEffect,
    "onLoadingAssetsFinished": onLoadingAssetsFinished,
    "ProfileData": ProfileData,
    "UniColorShader": UniColorShader,
    ...CONSTANTS.BLEND_MODES,
    ...CONSTANTS.SHADER,
    ...CONSTANTS.MATH,
    ...CONSTANTS.BLEND_MODES,
};

window.CABLES = window.CABLES || {};
window.CABLES.CGL = window.CABLES.CGL || CGL;
window.CGL = window.CGL || CGL;

/**
 * @param {number} time
 * @param {quat} q
 * @param {Anim} animx
 * @param {Anim} animy
 * @param {Anim} animz
 * @param {Anim} animw
 */
Anim.slerpQuaternion = function (time, q, animx, animy, animz, animw)
{
    if (!Anim.slerpQuaternion.q1)
    {
        Anim.slerpQuaternion.q1 = quat.create();
        Anim.slerpQuaternion.q2 = quat.create();
    }

    const i1 = animx.getKeyIndex(time);
    let i2 = i1 + 1;
    if (i2 >= animx.keys.length) i2 = animx.keys.length - 1;

    if (i1 == i2)
    {
        quat.set(q, animx.keys[i1].value, animy.keys[i1].value, animz.keys[i1].value, animw.keys[i1].value);
    }
    else
    {
        const key1Time = animx.keys[i1].time;
        const key2Time = animx.keys[i2].time;
        const perc = (time - key1Time) / (key2Time - key1Time);

        quat.set(Anim.slerpQuaternion.q1, animx.keys[i1].value, animy.keys[i1].value, animz.keys[i1].value, animw.keys[i1].value);

        quat.set(Anim.slerpQuaternion.q2, animx.keys[i2].value, animy.keys[i2].value, animz.keys[i2].value, animw.keys[i2].value);

        quat.slerp(q, Anim.slerpQuaternion.q1, Anim.slerpQuaternion.q2, perc);
    }
    return q;
};

export { CGL, Texture, Shader, Geometry, Mesh, Uniform, Framebuffer2 };
