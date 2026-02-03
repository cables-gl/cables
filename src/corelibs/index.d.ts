export * from "./cg/index.js";
export * from "./cgl/index.js";
export * from "./cgp/index.js";
export * from "./webaudio/webaudio.js";

declare global {
    const CGL: any
    const CGP: any
    const CG: any
    const WEBAUDIO: any
}
