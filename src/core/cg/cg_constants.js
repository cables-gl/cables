import { BoundingBox } from "./cg_boundingbox";
import { Geometry } from "./cg_geom";
import FpsCounter from "./sg_fpscounter";

const CG = {

    "GAPI_WEBGL": 0,
    "GAPI_WEBGPU": 1,

    "Geometry": Geometry,
    "BoundingBox": BoundingBox,
    "FpsCounter": FpsCounter
};


export { CG };
