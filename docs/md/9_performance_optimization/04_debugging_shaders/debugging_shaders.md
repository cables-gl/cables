## Debugging Shaders with ShaderInfo

No matter if you write your own shaders or use internal shaders (like materials, mesh instancing, etc.), chances are you want to debug them at some point. The [ShaderInfo](https://cables.gl/op/Ops.Gl.Shader.ShaderInfo) operator offers you the possibility to show the code of the shader that is active at the point where you insert the ShaderInfo op. 

If you want to find out which shader is being used or you want to debug your own shader, this op might come handy. You can inspect the vertex & fragment shader's code, the active uniforms and more.
