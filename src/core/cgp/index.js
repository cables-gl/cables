import { WebGpuContext } from "./cgp_state.js";
import Shader from "./cgp_shader.js";
import Mesh from "./cgp_mesh.js";
import Pipeline from "./cgp_pipeline.js";
import Texture from "./cgp_texture.js";
import Binding from "./cgp_binding.js";
import Uniform from "./cgp_uniform.js";
import GPUBuffer from "./cgp_gpubuffer.js";
import { MESHES } from "../cgl/cgl_simplerect.js";

const CGP = {
    "Context": WebGpuContext,
    "Shader": Shader,
    "Mesh": Mesh,
    "Pipeline": Pipeline,
    "Texture": Texture,
    "Binding": Binding,
    "Uniform": Uniform,
    "MESHES": MESHES,
    "GPUBuffer": GPUBuffer
};

window.CABLES = window.CABLES || {};
window.CABLES.CGP = CGP;
window.CGP = CGP;

export { CGP };
