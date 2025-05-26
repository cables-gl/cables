import { BoundingBox } from "./cg_boundingbox.js";
import { CgCanvas } from "./cg_canvas.js";
import { Geometry } from "./cg_geom.js";
import { FpsCounter } from "./cg_fpscounter.js";
import { CgContext } from "./cg_context.js";
import { CgUniform } from "./cg_uniform.js";
import { MatrixStack } from "./cg_matrixstack.js";
import { CgMesh } from "./cg_mesh.js";
import { CgShader } from "./cg_shader.js";
import { CgTexture } from "./cg_texture.js";

const CG = {

    "DEPTH_COMPARE_NEVER": 0,
    "DEPTH_COMPARE_LESS": 1,
    "DEPTH_COMPARE_EQUAL": 2,
    "DEPTH_COMPARE_LESSEQUAL": 3,
    "DEPTH_COMPARE_GREATER": 4,
    "DEPTH_COMPARE_NOTEQUAL": 5,
    "DEPTH_COMPARE_GREATEREQUAL": 6,
    "DEPTH_COMPARE_ALWAYS": 7,

    "CULL_NONE": 0,
    "CULL_BACK": 1,
    "CULL_FRONT": 2,
    "CULL_BOTH": 3,

    "Geometry": Geometry,
    "BoundingBox": BoundingBox,
    "FpsCounter": FpsCounter,

    "CgCanvas": CgCanvas
};

window.CABLES = window.CABLES || {};
window.CABLES.CG = CG;
window.CG = CG;

export { CG, BoundingBox, CgCanvas, CgContext, FpsCounter, Geometry, MatrixStack, CgMesh, CgShader, CgTexture, CgUniform };
