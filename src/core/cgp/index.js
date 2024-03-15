import { WebGpuContext } from "./cgp_state.js";
import Shader from "./cgp_shader.js";
import Mesh from "./cgp_mesh.js";
import Pipeline from "./cgp_pipeline.js";
import Texture from "./cgp_texture.js";

const CGP = {
    "Context": WebGpuContext,
    "Shader": Shader,
    "Mesh": Mesh,
    "Pipeline": Pipeline,
    "Texture": Texture,
};

window.CGP = CGP;


export { CGP };
