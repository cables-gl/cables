import { WebGpuOp } from "./webgpuop.js";

export { WebGpuOp };

// do not remove this: workaround because ops have cgp_webgpuop as a corelib but use CABLES namespace
CABLES.WebGpuOp = WebGpuOp;
