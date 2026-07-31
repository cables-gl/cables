import { createBindGroup, createBindGroupLayout } from "./minigpu.js";
import MinMat from "./minimat.js";

window.MGPU = {
    "createBindGroupLayout": createBindGroupLayout,
    "createBindGroup": createBindGroup,
    "mm": MinMat

};
