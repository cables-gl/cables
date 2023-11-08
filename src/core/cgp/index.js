import { WebGpuContext } from "./cgp_state";
import Shader from "./cgp_shader";
import Mesh from "./cgp_mesh";
import Pipeline from "./cgp_pipeline";
import Texture from "./cgp_texture";

const CGP = {
    "Context": WebGpuContext,
    "Shader": Shader,
    "Mesh": Mesh,
    "Pipeline": Pipeline,
    "Texture": Texture,
};

window.CGP = CGP;


export { CGP };
