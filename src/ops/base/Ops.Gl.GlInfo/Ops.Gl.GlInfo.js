const gl = op.patch.cgl.gl;

let mxsmpl = 0;
if (gl.MAX_SAMPLES !== undefined)mxsmpl = gl.getParameter(gl.MAX_SAMPLES);

const
    outGlVersionShort = op.outNumber("WebGl Version Short", op.patch.cgl.glVersion),
    outGlVersion = op.outNumber("WebGl Version", gl.getParameter(gl.VERSION)),
    outGlslVersion = op.outNumber("GLSL Version", gl.getParameter(gl.SHADING_LANGUAGE_VERSION)),
    outFragUnis = op.outNumber("Max Frag uniforms", gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)),
    outVertUnis = op.outNumber("Max Vert uniforms", gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS)),
    outTexSize = op.outNumber("Max Texture Size", gl.getParameter(gl.MAX_TEXTURE_SIZE)),
    outTexUnits = op.outNumber("Max Texture Units", gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)),
    outVarVec = op.outNumber("Max Varying Vectors", gl.getParameter(gl.MAX_VARYING_VECTORS)),
    outMSAA = op.outNumber("Max MSAA Samples", mxsmpl),
    outExts = op.outArray("Extensions", gl.getSupportedExtensions()),
    outVendor = op.outString("Vendor"),
    outRenderer = op.outString("Renderer"),
    debugInfo = gl.getExtension("WEBGL_debug_renderer_info");

if (debugInfo)
{
    outVendor.set(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
    outRenderer.set(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
}
