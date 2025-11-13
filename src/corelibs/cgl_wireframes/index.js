import { WireframeCube } from "./cgl_wireframecube.js";
import { WireframeRect } from "./cgl_wireframerect.js";

window.CABLES = window.CABLES || {};
window.CABLES.CGL = window.CABLES.CGL || {};
window.CABLES.CGL.WireframeCube = WireframeCube;
window.CABLES.CGL.WireframeRect = WireframeRect;

export { WireframeCube, WireframeRect };
