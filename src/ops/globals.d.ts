import { mat4, vec3 } from "gl-matrix";
import { Op } from "../core/core_op.js";

declare global {
  const op: Op<any>;
  const vec3:vec3;
  const mat4:mat4;
}

export {};
