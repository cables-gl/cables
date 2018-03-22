
var gl=op.patch.cgl.gl;

var outGlVersion=op.outValue("WebGl Version",gl.getParameter(gl.VERSION));
var outGlslVersion=op.outValue("GLSL Version",gl.getParameter(gl.SHADING_LANGUAGE_VERSION));

var outMsaa=op.outValue("Max Samples MSAA",gl.getParameter(gl.MAX_SAMPLES));
var outFragUnis=op.outValue("Max Frag uniforms",gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS));
var outVertUnis=op.outValue("Max Vert uniforms",gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS));
var outTexSize=op.outValue("Max Texture Size",gl.getParameter(gl.MAX_TEXTURE_SIZE));

var outExts=op.outArray("Extensions",gl.getSupportedExtensions());
