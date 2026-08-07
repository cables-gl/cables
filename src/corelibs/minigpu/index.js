import { Stack } from "cables";
import { createBindGroup, createBindGroupLayout } from "./minigpu.js";
import MinMat from "./minimat.js";
import { RenderTarget } from "./target.js";

/** @typedef MgpuState
 * @property {HTMLCanvasElement} canvas
 * @property {Stack} matModel
 * @property {Stack} matView
 * @property {Stack} matProj
 * @property {Stack} shader
 * @property {Stack} target
 * @property {GPURenderPassEncoder} passEncoder
 * @property {GPUCommandEncoder} commandEncoder
 * @property {GPUDevice} device
 * @property {GPUCanvasContext} context
 * @property {Object} format
 */

window.MGPU = {
    "createBindGroupLayout": createBindGroupLayout,
    "createBindGroup": createBindGroup,
    "RenderTarget": RenderTarget,
    "mm": MinMat

};
