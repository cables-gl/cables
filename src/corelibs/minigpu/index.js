import { createBindGroup, createBindGroupLayout } from "./minigpu.js";

window.MGPU = {
    "createBindGroupLayout": createBindGroupLayout,
    "createBindGroup": createBindGroup

};
