export * from "./cg/index.js";
export * from "./cgl/index.js";
export * from "./cgp/index.js";
export * from "./webaudio/webaudio.js";

declare global {
    const CGL: any
    const CGP: any
    const CG: any
    const WEBAUDIO: any
    const Ammo: any

    var glMatrix: any
    var mat2: any
    var mat2d: any
    var mat3: any
    var mat4: any
    var quat: any
    var quat2: any
    var vec2: any
    var vec3: any
    var vec4: any
}
