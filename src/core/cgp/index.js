import { CgpContext } from "./cgp_state.js";
import { CgpShader } from "./cgp_shader.js";
import { CgpMesh } from "./cgp_mesh.js";
import { RenderPipeline } from "./cgp_renderpipeline.js";
import { Texture } from "./cgp_texture.js";
import { CgpUniform } from "./cgp_uniform.js";
import { CgpGguBuffer } from "./cgp_gpubuffer.js";
import { MESHES } from "../cgl/cgl_simplerect.js";
import { WebGpuCanvasAttachment } from "./cgp_canvasattachment.js";
import { BindingStorage } from "./binding/binding_storagebuffer.js";
import { ComputePipeline } from "./cgp_computepipeline.js";

const CGP = {
    "Context": CgpContext,
    "Shader": CgpShader,
    "Mesh": CgpMesh,
    "Texture": Texture,
    "Uniform": CgpUniform,
    "MESHES": MESHES,
    "GPUBuffer": CgpGguBuffer
};

window.CABLES = window.CABLES || {};
window.CABLES.CGP = CGP;
window.CGP = CGP;
window.CGP.WebGpuCanvasAttachment = WebGpuCanvasAttachment;
window.CGP.RenderPipeline = RenderPipeline;
window.CGP.ComputePipeline = ComputePipeline;
window.CGP.BindingStorage = BindingStorage;

export { CGP };
