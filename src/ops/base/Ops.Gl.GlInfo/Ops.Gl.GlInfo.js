const gl=op.patch.cgl.gl;

const outGlVersion=op.outValue("WebGl Version",gl.getParameter(gl.VERSION));
const outGlslVersion=op.outValue("GLSL Version",gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
const outFragUnis=op.outValue("Max Frag uniforms",gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS));
const outVertUnis=op.outValue("Max Vert uniforms",gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS));
const outTexSize=op.outValue("Max Texture Size",gl.getParameter(gl.MAX_TEXTURE_SIZE));
const outTexUnits=op.outValue("Max Texture Units",gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
const outExts=op.outArray("Extensions",gl.getSupportedExtensions());
const outVendor=op.outValue("Vendor");
const outRenderer=op.outValue("Renderer");


const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
if(debugInfo)
{
    outVendor.set(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
    outRenderer.set(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
}


