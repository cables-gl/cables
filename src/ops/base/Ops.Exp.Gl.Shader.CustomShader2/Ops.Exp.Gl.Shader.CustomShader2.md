Write your own custom shader and use it as a material.
Click the edit button to edit the fragment or vertex shader.

To turn it into a texture use it together with the  Ops.Gl.Shader.Shader2Texture op.

UNIFORMS
UNI float variableFloatName; //Use to create a uniform float
UNI Sampler2D variableTextureName; // use to create a texture input port
IN vec2 texCoord; // Gives the UV co-ordinates from 0-1

To display a texture on the screen 
Vec4 texIn = texture(variableTextureName,texCoord);
