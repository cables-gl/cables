import { Context } from "./cgp_state";
import Shader from "./cgp_shader";
import Mesh from "./cgp_mesh";
import Pipeline from "./cgp_pipeline";

const CGP = Object.assign(
    {
        "Context": Context,
        "Shader": Shader,
        "Mesh": Mesh,
        "Pipeline": Pipeline
    },
);

window.CGP = CGP;


export { CGP };
