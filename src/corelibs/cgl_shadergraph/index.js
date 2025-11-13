import { ShaderGraphOp } from "./cgl_shadergraphop.js";
import { ShaderGraph } from "./cgl_shadergraph.js";
import { ShaderGraphProgram } from "./cgl_shadergraphprogram.js";

window.CABLES = window.CABLES || {};
window.CABLES.CGL = window.CABLES.CGL || {};
window.CABLES.CGL.ShaderGraphOp = ShaderGraphOp;
window.CABLES.CGL.ShaderGraph = ShaderGraph;
window.CABLES.CGL.ShaderGraphProgram = ShaderGraphProgram;
window.CGL = window.CABLES.CGL;

export { ShaderGraph, ShaderGraphOp, ShaderGraphProgram };
