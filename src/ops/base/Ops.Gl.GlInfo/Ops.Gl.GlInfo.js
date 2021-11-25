const gl = op.patch.cgl.gl;

let mxsmpl = 0;
if (gl.MAX_SAMPLES !== undefined)mxsmpl = gl.getParameter(gl.MAX_SAMPLES);

const
    outGlVersion = op.outValue("WebGl Version", gl.getParameter(gl.VERSION)),
    outGlslVersion = op.outValue("GLSL Version", gl.getParameter(gl.SHADING_LANGUAGE_VERSION)),
    outFragUnis = op.outValue("Max Frag uniforms", gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)),
    outVertUnis = op.outValue("Max Vert uniforms", gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS)),
    outTexSize = op.outValue("Max Texture Size", gl.getParameter(gl.MAX_TEXTURE_SIZE)),
    outTexUnits = op.outValue("Max Texture Units", gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)),
    outVarVec = op.outValue("Max Varying Vectors", gl.getParameter(gl.MAX_VARYING_VECTORS)),
    outMSAA = op.outValue("Max MSAA Samples", mxsmpl),
    outExts = op.outArray("Extensions", gl.getSupportedExtensions()),
    outVendor = op.outValue("Vendor"),
    outRenderer = op.outValue("Renderer"),
    debugInfo = gl.getExtension("WEBGL_debug_renderer_info");

if (debugInfo)
{
    outVendor.set(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
    outRenderer.set(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
}
