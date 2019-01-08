## Objects

<dl>
<dt><a href="#CGL">CGL</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#CABLES">CABLES</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#Math">Math</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#String">String</a> : <code>object</code></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#loadAudioFileFinishedCallback">loadAudioFileFinishedCallback</a> : <code>function</code></dt>
<dd><p>Callback when an audio file finished loading</p>
</dd>
<dt><a href="#loadAudioFileErrorCallback">loadAudioFileErrorCallback</a> : <code>function</code></dt>
<dd><p>Callback when a request to load an audio file did not succeed.</p>
</dd>
</dl>


<br/><br/><br/>

<a id="CGL"></a>
## CGL : <code>object</code>xx

**Kind**: global namespace  

* [CGL](#CGL) : <code>object</code>
    * [.Framebuffer](#CGL.Framebuffer)
        * [new Framebuffer(cgl, width, height, [options])](#new_CGL.Framebuffer_new)
    * [.Geometry](#CGL.Geometry)
        * [new Geometry(name)](#new_CGL.Geometry_new)
        * [.getAttributes()](#CGL.Geometry+getAttributes) ⇒
        * [.getAttribute(name)](#CGL.Geometry+getAttribute) ⇒ <code>Object</code>
        * [.setAttribute(name, data, itemsize)](#CGL.Geometry+setAttribute)
        * [.setVertices(data)](#CGL.Geometry+setVertices)
        * [.setTexCoords(data)](#CGL.Geometry+setTexCoords)
    * [.Mesh](#CGL.Mesh)
        * [new Mesh(cgl, geometry, [glPrimitive])](#new_CGL.Mesh_new)
        * [.setGeom(geometry)](#CGL.Mesh+setGeom)
        * [.render(shader)](#CGL.Mesh+render)
    * [.Shader](#CGL.Shader)
        * [.removeModule(module)](#CGL.Shader+removeModule)
        * [.addModule(module, [sibling])](#CGL.Shader+addModule)
        * [.addUniform(uniform)](#CGL.Shader+addUniform)
        * [.addAttribute(attribObject)](#CGL.Shader+addAttribute) ⇒ <code>Object</code>
    * [.Uniform](#CGL.Uniform)
        * [new Uniform(shader, [type], name, value)](#new_CGL.Uniform_new)
        * [.setValue(value)](#CGL.Uniform+setValue)
    * [.Context](#CGL.Context)
        * [.getGlFrameBuffer()()](#CGL.Context+getGlFrameBuffer_new) ⇒ <code>Object</code>
        * [.getDepthRenderBuffer()](#CGL.Context+getDepthRenderBuffer) ⇒ <code>Object</code>
        * [.getTextureColor()](#CGL.Context+getTextureColor) ⇒ [<code>Texture</code>](#CGL.Texture)
        * [.getTextureDepth()](#CGL.Context+getTextureDepth) ⇒ [<code>Texture</code>](#CGL.Texture)
        * [.pushGlFrameBuffer(framebuffer)](#CGL.Context+pushGlFrameBuffer)
        * [.popGlFrameBuffer()](#CGL.Context+popGlFrameBuffer) ⇒ <code>Object</code>
        * [.getCurrentFrameBuffer()](#CGL.Context+getCurrentFrameBuffer) ⇒ <code>Object</code>
        * [.pushGlFrameBuffer(framebuffer)](#CGL.Context+pushGlFrameBuffer)
        * [.popFrameBuffer()](#CGL.Context+popFrameBuffer) ⇒ <code>CGL.FrameBuffer</code>
        * [.getCurrentFrameBuffer()](#CGL.Context+getCurrentFrameBuffer) ⇒ <code>CGL.FrameBuffer</code>
        * [.pushviewMatrix(viewmatrix)](#CGL.Context+pushviewMatrix)
        * [.popViewMatrix()](#CGL.Context+popViewMatrix) ⇒ <code>mat4</code>
        * [.pushPMatrix(projectionmatrix)](#CGL.Context+pushPMatrix)
        * [.popPMatrix()](#CGL.Context+popPMatrix) ⇒ <code>mat4</code>
        * [.pushModelMatrix(modelmatrix)](#CGL.Context+pushModelMatrix)
        * [.popModelMatrix()](#CGL.Context+popModelMatrix) ⇒ <code>mat4</code>
        * [.modelMatrix()](#CGL.Context+modelMatrix) ⇒ <code>mat4</code>
        * [.pushDepthFunc(depthtesting)](#CGL.Context+pushDepthFunc)
        * [.stateDepthFunc()](#CGL.Context+stateDepthFunc) ⇒ <code>boolean</code>
        * [.popDepthFunc()](#CGL.Context+popDepthFunc)
        * [.pushBlend(blending)](#CGL.Context+pushBlend)
        * [.stateBlend()](#CGL.Context+stateBlend) ⇒ <code>boolean</code>
        * [.popBlend()](#CGL.Context+popBlend)
        * [.pushBlendMode(blendmode, premultiplied)](#CGL.Context+pushBlendMode)
        * [.pushBlendMode()](#CGL.Context+pushBlendMode)
    * [.Texture](#CGL.Texture)
        * [new Texture(cgl, [options])](#new_CGL.Texture_new)
        * [.compareSettings(otherTexture)](#CGL.Texture+compareSettings) ⇒ <code>boolean</code>
        * [.clone()](#CGL.Texture+clone) ⇒ [<code>Texture</code>](#CGL.Texture)
        * [.setSize(width, height)](#CGL.Texture+setSize)
        * [.initFromData(data, width, height, filter, wrap)](#CGL.Texture+initFromData)
        * [.initTexture(image, filter)](#CGL.Texture+initTexture)
        * [.delete()](#CGL.Texture+delete)
        * [.isPowerOfTwo()](#CGL.Texture+isPowerOfTwo) ⇒ <code>boolean</code>
        * [.load(cgl, url, onFinished, options)](#CGL.Texture+load) ⇒ [<code>Texture</code>](#CGL.Texture)
        * [.getTempTexture(cgl)](#CGL.Texture+getTempTexture) ⇒ [<code>Texture</code>](#CGL.Texture)
        * [.getEmptyTexture()](#CGL.Texture+getEmptyTexture) ⇒ [<code>Texture</code>](#CGL.Texture)
        * [.getEmptyTexture()](#CGL.Texture+getEmptyTexture) ⇒ [<code>Texture</code>](#CGL.Texture)
        * [.getTempGradientTexture(cgl)](#CGL.Texture+getTempGradientTexture) ⇒ [<code>Texture</code>](#CGL.Texture)
        * [.createFromImage(cgl, image, options)](#CGL.Texture+createFromImage)
        * [.isPowerOfTwo(x)](#CGL.Texture+isPowerOfTwo) ⇒ <code>boolean</code>
    * [.DEG2RAD](#CGL.DEG2RAD) : <code>number</code>
    * [.RAD2DEG](#CGL.RAD2DEG) : <code>number</code>
    * [.getWheelDelta(event)](#CGL.getWheelDelta) ⇒ <code>Number</code>


<br/><br/><br/>

<a id="CGL.Framebuffer"></a>
### CGL.Framebufferxx

**Kind**: static class of [<code>CGL</code>](#CGL)  

<br/><br/><br/>

<a id="new_CGL.Framebuffer_new"></a>
#### new Framebuffer(cgl, width, height, [options])xx

a framebuffer


| Param | Type |
| --- | --- |
| cgl | [<code>Context</code>](#CGL.Context) | 
| width | <code>Number</code> | 
| height | <code>Number</code> | 
| [options] | <code>Object</code> | 


<br/><br/><br/>

<a id="CGL.Geometry"></a>
### CGL.Geometryxx

**Kind**: static class of [<code>CGL</code>](#CGL)  

* [.Geometry](#CGL.Geometry)
    * [new Geometry(name)](#new_CGL.Geometry_new)
    * [.getAttributes()](#CGL.Geometry+getAttributes) ⇒
    * [.getAttribute(name)](#CGL.Geometry+getAttribute) ⇒ <code>Object</code>
    * [.setAttribute(name, data, itemsize)](#CGL.Geometry+setAttribute)
    * [.setVertices(data)](#CGL.Geometry+setVertices)
    * [.setTexCoords(data)](#CGL.Geometry+setTexCoords)


<br/><br/><br/>

<a id="new_CGL.Geometry_new"></a>
#### new Geometry(name)xx


| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CGL.Geometry+getAttributes"></a>
#### geometry.getAttributes() ⇒xx

**Kind**: instance method of [<code>Geometry</code>](#CGL.Geometry)  
**Returns**: returns array of attribute objects  

<br/><br/><br/>

<a id="CGL.Geometry+getAttribute"></a>
#### geometry.getAttribute(name) ⇒ <code>Object</code>xx

**Kind**: instance method of [<code>Geometry</code>](#CGL.Geometry)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CGL.Geometry+setAttribute"></a>
#### geometry.setAttribute(name, data, itemsize)xx

create an attribute

**Kind**: instance method of [<code>Geometry</code>](#CGL.Geometry)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 
| data | <code>array</code> | 
| itemsize | <code>number</code> | 


<br/><br/><br/>

<a id="CGL.Geometry+setVertices"></a>
#### geometry.setVertices(data)xx

set vertices

**Kind**: instance method of [<code>Geometry</code>](#CGL.Geometry)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>array</code> \| <code>float32array</code> | [x,y,z,x,y,z,...] |


<br/><br/><br/>

<a id="CGL.Geometry+setTexCoords"></a>
#### geometry.setTexCoords(data)xx

set texcoords

**Kind**: instance method of [<code>Geometry</code>](#CGL.Geometry)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>array</code> \| <code>float32array</code> | [u,v,u,v,...] |


<br/><br/><br/>

<a id="CGL.Mesh"></a>
### CGL.Meshxx

**Kind**: static class of [<code>CGL</code>](#CGL)  

* [.Mesh](#CGL.Mesh)
    * [new Mesh(cgl, geometry, [glPrimitive])](#new_CGL.Mesh_new)
    * [.setGeom(geometry)](#CGL.Mesh+setGeom)
    * [.render(shader)](#CGL.Mesh+render)


<br/><br/><br/>

<a id="new_CGL.Mesh_new"></a>
#### new Mesh(cgl, geometry, [glPrimitive])xx


| Param | Type |
| --- | --- |
| cgl | [<code>Context</code>](#CGL.Context) | 
| geometry | [<code>Geometry</code>](#CGL.Geometry) | 
| [glPrimitive] | <code>number</code> | 


<br/><br/><br/>

<a id="CGL.Mesh+setGeom"></a>
#### mesh.setGeom(geometry)xx

set geometry for mesh

**Kind**: instance method of [<code>Mesh</code>](#CGL.Mesh)  

| Param | Type |
| --- | --- |
| geometry | [<code>Geometry</code>](#CGL.Geometry) | 


<br/><br/><br/>

<a id="CGL.Mesh+render"></a>
#### mesh.render(shader)xx

draw mesh to screen

**Kind**: instance method of [<code>Mesh</code>](#CGL.Mesh)  

| Param | Type |
| --- | --- |
| shader | [<code>Shader</code>](#CGL.Shader) | 


<br/><br/><br/>

<a id="CGL.Shader"></a>
### CGL.Shaderxx

**Kind**: static class of [<code>CGL</code>](#CGL)  

* [.Shader](#CGL.Shader)
    * [.removeModule(module)](#CGL.Shader+removeModule)
    * [.addModule(module, [sibling])](#CGL.Shader+addModule)
    * [.addUniform(uniform)](#CGL.Shader+addUniform)
    * [.addAttribute(attribObject)](#CGL.Shader+addAttribute) ⇒ <code>Object</code>


<br/><br/><br/>

<a id="CGL.Shader+removeModule"></a>
#### shader.removeModule(module)xx

remove a module from shader

**Kind**: instance method of [<code>Shader</code>](#CGL.Shader)  

| Param | Type | Description |
| --- | --- | --- |
| module | <code>shaderModule</code> | the module to be removed |


<br/><br/><br/>

<a id="CGL.Shader+addModule"></a>
#### shader.addModule(module, [sibling])xx

add a module

**Kind**: instance method of [<code>Shader</code>](#CGL.Shader)  

| Param | Type | Description |
| --- | --- | --- |
| module | <code>shaderModule</code> | the module to be added |
| [sibling] | <code>shaderModule</code> | sibling module, new module will share the same group |


<br/><br/><br/>

<a id="CGL.Shader+addUniform"></a>
#### shader.addUniform(uniform)xx

add a uniform to the shader

**Kind**: instance method of [<code>Shader</code>](#CGL.Shader)  

| Param | Type |
| --- | --- |
| uniform | <code>uniform</code> | 


<br/><br/><br/>

<a id="CGL.Shader+addAttribute"></a>
#### shader.addAttribute(attribObject) ⇒ <code>Object</code>xx

**Kind**: instance method of [<code>Shader</code>](#CGL.Shader)  

| Param | Type | Description |
| --- | --- | --- |
| attribObject | <code>Object</code> | {type:x,name:x,[nameFrag:x]} |


<br/><br/><br/>

<a id="CGL.Uniform"></a>
### CGL.Uniformxx

**Kind**: static class of [<code>CGL</code>](#CGL)  

* [.Uniform](#CGL.Uniform)
    * [new Uniform(shader, [type], name, value)](#new_CGL.Uniform_new)
    * [.setValue(value)](#CGL.Uniform+setValue)


<br/><br/><br/>

<a id="new_CGL.Uniform_new"></a>
#### new Uniform(shader, [type], name, value)xx


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| shader | [<code>Shader</code>](#CGL.Shader) |  |  |
| [type] | [<code>String</code>](#String) | <code>f</code> |  |
| name | [<code>String</code>](#String) |  |  |
| value | <code>Number</code> \| <code>Port</code> |  | can be a Number,Matrix or Port |


<br/><br/><br/>

<a id="CGL.Uniform+setValue"></a>
#### uniform.setValue(value)xx

**Kind**: instance method of [<code>Uniform</code>](#CGL.Uniform)  

| Param | Type |
| --- | --- |
| value | <code>Number</code> \| <code>Matrix</code> \| <code>Texture</code> | 


<br/><br/><br/>

<a id="CGL.Context"></a>
### CGL.Contextxx

**Kind**: static class of [<code>CGL</code>](#CGL)  

* [.Context](#CGL.Context)
    * [.getGlFrameBuffer()()](#CGL.Context+getGlFrameBuffer_new) ⇒ <code>Object</code>
    * [.getDepthRenderBuffer()](#CGL.Context+getDepthRenderBuffer) ⇒ <code>Object</code>
    * [.getTextureColor()](#CGL.Context+getTextureColor) ⇒ [<code>Texture</code>](#CGL.Texture)
    * [.getTextureDepth()](#CGL.Context+getTextureDepth) ⇒ [<code>Texture</code>](#CGL.Texture)
    * [.pushGlFrameBuffer(framebuffer)](#CGL.Context+pushGlFrameBuffer)
    * [.popGlFrameBuffer()](#CGL.Context+popGlFrameBuffer) ⇒ <code>Object</code>
    * [.getCurrentFrameBuffer()](#CGL.Context+getCurrentFrameBuffer) ⇒ <code>Object</code>
    * [.pushGlFrameBuffer(framebuffer)](#CGL.Context+pushGlFrameBuffer)
    * [.popFrameBuffer()](#CGL.Context+popFrameBuffer) ⇒ <code>CGL.FrameBuffer</code>
    * [.getCurrentFrameBuffer()](#CGL.Context+getCurrentFrameBuffer) ⇒ <code>CGL.FrameBuffer</code>
    * [.pushviewMatrix(viewmatrix)](#CGL.Context+pushviewMatrix)
    * [.popViewMatrix()](#CGL.Context+popViewMatrix) ⇒ <code>mat4</code>
    * [.pushPMatrix(projectionmatrix)](#CGL.Context+pushPMatrix)
    * [.popPMatrix()](#CGL.Context+popPMatrix) ⇒ <code>mat4</code>
    * [.pushModelMatrix(modelmatrix)](#CGL.Context+pushModelMatrix)
    * [.popModelMatrix()](#CGL.Context+popModelMatrix) ⇒ <code>mat4</code>
    * [.modelMatrix()](#CGL.Context+modelMatrix) ⇒ <code>mat4</code>
    * [.pushDepthFunc(depthtesting)](#CGL.Context+pushDepthFunc)
    * [.stateDepthFunc()](#CGL.Context+stateDepthFunc) ⇒ <code>boolean</code>
    * [.popDepthFunc()](#CGL.Context+popDepthFunc)
    * [.pushBlend(blending)](#CGL.Context+pushBlend)
    * [.stateBlend()](#CGL.Context+stateBlend) ⇒ <code>boolean</code>
    * [.popBlend()](#CGL.Context+popBlend)
    * [.pushBlendMode(blendmode, premultiplied)](#CGL.Context+pushBlendMode)
    * [.pushBlendMode()](#CGL.Context+pushBlendMode)


<br/><br/><br/>

<a id="CGL.Context+getGlFrameBuffer_new"></a>
#### context.getGlFrameBuffer()() ⇒ <code>Object</code>xx

get native gl framebuffer

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  
**Returns**: <code>Object</code> - framebuffer  

<br/><br/><br/>

<a id="CGL.Context+getDepthRenderBuffer"></a>
#### context.getDepthRenderBuffer() ⇒ <code>Object</code>xx

get depth renderbuffer

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  
**Returns**: <code>Object</code> - renderbuffer  

<br/><br/><br/>

<a id="CGL.Context+getTextureColor"></a>
#### context.getTextureColor() ⇒ [<code>Texture</code>](#CGL.Texture)xx

get color texture

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  
**Returns**: [<code>Texture</code>](#CGL.Texture) - rgba texture  

<br/><br/><br/>

<a id="CGL.Context+getTextureDepth"></a>
#### context.getTextureDepth() ⇒ [<code>Texture</code>](#CGL.Texture)xx

get depth texture

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  
**Returns**: [<code>Texture</code>](#CGL.Texture) - depth texture  

<br/><br/><br/>

<a id="CGL.Context+pushGlFrameBuffer"></a>
#### context.pushGlFrameBuffer(framebuffer)xx

push a framebuffer to the framebuffer stack

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  

| Param | Type |
| --- | --- |
| framebuffer | <code>Object</code> | 


<br/><br/><br/>

<a id="CGL.Context+popGlFrameBuffer"></a>
#### context.popGlFrameBuffer() ⇒ <code>Object</code>xx

pop framebuffer stack

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  
**Returns**: <code>Object</code> - current framebuffer or null  

<br/><br/><br/>

<a id="CGL.Context+getCurrentFrameBuffer"></a>
#### context.getCurrentFrameBuffer() ⇒ <code>Object</code>xx

get current framebuffer

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  
**Returns**: <code>Object</code> - current framebuffer or null  

<br/><br/><br/>

<a id="CGL.Context+pushGlFrameBuffer"></a>
#### context.pushGlFrameBuffer(framebuffer)xx

push a framebuffer to the framebuffer stack

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  

| Param | Type |
| --- | --- |
| framebuffer | <code>CGL.FrameBuffer</code> | 


<br/><br/><br/>

<a id="CGL.Context+popFrameBuffer"></a>
#### context.popFrameBuffer() ⇒ <code>CGL.FrameBuffer</code>xx

pop framebuffer stack

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  
**Returns**: <code>CGL.FrameBuffer</code> - current framebuffer or null  

<br/><br/><br/>

<a id="CGL.Context+getCurrentFrameBuffer"></a>
#### context.getCurrentFrameBuffer() ⇒ <code>CGL.FrameBuffer</code>xx

get current framebuffer

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  
**Returns**: <code>CGL.FrameBuffer</code> - current framebuffer or null  

<br/><br/><br/>

<a id="CGL.Context+pushviewMatrix"></a>
#### context.pushviewMatrix(viewmatrix)xx

push a matrix to the view matrix stack

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  

| Param | Type |
| --- | --- |
| viewmatrix | <code>mat4</code> | 


<br/><br/><br/>

<a id="CGL.Context+popViewMatrix"></a>
#### context.popViewMatrix() ⇒ <code>mat4</code>xx

pop view matrix stack

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  
**Returns**: <code>mat4</code> - current viewmatrix  

<br/><br/><br/>

<a id="CGL.Context+pushPMatrix"></a>
#### context.pushPMatrix(projectionmatrix)xx

push a matrix to the projection matrix stack

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  

| Param | Type |
| --- | --- |
| projectionmatrix | <code>mat4</code> | 


<br/><br/><br/>

<a id="CGL.Context+popPMatrix"></a>
#### context.popPMatrix() ⇒ <code>mat4</code>xx

pop projection matrix stack

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  
**Returns**: <code>mat4</code> - current projectionmatrix  

<br/><br/><br/>

<a id="CGL.Context+pushModelMatrix"></a>
#### context.pushModelMatrix(modelmatrix)xx

push a matrix to the model matrix stack

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  

| Param | Type |
| --- | --- |
| modelmatrix | <code>mat4</code> | 


<br/><br/><br/>

<a id="CGL.Context+popModelMatrix"></a>
#### context.popModelMatrix() ⇒ <code>mat4</code>xx

pop model matrix stack

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  
**Returns**: <code>mat4</code> - current modelmatrix  

<br/><br/><br/>

<a id="CGL.Context+modelMatrix"></a>
#### context.modelMatrix() ⇒ <code>mat4</code>xx

get model matrix

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  
**Returns**: <code>mat4</code> - current modelmatrix  

<br/><br/><br/>

<a id="CGL.Context+pushDepthFunc"></a>
#### context.pushDepthFunc(depthtesting)xx

enable / disable depth testing 
like `gl.depthFunc(boolean);`

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  

| Param | Type |
| --- | --- |
| depthtesting | <code>boolean</code> | 


<br/><br/><br/>

<a id="CGL.Context+stateDepthFunc"></a>
#### context.stateDepthFunc() ⇒ <code>boolean</code>xx

current state of blend

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  
**Returns**: <code>boolean</code> - depth testing enabled/disabled  

<br/><br/><br/>

<a id="CGL.Context+popDepthFunc"></a>
#### context.popDepthFunc()xx

pop depth testing and set the previous state

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  

<br/><br/><br/>

<a id="CGL.Context+pushBlend"></a>
#### context.pushBlend(blending)xx

enable / disable blend 
like gl.enable(gl.BLEND); / gl.disable(gl.BLEND);

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  

| Param | Type |
| --- | --- |
| blending | <code>boolean</code> | 


<br/><br/><br/>

<a id="CGL.Context+stateBlend"></a>
#### context.stateBlend() ⇒ <code>boolean</code>xx

current state of blend

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  
**Returns**: <code>boolean</code> - blending enabled/disabled  

<br/><br/><br/>

<a id="CGL.Context+popBlend"></a>
#### context.popBlend()xx

pop blend state and set the previous state

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  

<br/><br/><br/>

<a id="CGL.Context+pushBlendMode"></a>
#### context.pushBlendMode(blendmode, premultiplied)xx

push and switch to predefined blendmode (CGL.BLEND_NONE,CGL.BLEND_NORMAL,CGL.BLEND_ADD,CGL.BLEND_SUB,CGL.BLEND_MUL)

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  

| Param | Type | Description |
| --- | --- | --- |
| blendmode | <code>Number</code> |  |
| premultiplied | <code>Boolean</code> | mode |


<br/><br/><br/>

<a id="CGL.Context+pushBlendMode"></a>
#### context.pushBlendMode()xx

pop predefined blendmode / switch back to previous blendmode

**Kind**: instance method of [<code>Context</code>](#CGL.Context)  

<br/><br/><br/>

<a id="CGL.Texture"></a>
### CGL.Texturexx

**Kind**: static class of [<code>CGL</code>](#CGL)  

* [.Texture](#CGL.Texture)
    * [new Texture(cgl, [options])](#new_CGL.Texture_new)
    * [.compareSettings(otherTexture)](#CGL.Texture+compareSettings) ⇒ <code>boolean</code>
    * [.clone()](#CGL.Texture+clone) ⇒ [<code>Texture</code>](#CGL.Texture)
    * [.setSize(width, height)](#CGL.Texture+setSize)
    * [.initFromData(data, width, height, filter, wrap)](#CGL.Texture+initFromData)
    * [.initTexture(image, filter)](#CGL.Texture+initTexture)
    * [.delete()](#CGL.Texture+delete)
    * [.isPowerOfTwo()](#CGL.Texture+isPowerOfTwo) ⇒ <code>boolean</code>
    * [.load(cgl, url, onFinished, options)](#CGL.Texture+load) ⇒ [<code>Texture</code>](#CGL.Texture)
    * [.getTempTexture(cgl)](#CGL.Texture+getTempTexture) ⇒ [<code>Texture</code>](#CGL.Texture)
    * [.getEmptyTexture()](#CGL.Texture+getEmptyTexture) ⇒ [<code>Texture</code>](#CGL.Texture)
    * [.getEmptyTexture()](#CGL.Texture+getEmptyTexture) ⇒ [<code>Texture</code>](#CGL.Texture)
    * [.getTempGradientTexture(cgl)](#CGL.Texture+getTempGradientTexture) ⇒ [<code>Texture</code>](#CGL.Texture)
    * [.createFromImage(cgl, image, options)](#CGL.Texture+createFromImage)
    * [.isPowerOfTwo(x)](#CGL.Texture+isPowerOfTwo) ⇒ <code>boolean</code>


<br/><br/><br/>

<a id="new_CGL.Texture_new"></a>
#### new Texture(cgl, [options])xx

A Texture


| Param | Type |
| --- | --- |
| cgl | [<code>Context</code>](#CGL.Context) | 
| [options] | <code>Object</code> | 


<br/><br/><br/>

<a id="CGL.Texture+compareSettings"></a>
#### texture.compareSettings(otherTexture) ⇒ <code>boolean</code>xx

returns true if otherTexture has same options (width/height/filter/wrap etc)

**Kind**: instance method of [<code>Texture</code>](#CGL.Texture)  

| Param | Type |
| --- | --- |
| otherTexture | [<code>Texture</code>](#CGL.Texture) | 


<br/><br/><br/>

<a id="CGL.Texture+clone"></a>
#### texture.clone() ⇒ [<code>Texture</code>](#CGL.Texture)xx

returns a new texturw with the same settings (does not copy texture itself)

**Kind**: instance method of [<code>Texture</code>](#CGL.Texture)  

<br/><br/><br/>

<a id="CGL.Texture+setSize"></a>
#### texture.setSize(width, height)xx

set pixel size of texture

**Kind**: instance method of [<code>Texture</code>](#CGL.Texture)  

| Param | Type |
| --- | --- |
| width | <code>number</code> | 
| height | <code>number</code> | 


<br/><br/><br/>

<a id="CGL.Texture+initFromData"></a>
#### texture.initFromData(data, width, height, filter, wrap)xx

create texturem from rgb data

**Kind**: instance method of [<code>Texture</code>](#CGL.Texture)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Array.&lt;number&gt;</code> | rgb color array [r,g,b,a,r,g,b,a,...] |
| width | <code>number</code> |  |
| height | <code>number</code> |  |
| filter | <code>number</code> |  |
| wrap | <code>number</code> |  |


<br/><br/><br/>

<a id="CGL.Texture+initTexture"></a>
#### texture.initTexture(image, filter)xx

set texture data from an image/canvas object

**Kind**: instance method of [<code>Texture</code>](#CGL.Texture)  

| Param | Type |
| --- | --- |
| image | <code>object</code> | 
| filter | <code>number</code> | 


<br/><br/><br/>

<a id="CGL.Texture+delete"></a>
#### texture.delete()xx

delete texture. use this when texture is no longer needed

**Kind**: instance method of [<code>Texture</code>](#CGL.Texture)  

<br/><br/><br/>

<a id="CGL.Texture+isPowerOfTwo"></a>
#### texture.isPowerOfTwo() ⇒ <code>boolean</code>xx

return true if texture width and height are both power of two

**Kind**: instance method of [<code>Texture</code>](#CGL.Texture)  

<br/><br/><br/>

<a id="CGL.Texture+load"></a>
#### texture.load(cgl, url, onFinished, options) ⇒ [<code>Texture</code>](#CGL.Texture)xx

load an image from an url

**Kind**: instance method of [<code>Texture</code>](#CGL.Texture)  

| Param | Type |
| --- | --- |
| cgl | [<code>Context</code>](#CGL.Context) | 
| url | [<code>String</code>](#String) | 
| onFinished | <code>function</code> | 
| options | <code>Object</code> | 


<br/><br/><br/>

<a id="CGL.Texture+getTempTexture"></a>
#### texture.getTempTexture(cgl) ⇒ [<code>Texture</code>](#CGL.Texture)xx

returns the default temporary texture (grey diagonal stipes)

**Kind**: instance method of [<code>Texture</code>](#CGL.Texture)  

| Param | Type |
| --- | --- |
| cgl | [<code>Context</code>](#CGL.Context) | 


<br/><br/><br/>

<a id="CGL.Texture+getEmptyTexture"></a>
#### texture.getEmptyTexture() ⇒ [<code>Texture</code>](#CGL.Texture)xx

returns a reference to a small empty texture

**Kind**: instance method of [<code>Texture</code>](#CGL.Texture)  

<br/><br/><br/>

<a id="CGL.Texture+getEmptyTexture"></a>
#### texture.getEmptyTexture() ⇒ [<code>Texture</code>](#CGL.Texture)xx

returns a reference to a small empty texture

**Kind**: instance method of [<code>Texture</code>](#CGL.Texture)  

<br/><br/><br/>

<a id="CGL.Texture+getTempGradientTexture"></a>
#### texture.getTempGradientTexture(cgl) ⇒ [<code>Texture</code>](#CGL.Texture)xx

returns a gradient texture from black to white

**Kind**: instance method of [<code>Texture</code>](#CGL.Texture)  

| Param | Type |
| --- | --- |
| cgl | [<code>Context</code>](#CGL.Context) | 


<br/><br/><br/>

<a id="CGL.Texture+createFromImage"></a>
#### texture.createFromImage(cgl, image, options)xx

create texturem from image data (e.g. image or canvas)

**Kind**: instance method of [<code>Texture</code>](#CGL.Texture)  

| Param | Type |
| --- | --- |
| cgl | [<code>Context</code>](#CGL.Context) | 
| image | <code>object</code> | 
| options | <code>object</code> | 


<br/><br/><br/>

<a id="CGL.Texture+isPowerOfTwo"></a>
#### texture.isPowerOfTwo(x) ⇒ <code>boolean</code>xx

returns true if x is power of two

**Kind**: instance method of [<code>Texture</code>](#CGL.Texture)  

| Param | Type |
| --- | --- |
| x | <code>number</code> | 


<br/><br/><br/>

<a id="CGL.DEG2RAD"></a>
### CGL.DEG2RAD : <code>number</code>xx

multiply to get radians from degree, e.g. `360 * CGL.DEG2RAD`

**Kind**: static constant of [<code>CGL</code>](#CGL)  

<br/><br/><br/>

<a id="CGL.RAD2DEG"></a>
### CGL.RAD2DEG : <code>number</code>xx

to get degrees from radians, e.g. `3.14 * CGL.RAD2DEG`

**Kind**: static constant of [<code>CGL</code>](#CGL)  

<br/><br/><br/>

<a id="CGL.getWheelDelta"></a>
### CGL.getWheelDelta(event) ⇒ <code>Number</code>xx

get normalized mouse wheel delta (including browser specific adjustment)

**Kind**: static method of [<code>CGL</code>](#CGL)  
**Returns**: <code>Number</code> - normalized delta  

| Param | Type |
| --- | --- |
| event | <code>MouseEvent</code> | 


<br/><br/><br/>

<a id="CABLES"></a>
## CABLES : <code>object</code>xx

**Kind**: global namespace  

* [CABLES](#CABLES) : <code>object</code>
    * _instance_
        * [.now()](#CABLES+now)
    * _static_
        * [.Anim](#CABLES.Anim)
            * [new Anim()](#new_CABLES.Anim_new)
            * [.defaultEasing](#CABLES.Anim+defaultEasing) : <code>Number</code>
            * [.hasEnded(time)](#CABLES.Anim+hasEnded) ⇒ <code>Boolean</code>
            * [.clear([time])](#CABLES.Anim+clear)
            * [.setValue([time], [value], [callback])](#CABLES.Anim+setValue)
            * [.getValue([time])](#CABLES.Anim+getValue) ⇒ <code>Number</code>
        * [.Link](#CABLES.Link)
            * [new Link()](#new_CABLES.Link_new)
            * [.getOtherPort(port)](#CABLES.Link+getOtherPort)
            * [.remove()](#CABLES.Link+remove)
            * [.link(port1, port2)](#CABLES.Link+link)
            * [.canLinkText(port1, port2)](#CABLES.Link+canLinkText)
            * [.canLink(port1, port2)](#CABLES.Link+canLink)
        * [.Op](#CABLES.Op)
            * [new CABLES.Op()](#new_CABLES.Op_new)
            * _instance_
                * [.cgl](#CABLES.Op+cgl) : [<code>Context</code>](#CGL.Context)
                * [.preRender()](#CABLES.Op+preRender)
                * [.init()](#CABLES.Op+init)
                * [.inTrigger(name)](#CABLES.Op+inTrigger) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inTriggerButton(name)](#CABLES.Op+inTriggerButton) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inValue(name, value)](#CABLES.Op+inValue) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inValueBool(name, value)](#CABLES.Op+inValueBool) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inValueString(name, value)](#CABLES.Op+inValueString) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inValueText(name, value)](#CABLES.Op+inValueText) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inValueEditor(name, value)](#CABLES.Op+inValueEditor) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inValueSelect(name, values, value)](#CABLES.Op+inValueSelect) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inValueInt(name, value)](#CABLES.Op+inValueInt) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inFile(name)](#CABLES.Op+inFile) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inTexture(name)](#CABLES.Op+inTexture) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inObject(name)](#CABLES.Op+inObject) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inObject(name)](#CABLES.Op+inObject) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inValueSlider(name, name)](#CABLES.Op+inValueSlider) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.outTrigger(name)](#CABLES.Op+outTrigger) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.outValue(name)](#CABLES.Op+outValue) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.outValueBool(name)](#CABLES.Op+outValueBool) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.outValueString(name)](#CABLES.Op+outValueString) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.outObject(name)](#CABLES.Op+outObject) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.outArray(name)](#CABLES.Op+outArray) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.outTexture(name)](#CABLES.Op+outTexture) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.getPortByName(portName)](#CABLES.Op+getPortByName) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.error(id, text)](#CABLES.Op+error)
                * [.addListener(name, callback)](#CABLES.Op+addListener)
                * [.removeEventListener(name, callback)](#CABLES.Op+removeEventListener)
                * [.setEnabled(b)](#CABLES.Op+setEnabled)
                * [.setPortGroup(name, ports)](#CABLES.Op+setPortGroup)
                * [.removePort(port)](#CABLES.Op+removePort)
            * _static_
                * [.getNamespaceClassName(opName)](#CABLES.Op.getNamespaceClassName) ⇒ <code>string</code>
        * [.Op](#CABLES.Op)
            * [new CABLES.Op()](#new_CABLES.Op_new)
            * _instance_
                * [.cgl](#CABLES.Op+cgl) : [<code>Context</code>](#CGL.Context)
                * [.preRender()](#CABLES.Op+preRender)
                * [.init()](#CABLES.Op+init)
                * [.inTrigger(name)](#CABLES.Op+inTrigger) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inTriggerButton(name)](#CABLES.Op+inTriggerButton) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inValue(name, value)](#CABLES.Op+inValue) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inValueBool(name, value)](#CABLES.Op+inValueBool) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inValueString(name, value)](#CABLES.Op+inValueString) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inValueText(name, value)](#CABLES.Op+inValueText) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inValueEditor(name, value)](#CABLES.Op+inValueEditor) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inValueSelect(name, values, value)](#CABLES.Op+inValueSelect) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inValueInt(name, value)](#CABLES.Op+inValueInt) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inFile(name)](#CABLES.Op+inFile) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inTexture(name)](#CABLES.Op+inTexture) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inObject(name)](#CABLES.Op+inObject) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inObject(name)](#CABLES.Op+inObject) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.inValueSlider(name, name)](#CABLES.Op+inValueSlider) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.outTrigger(name)](#CABLES.Op+outTrigger) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.outValue(name)](#CABLES.Op+outValue) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.outValueBool(name)](#CABLES.Op+outValueBool) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.outValueString(name)](#CABLES.Op+outValueString) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.outObject(name)](#CABLES.Op+outObject) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.outArray(name)](#CABLES.Op+outArray) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.outTexture(name)](#CABLES.Op+outTexture) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.getPortByName(portName)](#CABLES.Op+getPortByName) ⇒ [<code>Port</code>](#CABLES.Port)
                * [.error(id, text)](#CABLES.Op+error)
                * [.addListener(name, callback)](#CABLES.Op+addListener)
                * [.removeEventListener(name, callback)](#CABLES.Op+removeEventListener)
                * [.setEnabled(b)](#CABLES.Op+setEnabled)
                * [.setPortGroup(name, ports)](#CABLES.Op+setPortGroup)
                * [.removePort(port)](#CABLES.Op+removePort)
            * _static_
                * [.getNamespaceClassName(opName)](#CABLES.Op.getNamespaceClassName) ⇒ <code>string</code>
        * [.Patch](#CABLES.Patch)
            * [new Patch(config)](#new_CABLES.Patch_new)
            * _instance_
                * [.getFPS()](#CABLES.Patch+getFPS) ⇒ <code>Number</code>
                * [.pause()](#CABLES.Patch+pause)
                * [.resume()](#CABLES.Patch+resume)
                * [.setVolume()](#CABLES.Patch+setVolume)
                * [.getFilePath(filename)](#CABLES.Patch+getFilePath) ⇒ [<code>String</code>](#String)
                * [.addOp(objName,, UI)](#CABLES.Patch+addOp)
                * [.link(op1, op1, op2, op2)](#CABLES.Patch+link)
                * [.getVar(name)](#CABLES.Patch+getVar) ⇒ [<code>Variable</code>](#CABLES.Patch.Variable)
                * [.getVars()](#CABLES.Patch+getVars) ⇒ [<code>Array.&lt;Variable&gt;</code>](#CABLES.Patch.Variable)
                * [.preRenderOps()](#CABLES.Patch+preRenderOps)
            * _static_
                * [.Variable](#CABLES.Patch.Variable)
                    * [new Variable(name, value)](#new_CABLES.Patch.Variable_new)
                    * [.getValue()](#CABLES.Patch.Variable+getValue) ⇒ [<code>String</code>](#String) \| <code>Number</code> \| <code>Boolean</code>
                    * [.getName()](#CABLES.Patch.Variable+getName) ⇒ [<code>String</code>](#String) \| <code>Number</code> \| <code>Boolean</code>
                    * [.setValue()](#CABLES.Patch.Variable+setValue) ⇒ [<code>String</code>](#String) \| <code>Number</code> \| <code>Boolean</code>
                    * [.addListener(callback)](#CABLES.Patch.Variable+addListener)
                    * [.removeListener(callback)](#CABLES.Patch.Variable+removeListener)
                    * [.setVariable(name, value)](#CABLES.Patch.Variable+setVariable)
        * [.Port](#CABLES.Port)
            * _instance_
                * [.onChange](#CABLES.Port+onChange) : <code>function</code>
                * [.direction](#CABLES.Port+direction) : <code>number</code>
                * [.links](#CABLES.Port+links) : [<code>Array.&lt;Link&gt;</code>](#CABLES.Link)
                * [.hidePort()](#CABLES.Port+hidePort)
                * [.remove()](#CABLES.Port+remove)
                * [.setUiAttribs(newAttribs)](#CABLES.Port+setUiAttribs)
                * [.get()](#CABLES.Port+get)
                * [.setValue()](#CABLES.Port+setValue)
                * [.getTypeString()](#CABLES.Port+getTypeString) ⇒ <code>string</code>
                * [.removeLinks()](#CABLES.Port+removeLinks)
                * [.removeLink(link)](#CABLES.Port+removeLink)
                * [.getName()](#CABLES.Port+getName)
                * [.getLinkTo(otherPort)](#CABLES.Port+getLinkTo)
                * [.removeLinkTo(otherPort)](#CABLES.Port+removeLinkTo)
                * [.isLinkedTo(otherPort)](#CABLES.Port+isLinkedTo)
                * [.trigger()](#CABLES.Port+trigger)
                * [.getType()](#CABLES.Port+getType) ⇒ <code>number</code>
                * [.getType()](#CABLES.Port+getType) ⇒ <code>number</code>
                * [.isAnimated()](#CABLES.Port+isAnimated) ⇒ <code>boolean</code>
                * [.isHidden()](#CABLES.Port+isHidden) ⇒ <code>boolean</code>
                * [.onTriggered(callback)](#CABLES.Port+onTriggered)
            * _static_
                * [.portTypeNumberToString(type)](#CABLES.Port.portTypeNumberToString) ⇒ <code>string</code>
        * [.Timer](#CABLES.Timer)
            * [.isPlaying()](#CABLES.Timer+isPlaying) ⇒ <code>Boolean</code>
            * [.update()](#CABLES.Timer+update) ⇒ <code>Number</code>
            * [.getMillis()](#CABLES.Timer+getMillis) ⇒ <code>Number</code>
            * [.getTime()](#CABLES.Timer+getTime) ⇒ <code>Number</code>
            * [.togglePlay()](#CABLES.Timer+togglePlay)
            * [.setTime()](#CABLES.Timer+setTime)
            * [.play()](#CABLES.Timer+play)
            * [.pause()](#CABLES.Timer+pause)
            * [.onPlayPause(callback)](#CABLES.Timer+onPlayPause)
            * [.onTimeChange(callback)](#CABLES.Timer+onTimeChange)
        * [.ANIM](#CABLES.ANIM) : <code>object</code>
            * [.EASING_LINEAR](#CABLES.ANIM.EASING_LINEAR) : <code>number</code>
            * [.EASING_ABSOLUTE](#CABLES.ANIM.EASING_ABSOLUTE) : <code>number</code>
            * [.EASING_SMOOTHSTEP](#CABLES.ANIM.EASING_SMOOTHSTEP) : <code>number</code>
            * [.EASING_SMOOTHERSTEP](#CABLES.ANIM.EASING_SMOOTHERSTEP) : <code>number</code>
            * [.EASING_BEZIER](#CABLES.ANIM.EASING_BEZIER) : <code>number</code>
            * [.EASING_CUBIC_IN](#CABLES.ANIM.EASING_CUBIC_IN) : <code>number</code>
            * [.EASING_CUBIC_OUT](#CABLES.ANIM.EASING_CUBIC_OUT) : <code>number</code>
            * [.EASING_CUBIC_INOUT](#CABLES.ANIM.EASING_CUBIC_INOUT) : <code>number</code>
            * [.EASING_EXPO_IN](#CABLES.ANIM.EASING_EXPO_IN) : <code>number</code>
            * [.EASING_EXPO_OUT](#CABLES.ANIM.EASING_EXPO_OUT) : <code>number</code>
            * [.EASING_EXPO_INOUT](#CABLES.ANIM.EASING_EXPO_INOUT) : <code>number</code>
            * [.EASING_SIN_IN](#CABLES.ANIM.EASING_SIN_IN) : <code>number</code>
            * [.EASING_SIN_OUT](#CABLES.ANIM.EASING_SIN_OUT) : <code>number</code>
            * [.EASING_SIN_INOUT](#CABLES.ANIM.EASING_SIN_INOUT) : <code>number</code>
            * [.EASING_BACK_IN](#CABLES.ANIM.EASING_BACK_IN) : <code>number</code>
            * [.EASING_BACK_OUT](#CABLES.ANIM.EASING_BACK_OUT) : <code>number</code>
            * [.EASING_BACK_INOUT](#CABLES.ANIM.EASING_BACK_INOUT) : <code>number</code>
            * [.EASING_ELASTIC_IN](#CABLES.ANIM.EASING_ELASTIC_IN) : <code>number</code>
            * [.EASING_ELASTIC_OUT](#CABLES.ANIM.EASING_ELASTIC_OUT) : <code>number</code>
            * [.EASING_BOUNCE_IN](#CABLES.ANIM.EASING_BOUNCE_IN) : <code>number</code>
            * [.EASING_BOUNCE_OUT](#CABLES.ANIM.EASING_BOUNCE_OUT) : <code>number</code>
            * [.EASING_QUART_IN](#CABLES.ANIM.EASING_QUART_IN) : <code>number</code>
            * [.EASING_QUART_OUT](#CABLES.ANIM.EASING_QUART_OUT) : <code>number</code>
            * [.EASING_QUART_INOUT](#CABLES.ANIM.EASING_QUART_INOUT) : <code>number</code>
            * [.EASING_QUINT_IN](#CABLES.ANIM.EASING_QUINT_IN) : <code>number</code>
            * [.EASING_QUINT_OUT](#CABLES.ANIM.EASING_QUINT_OUT) : <code>number</code>
            * [.EASING_QUINT_INOUT](#CABLES.ANIM.EASING_QUINT_INOUT) : <code>number</code>
        * [.EMBED](#CABLES.EMBED) : <code>object</code>
            * [.addPatch(containerElement, patch)](#CABLES.EMBED+addPatch)
        * [.WEBAUDIO](#CABLES.WEBAUDIO) : <code>object</code>
            * [.createAudioContext(op)](#CABLES.WEBAUDIO.createAudioContext)
            * [.getAudioContext()](#CABLES.WEBAUDIO.getAudioContext)
            * [.createAudioInPort(op, portName, audioNode, [inputChannelIndex])](#CABLES.WEBAUDIO.createAudioInPort) ⇒ [<code>Port</code>](#CABLES.Port) \| <code>undefined</code>
            * [.replaceNodeInPort(port)](#CABLES.WEBAUDIO.replaceNodeInPort)
            * [.createAudioOutPort(op, portName, audioNode)](#CABLES.WEBAUDIO.createAudioOutPort) ⇒ [<code>Port</code>](#CABLES.Port) \| <code>undefined</code>
            * [.createAudioParamInPort(op, portName)](#CABLES.WEBAUDIO.createAudioParamInPort) ⇒ [<code>Port</code>](#CABLES.Port) \| <code>undefined</code>
            * [.loadAudioFile(patch, url, onFinished, onError)](#CABLES.WEBAUDIO.loadAudioFile)
            * [.isValidToneTime(t)](#CABLES.WEBAUDIO.isValidToneTime) ⇒ <code>boolean</code>
            * [.isValidToneNote(note)](#CABLES.WEBAUDIO.isValidToneNote) ⇒ <code>boolean</code>
        * [.uuid()](#CABLES.uuid) ⇒ <code>Striug</code>
        * [.simpleId()](#CABLES.simpleId) ⇒ <code>Number</code>
        * [.smoothStep(value)](#CABLES.smoothStep) ⇒ <code>Number</code>
        * [.smootherStep(value)](#CABLES.smootherStep) ⇒ <code>Number</code>
        * [.map(value, oldMin, oldMax, newMin, newMax)](#CABLES.map) ⇒ <code>Number</code>
        * [.cacheBust(url)](#CABLES.cacheBust) ⇒ [<code>String</code>](#String)
        * [.patchConfig](#CABLES.patchConfig) : <code>Object</code>


<br/><br/><br/>

<a id="CABLES+now"></a>
### cableS.now()xx

current time in milliseconds

**Kind**: instance method of [<code>CABLES</code>](#CABLES)  

<br/><br/><br/>

<a id="CABLES.Anim"></a>
### CABLES.Animxx

**Kind**: static class of [<code>CABLES</code>](#CABLES)  

* [.Anim](#CABLES.Anim)
    * [new Anim()](#new_CABLES.Anim_new)
    * [.defaultEasing](#CABLES.Anim+defaultEasing) : <code>Number</code>
    * [.hasEnded(time)](#CABLES.Anim+hasEnded) ⇒ <code>Boolean</code>
    * [.clear([time])](#CABLES.Anim+clear)
    * [.setValue([time], [value], [callback])](#CABLES.Anim+setValue)
    * [.getValue([time])](#CABLES.Anim+getValue) ⇒ <code>Number</code>


<br/><br/><br/>

<a id="new_CABLES.Anim_new"></a>
#### new Anim()xx

Keyframed interpolated animation.


<br/><br/><br/>

<a id="CABLES.Anim+defaultEasing"></a>
#### anim.defaultEasing : <code>Number</code>xx

**Kind**: instance property of [<code>Anim</code>](#CABLES.Anim)  

<br/><br/><br/>

<a id="CABLES.Anim+hasEnded"></a>
#### anim.hasEnded(time) ⇒ <code>Boolean</code>xx

returns true if animation has ended at @time
checks if last key time is < time

**Kind**: instance method of [<code>Anim</code>](#CABLES.Anim)  

| Param | Type |
| --- | --- |
| time | <code>Number</code> | 


<br/><br/><br/>

<a id="CABLES.Anim+clear"></a>
#### anim.clear([time])xx

remove all keys from animation

**Kind**: instance method of [<code>Anim</code>](#CABLES.Anim)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [time] | <code>Number</code> | <code>0</code> | set a new key at time |


<br/><br/><br/>

<a id="CABLES.Anim+setValue"></a>
#### anim.setValue([time], [value], [callback])xx

set value at time

**Kind**: instance method of [<code>Anim</code>](#CABLES.Anim)  

| Param | Type | Description |
| --- | --- | --- |
| [time] | <code>Number</code> | time |
| [value] | <code>Number</code> | value |
| [callback] | <code>function</code> | callback |


<br/><br/><br/>

<a id="CABLES.Anim+getValue"></a>
#### anim.getValue([time]) ⇒ <code>Number</code>xx

get value at time

**Kind**: instance method of [<code>Anim</code>](#CABLES.Anim)  
**Returns**: <code>Number</code> - interpolated value at time  

| Param | Type | Description |
| --- | --- | --- |
| [time] | <code>Number</code> | time |


<br/><br/><br/>

<a id="CABLES.Link"></a>
### CABLES.Linkxx

**Kind**: static class of [<code>CABLES</code>](#CABLES)  

* [.Link](#CABLES.Link)
    * [new Link()](#new_CABLES.Link_new)
    * [.getOtherPort(port)](#CABLES.Link+getOtherPort)
    * [.remove()](#CABLES.Link+remove)
    * [.link(port1, port2)](#CABLES.Link+link)
    * [.canLinkText(port1, port2)](#CABLES.Link+canLinkText)
    * [.canLink(port1, port2)](#CABLES.Link+canLink)


<br/><br/><br/>

<a id="new_CABLES.Link_new"></a>
#### new Link()xx

a link is a connection between two ops/ports -> one input and one output port


<br/><br/><br/>

<a id="CABLES.Link+getOtherPort"></a>
#### link.getOtherPort(port)xx

returns the port of the link, which is not port

**Kind**: instance method of [<code>Link</code>](#CABLES.Link)  

| Param | Type |
| --- | --- |
| port | [<code>Port</code>](#CABLES.Port) | 


<br/><br/><br/>

<a id="CABLES.Link+remove"></a>
#### link.remove()xx

unlink/remove this link from all ports

**Kind**: instance method of [<code>Link</code>](#CABLES.Link)  

<br/><br/><br/>

<a id="CABLES.Link+link"></a>
#### link.link(port1, port2)xx

link those two ports

**Kind**: instance method of [<code>Link</code>](#CABLES.Link)  

| Param | Type |
| --- | --- |
| port1 | [<code>Port</code>](#CABLES.Port) | 
| port2 | [<code>Port</code>](#CABLES.Port) | 


<br/><br/><br/>

<a id="CABLES.Link+canLinkText"></a>
#### link.canLinkText(port1, port2)xx

return a text message with human readable reason if ports can not be linked, or can be

**Kind**: instance method of [<code>Link</code>](#CABLES.Link)  

| Param | Type |
| --- | --- |
| port1 | [<code>Port</code>](#CABLES.Port) | 
| port2 | [<code>Port</code>](#CABLES.Port) | 


<br/><br/><br/>

<a id="CABLES.Link+canLink"></a>
#### link.canLink(port1, port2)xx

return true if ports can be linked

**Kind**: instance method of [<code>Link</code>](#CABLES.Link)  

| Param | Type |
| --- | --- |
| port1 | [<code>Port</code>](#CABLES.Port) | 
| port2 | [<code>Port</code>](#CABLES.Port) | 


<br/><br/><br/>

<a id="CABLES.Op"></a>
### CABLES.Opxx

**Kind**: static class of [<code>CABLES</code>](#CABLES)  

* [.Op](#CABLES.Op)
    * [new CABLES.Op()](#new_CABLES.Op_new)
    * _instance_
        * [.cgl](#CABLES.Op+cgl) : [<code>Context</code>](#CGL.Context)
        * [.preRender()](#CABLES.Op+preRender)
        * [.init()](#CABLES.Op+init)
        * [.inTrigger(name)](#CABLES.Op+inTrigger) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inTriggerButton(name)](#CABLES.Op+inTriggerButton) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inValue(name, value)](#CABLES.Op+inValue) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inValueBool(name, value)](#CABLES.Op+inValueBool) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inValueString(name, value)](#CABLES.Op+inValueString) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inValueText(name, value)](#CABLES.Op+inValueText) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inValueEditor(name, value)](#CABLES.Op+inValueEditor) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inValueSelect(name, values, value)](#CABLES.Op+inValueSelect) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inValueInt(name, value)](#CABLES.Op+inValueInt) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inFile(name)](#CABLES.Op+inFile) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inTexture(name)](#CABLES.Op+inTexture) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inObject(name)](#CABLES.Op+inObject) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inObject(name)](#CABLES.Op+inObject) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inValueSlider(name, name)](#CABLES.Op+inValueSlider) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.outTrigger(name)](#CABLES.Op+outTrigger) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.outValue(name)](#CABLES.Op+outValue) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.outValueBool(name)](#CABLES.Op+outValueBool) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.outValueString(name)](#CABLES.Op+outValueString) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.outObject(name)](#CABLES.Op+outObject) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.outArray(name)](#CABLES.Op+outArray) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.outTexture(name)](#CABLES.Op+outTexture) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.getPortByName(portName)](#CABLES.Op+getPortByName) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.error(id, text)](#CABLES.Op+error)
        * [.addListener(name, callback)](#CABLES.Op+addListener)
        * [.removeEventListener(name, callback)](#CABLES.Op+removeEventListener)
        * [.setEnabled(b)](#CABLES.Op+setEnabled)
        * [.setPortGroup(name, ports)](#CABLES.Op+setPortGroup)
        * [.removePort(port)](#CABLES.Op+removePort)
    * _static_
        * [.getNamespaceClassName(opName)](#CABLES.Op.getNamespaceClassName) ⇒ <code>string</code>


<br/><br/><br/>

<a id="new_CABLES.Op_new"></a>
#### new CABLES.Op()xx

CABLES.Op


<br/><br/><br/>

<a id="CABLES.Op+cgl"></a>
#### op.cgl : [<code>Context</code>](#CGL.Context)xx

current CGL Context

**Kind**: instance property of [<code>Op</code>](#CABLES.Op)  
**Read only**: true  

<br/><br/><br/>

<a id="CABLES.Op+preRender"></a>
#### op.preRender()xx

overwrite this to prerender shader and meshes / will be called by op `loadingStatus`

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

<br/><br/><br/>

<a id="CABLES.Op+init"></a>
#### op.init()xx

overwrite this to initialize your op

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

<br/><br/><br/>

<a id="CABLES.Op+inTrigger"></a>
#### op.inTrigger(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a trigger input port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+inTriggerButton"></a>
#### op.inTriggerButton(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a trigger input  port with an UI trigger button

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+inValue"></a>
#### op.inValue(name, value) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a number value input port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 
| value | <code>Boolean</code> | 


<br/><br/><br/>

<a id="CABLES.Op+inValueBool"></a>
#### op.inValueBool(name, value) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a boolean input port, displayed as a checkbox

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 
| value | <code>Boolean</code> | 


<br/><br/><br/>

<a id="CABLES.Op+inValueString"></a>
#### op.inValueString(name, value) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a String value input port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> |  |
| value | <code>string</code> | default value |


<br/><br/><br/>

<a id="CABLES.Op+inValueText"></a>
#### op.inValueText(name, value) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a String value input port displayed as TextArea

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> |  |
| value | <code>string</code> | default value |


<br/><br/><br/>

<a id="CABLES.Op+inValueEditor"></a>
#### op.inValueEditor(name, value) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a String value input port displayed as editor

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> |  |
| value | <code>string</code> | default value |


<br/><br/><br/>

<a id="CABLES.Op+inValueSelect"></a>
#### op.inValueSelect(name, values, value) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a string select box

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> |  |
| values | <code>Array</code> |  |
| value | <code>string</code> | default value |


<br/><br/><br/>

<a id="CABLES.Op+inValueInt"></a>
#### op.inValueInt(name, value) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a integer input port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> |  |
| value | <code>number</code> | default value |


<br/><br/><br/>

<a id="CABLES.Op+inFile"></a>
#### op.inFile(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a file input port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+inTexture"></a>
#### op.inTexture(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+inObject"></a>
#### op.inObject(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a object input port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+inObject"></a>
#### op.inObject(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a array input port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+inValueSlider"></a>
#### op.inValueSlider(name, name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a value slider input port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 
| name | <code>number</code> | 


<br/><br/><br/>

<a id="CABLES.Op+outTrigger"></a>
#### op.outTrigger(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create output trigger port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+outValue"></a>
#### op.outValue(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create output value port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+outValueBool"></a>
#### op.outValueBool(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create output boolean port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+outValueString"></a>
#### op.outValueString(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create output string port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+outObject"></a>
#### op.outObject(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create output object port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+outArray"></a>
#### op.outArray(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create output array port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+outTexture"></a>
#### op.outTexture(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create output texture port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+getPortByName"></a>
#### op.getPortByName(portName) ⇒ [<code>Port</code>](#CABLES.Port)xx

return port by the name portName

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| portName | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+error"></a>
#### op.error(id, text)xx

show op error message - set message to null to remove error message

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>errorid</code> | error identifier |
| text | <code>txt</code> | message |


<br/><br/><br/>

<a id="CABLES.Op+addListener"></a>
#### op.addListener(name, callback)xx

add an eventlistener ot op
currently implemented:  "onEnabledChange", "onTitleChange", "onUiAttribsChange"

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>which</code> | of event |
| callback | <code>function</code> |  |


<br/><br/><br/>

<a id="CABLES.Op+removeEventListener"></a>
#### op.removeEventListener(name, callback)xx

remove an eventlistener

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>which</code> | of event |
| callback | <code>function</code> |  |


<br/><br/><br/>

<a id="CABLES.Op+setEnabled"></a>
#### op.setEnabled(b)xx

enable/disable op

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| b | <code>boolean</code> | 


<br/><br/><br/>

<a id="CABLES.Op+setPortGroup"></a>
#### op.setPortGroup(name, ports)xx

organize ports into a group

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | [<code>String</code>](#String) | 
| ports | <code>Array</code> | 


<br/><br/><br/>

<a id="CABLES.Op+removePort"></a>
#### op.removePort(port)xx

remove port from op

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type | Description |
| --- | --- | --- |
| port | [<code>Port</code>](#CABLES.Port) | to remove |


<br/><br/><br/>

<a id="CABLES.Op.getNamespaceClassName"></a>
#### Op.getNamespaceClassName(opName) ⇒ <code>string</code>xx

Returns an op category for the op.

**Kind**: static method of [<code>Op</code>](#CABLES.Op)  
**Returns**: <code>string</code> - - The op category  

| Param | Type | Description |
| --- | --- | --- |
| opName | <code>string</code> | The (full) name of the op, e.g. "Ops.Value" |


<br/><br/><br/>

<a id="CABLES.Op"></a>
### CABLES.Opxx

**Kind**: static class of [<code>CABLES</code>](#CABLES)  

* [.Op](#CABLES.Op)
    * [new CABLES.Op()](#new_CABLES.Op_new)
    * _instance_
        * [.cgl](#CABLES.Op+cgl) : [<code>Context</code>](#CGL.Context)
        * [.preRender()](#CABLES.Op+preRender)
        * [.init()](#CABLES.Op+init)
        * [.inTrigger(name)](#CABLES.Op+inTrigger) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inTriggerButton(name)](#CABLES.Op+inTriggerButton) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inValue(name, value)](#CABLES.Op+inValue) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inValueBool(name, value)](#CABLES.Op+inValueBool) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inValueString(name, value)](#CABLES.Op+inValueString) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inValueText(name, value)](#CABLES.Op+inValueText) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inValueEditor(name, value)](#CABLES.Op+inValueEditor) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inValueSelect(name, values, value)](#CABLES.Op+inValueSelect) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inValueInt(name, value)](#CABLES.Op+inValueInt) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inFile(name)](#CABLES.Op+inFile) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inTexture(name)](#CABLES.Op+inTexture) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inObject(name)](#CABLES.Op+inObject) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inObject(name)](#CABLES.Op+inObject) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.inValueSlider(name, name)](#CABLES.Op+inValueSlider) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.outTrigger(name)](#CABLES.Op+outTrigger) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.outValue(name)](#CABLES.Op+outValue) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.outValueBool(name)](#CABLES.Op+outValueBool) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.outValueString(name)](#CABLES.Op+outValueString) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.outObject(name)](#CABLES.Op+outObject) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.outArray(name)](#CABLES.Op+outArray) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.outTexture(name)](#CABLES.Op+outTexture) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.getPortByName(portName)](#CABLES.Op+getPortByName) ⇒ [<code>Port</code>](#CABLES.Port)
        * [.error(id, text)](#CABLES.Op+error)
        * [.addListener(name, callback)](#CABLES.Op+addListener)
        * [.removeEventListener(name, callback)](#CABLES.Op+removeEventListener)
        * [.setEnabled(b)](#CABLES.Op+setEnabled)
        * [.setPortGroup(name, ports)](#CABLES.Op+setPortGroup)
        * [.removePort(port)](#CABLES.Op+removePort)
    * _static_
        * [.getNamespaceClassName(opName)](#CABLES.Op.getNamespaceClassName) ⇒ <code>string</code>


<br/><br/><br/>

<a id="new_CABLES.Op_new"></a>
#### new CABLES.Op()xx

CABLES.Op


<br/><br/><br/>

<a id="CABLES.Op+cgl"></a>
#### op.cgl : [<code>Context</code>](#CGL.Context)xx

current CGL Context

**Kind**: instance property of [<code>Op</code>](#CABLES.Op)  
**Read only**: true  

<br/><br/><br/>

<a id="CABLES.Op+preRender"></a>
#### op.preRender()xx

overwrite this to prerender shader and meshes / will be called by op `loadingStatus`

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

<br/><br/><br/>

<a id="CABLES.Op+init"></a>
#### op.init()xx

overwrite this to initialize your op

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

<br/><br/><br/>

<a id="CABLES.Op+inTrigger"></a>
#### op.inTrigger(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a trigger input port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+inTriggerButton"></a>
#### op.inTriggerButton(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a trigger input  port with an UI trigger button

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+inValue"></a>
#### op.inValue(name, value) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a number value input port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 
| value | <code>Boolean</code> | 


<br/><br/><br/>

<a id="CABLES.Op+inValueBool"></a>
#### op.inValueBool(name, value) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a boolean input port, displayed as a checkbox

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 
| value | <code>Boolean</code> | 


<br/><br/><br/>

<a id="CABLES.Op+inValueString"></a>
#### op.inValueString(name, value) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a String value input port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> |  |
| value | <code>string</code> | default value |


<br/><br/><br/>

<a id="CABLES.Op+inValueText"></a>
#### op.inValueText(name, value) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a String value input port displayed as TextArea

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> |  |
| value | <code>string</code> | default value |


<br/><br/><br/>

<a id="CABLES.Op+inValueEditor"></a>
#### op.inValueEditor(name, value) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a String value input port displayed as editor

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> |  |
| value | <code>string</code> | default value |


<br/><br/><br/>

<a id="CABLES.Op+inValueSelect"></a>
#### op.inValueSelect(name, values, value) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a string select box

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> |  |
| values | <code>Array</code> |  |
| value | <code>string</code> | default value |


<br/><br/><br/>

<a id="CABLES.Op+inValueInt"></a>
#### op.inValueInt(name, value) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a integer input port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> |  |
| value | <code>number</code> | default value |


<br/><br/><br/>

<a id="CABLES.Op+inFile"></a>
#### op.inFile(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a file input port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+inTexture"></a>
#### op.inTexture(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+inObject"></a>
#### op.inObject(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a object input port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+inObject"></a>
#### op.inObject(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a array input port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+inValueSlider"></a>
#### op.inValueSlider(name, name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create a value slider input port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 
| name | <code>number</code> | 


<br/><br/><br/>

<a id="CABLES.Op+outTrigger"></a>
#### op.outTrigger(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create output trigger port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+outValue"></a>
#### op.outValue(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create output value port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+outValueBool"></a>
#### op.outValueBool(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create output boolean port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+outValueString"></a>
#### op.outValueString(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create output string port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+outObject"></a>
#### op.outObject(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create output object port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+outArray"></a>
#### op.outArray(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create output array port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+outTexture"></a>
#### op.outTexture(name) ⇒ [<code>Port</code>](#CABLES.Port)xx

create output texture port

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+getPortByName"></a>
#### op.getPortByName(portName) ⇒ [<code>Port</code>](#CABLES.Port)xx

return port by the name portName

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| portName | <code>string</code> | 


<br/><br/><br/>

<a id="CABLES.Op+error"></a>
#### op.error(id, text)xx

show op error message - set message to null to remove error message

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>errorid</code> | error identifier |
| text | <code>txt</code> | message |


<br/><br/><br/>

<a id="CABLES.Op+addListener"></a>
#### op.addListener(name, callback)xx

add an eventlistener ot op
currently implemented:  "onEnabledChange", "onTitleChange", "onUiAttribsChange"

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>which</code> | of event |
| callback | <code>function</code> |  |


<br/><br/><br/>

<a id="CABLES.Op+removeEventListener"></a>
#### op.removeEventListener(name, callback)xx

remove an eventlistener

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>which</code> | of event |
| callback | <code>function</code> |  |


<br/><br/><br/>

<a id="CABLES.Op+setEnabled"></a>
#### op.setEnabled(b)xx

enable/disable op

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| b | <code>boolean</code> | 


<br/><br/><br/>

<a id="CABLES.Op+setPortGroup"></a>
#### op.setPortGroup(name, ports)xx

organize ports into a group

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type |
| --- | --- |
| name | [<code>String</code>](#String) | 
| ports | <code>Array</code> | 


<br/><br/><br/>

<a id="CABLES.Op+removePort"></a>
#### op.removePort(port)xx

remove port from op

**Kind**: instance method of [<code>Op</code>](#CABLES.Op)  

| Param | Type | Description |
| --- | --- | --- |
| port | [<code>Port</code>](#CABLES.Port) | to remove |


<br/><br/><br/>

<a id="CABLES.Op.getNamespaceClassName"></a>
#### Op.getNamespaceClassName(opName) ⇒ <code>string</code>xx

Returns an op category for the op.

**Kind**: static method of [<code>Op</code>](#CABLES.Op)  
**Returns**: <code>string</code> - - The op category  

| Param | Type | Description |
| --- | --- | --- |
| opName | <code>string</code> | The (full) name of the op, e.g. "Ops.Value" |


<br/><br/><br/>

<a id="CABLES.Patch"></a>
### CABLES.Patchxx

**Kind**: static class of [<code>CABLES</code>](#CABLES)  

* [.Patch](#CABLES.Patch)
    * [new Patch(config)](#new_CABLES.Patch_new)
    * _instance_
        * [.getFPS()](#CABLES.Patch+getFPS) ⇒ <code>Number</code>
        * [.pause()](#CABLES.Patch+pause)
        * [.resume()](#CABLES.Patch+resume)
        * [.setVolume()](#CABLES.Patch+setVolume)
        * [.getFilePath(filename)](#CABLES.Patch+getFilePath) ⇒ [<code>String</code>](#String)
        * [.addOp(objName,, UI)](#CABLES.Patch+addOp)
        * [.link(op1, op1, op2, op2)](#CABLES.Patch+link)
        * [.getVar(name)](#CABLES.Patch+getVar) ⇒ [<code>Variable</code>](#CABLES.Patch.Variable)
        * [.getVars()](#CABLES.Patch+getVars) ⇒ [<code>Array.&lt;Variable&gt;</code>](#CABLES.Patch.Variable)
        * [.preRenderOps()](#CABLES.Patch+preRenderOps)
    * _static_
        * [.Variable](#CABLES.Patch.Variable)
            * [new Variable(name, value)](#new_CABLES.Patch.Variable_new)
            * [.getValue()](#CABLES.Patch.Variable+getValue) ⇒ [<code>String</code>](#String) \| <code>Number</code> \| <code>Boolean</code>
            * [.getName()](#CABLES.Patch.Variable+getName) ⇒ [<code>String</code>](#String) \| <code>Number</code> \| <code>Boolean</code>
            * [.setValue()](#CABLES.Patch.Variable+setValue) ⇒ [<code>String</code>](#String) \| <code>Number</code> \| <code>Boolean</code>
            * [.addListener(callback)](#CABLES.Patch.Variable+addListener)
            * [.removeListener(callback)](#CABLES.Patch.Variable+removeListener)
            * [.setVariable(name, value)](#CABLES.Patch.Variable+setVariable)


<br/><br/><br/>

<a id="new_CABLES.Patch_new"></a>
#### new Patch(config)xx


| Param | Type |
| --- | --- |
| config | <code>patchConfig</code> | 


<br/><br/><br/>

<a id="CABLES.Patch+getFPS"></a>
#### patch.getFPS() ⇒ <code>Number</code>xx

current number of frames per second

**Kind**: instance method of [<code>Patch</code>](#CABLES.Patch)  
**Returns**: <code>Number</code> - fps  

<br/><br/><br/>

<a id="CABLES.Patch+pause"></a>
#### patch.pause()xx

pauses patch execution

**Kind**: instance method of [<code>Patch</code>](#CABLES.Patch)  

<br/><br/><br/>

<a id="CABLES.Patch+resume"></a>
#### patch.resume()xx

resumes patch execution

**Kind**: instance method of [<code>Patch</code>](#CABLES.Patch)  

<br/><br/><br/>

<a id="CABLES.Patch+setVolume"></a>
#### patch.setVolume()xx

set volume [0-1]

**Kind**: instance method of [<code>Patch</code>](#CABLES.Patch)  

<br/><br/><br/>

<a id="CABLES.Patch+getFilePath"></a>
#### patch.getFilePath(filename) ⇒ [<code>String</code>](#String)xx

get url/filepath for a filename 
this uses prefixAssetpath in exported patches

**Kind**: instance method of [<code>Patch</code>](#CABLES.Patch)  
**Returns**: [<code>String</code>](#String) - url  

| Param | Type |
| --- | --- |
| filename | [<code>String</code>](#String) | 


<br/><br/><br/>

<a id="CABLES.Patch+addOp"></a>
#### patch.addOp(objName,, UI)xx

create a new op in patch

**Kind**: instance method of [<code>Patch</code>](#CABLES.Patch)  

| Param | Type | Description |
| --- | --- | --- |
| objName, | [<code>String</code>](#String) | e.g. Ops.Math.Sum |
| UI | <code>Object</code> | Attributes |


<br/><br/><br/>

<a id="CABLES.Patch+link"></a>
#### patch.link(op1, op1, op2, op2)xx

link two ops/ports

**Kind**: instance method of [<code>Patch</code>](#CABLES.Patch)  

| Param | Type | Description |
| --- | --- | --- |
| op1 | [<code>Op</code>](#CABLES.Op) |  |
| op1 | [<code>String</code>](#String) | portName |
| op2 | [<code>Op</code>](#CABLES.Op) |  |
| op2 | [<code>String</code>](#String) | portName |


<br/><br/><br/>

<a id="CABLES.Patch+getVar"></a>
#### patch.getVar(name) ⇒ [<code>Variable</code>](#CABLES.Patch.Variable)xx

**Kind**: instance method of [<code>Patch</code>](#CABLES.Patch)  
**Returns**: [<code>Variable</code>](#CABLES.Patch.Variable) - variable  

| Param | Type |
| --- | --- |
| name | [<code>String</code>](#String) | 


<br/><br/><br/>

<a id="CABLES.Patch+getVars"></a>
#### patch.getVars() ⇒ [<code>Array.&lt;Variable&gt;</code>](#CABLES.Patch.Variable)xx

**Kind**: instance method of [<code>Patch</code>](#CABLES.Patch)  
**Returns**: [<code>Array.&lt;Variable&gt;</code>](#CABLES.Patch.Variable) - variables  

<br/><br/><br/>

<a id="CABLES.Patch+preRenderOps"></a>
#### patch.preRenderOps()xx

invoke pre rendering of ops

**Kind**: instance method of [<code>Patch</code>](#CABLES.Patch)  

<br/><br/><br/>

<a id="CABLES.Patch.Variable"></a>
#### Patch.Variablexx

**Kind**: static class of [<code>Patch</code>](#CABLES.Patch)  

* [.Variable](#CABLES.Patch.Variable)
    * [new Variable(name, value)](#new_CABLES.Patch.Variable_new)
    * [.getValue()](#CABLES.Patch.Variable+getValue) ⇒ [<code>String</code>](#String) \| <code>Number</code> \| <code>Boolean</code>
    * [.getName()](#CABLES.Patch.Variable+getName) ⇒ [<code>String</code>](#String) \| <code>Number</code> \| <code>Boolean</code>
    * [.setValue()](#CABLES.Patch.Variable+setValue) ⇒ [<code>String</code>](#String) \| <code>Number</code> \| <code>Boolean</code>
    * [.addListener(callback)](#CABLES.Patch.Variable+addListener)
    * [.removeListener(callback)](#CABLES.Patch.Variable+removeListener)
    * [.setVariable(name, value)](#CABLES.Patch.Variable+setVariable)


<br/><br/><br/>

<a id="new_CABLES.Patch.Variable_new"></a>
##### new Variable(name, value)xx


| Param | Type |
| --- | --- |
| name | [<code>String</code>](#String) | 
| value | [<code>String</code>](#String) \| <code>Number</code> | 


<br/><br/><br/>

<a id="CABLES.Patch.Variable+getValue"></a>
##### variable.getValue() ⇒ [<code>String</code>](#String) \| <code>Number</code> \| <code>Boolean</code>xx

**Kind**: instance method of [<code>Variable</code>](#CABLES.Patch.Variable)  

<br/><br/><br/>

<a id="CABLES.Patch.Variable+getName"></a>
##### variable.getName() ⇒ [<code>String</code>](#String) \| <code>Number</code> \| <code>Boolean</code>xx

**Kind**: instance method of [<code>Variable</code>](#CABLES.Patch.Variable)  

<br/><br/><br/>

<a id="CABLES.Patch.Variable+setValue"></a>
##### variable.setValue() ⇒ [<code>String</code>](#String) \| <code>Number</code> \| <code>Boolean</code>xx

**Kind**: instance method of [<code>Variable</code>](#CABLES.Patch.Variable)  

<br/><br/><br/>

<a id="CABLES.Patch.Variable+addListener"></a>
##### variable.addListener(callback)xx

function will be called when value of variable is changed

**Kind**: instance method of [<code>Variable</code>](#CABLES.Patch.Variable)  

| Param | Type |
| --- | --- |
| callback | <code>function</code> | 


<br/><br/><br/>

<a id="CABLES.Patch.Variable+removeListener"></a>
##### variable.removeListener(callback)xx

remove listener

**Kind**: instance method of [<code>Variable</code>](#CABLES.Patch.Variable)  

| Param | Type |
| --- | --- |
| callback | <code>function</code> | 


<br/><br/><br/>

<a id="CABLES.Patch.Variable+setVariable"></a>
##### variable.setVariable(name, value)xx

set variable value

**Kind**: instance method of [<code>Variable</code>](#CABLES.Patch.Variable)  

| Param | Type | Description |
| --- | --- | --- |
| name | [<code>String</code>](#String) | of variable |
| value | <code>Number</code> \| [<code>String</code>](#String) \| <code>Boolena</code> |  |


<br/><br/><br/>

<a id="CABLES.Port"></a>
### CABLES.Portxx

**Kind**: static class of [<code>CABLES</code>](#CABLES)  

* [.Port](#CABLES.Port)
    * _instance_
        * [.onChange](#CABLES.Port+onChange) : <code>function</code>
        * [.direction](#CABLES.Port+direction) : <code>number</code>
        * [.links](#CABLES.Port+links) : [<code>Array.&lt;Link&gt;</code>](#CABLES.Link)
        * [.hidePort()](#CABLES.Port+hidePort)
        * [.remove()](#CABLES.Port+remove)
        * [.setUiAttribs(newAttribs)](#CABLES.Port+setUiAttribs)
        * [.get()](#CABLES.Port+get)
        * [.setValue()](#CABLES.Port+setValue)
        * [.getTypeString()](#CABLES.Port+getTypeString) ⇒ <code>string</code>
        * [.removeLinks()](#CABLES.Port+removeLinks)
        * [.removeLink(link)](#CABLES.Port+removeLink)
        * [.getName()](#CABLES.Port+getName)
        * [.getLinkTo(otherPort)](#CABLES.Port+getLinkTo)
        * [.removeLinkTo(otherPort)](#CABLES.Port+removeLinkTo)
        * [.isLinkedTo(otherPort)](#CABLES.Port+isLinkedTo)
        * [.trigger()](#CABLES.Port+trigger)
        * [.getType()](#CABLES.Port+getType) ⇒ <code>number</code>
        * [.getType()](#CABLES.Port+getType) ⇒ <code>number</code>
        * [.isAnimated()](#CABLES.Port+isAnimated) ⇒ <code>boolean</code>
        * [.isHidden()](#CABLES.Port+isHidden) ⇒ <code>boolean</code>
        * [.onTriggered(callback)](#CABLES.Port+onTriggered)
    * _static_
        * [.portTypeNumberToString(type)](#CABLES.Port.portTypeNumberToString) ⇒ <code>string</code>


<br/><br/><br/>

<a id="CABLES.Port+onChange"></a>
#### port.onChange : <code>function</code>xx

change listener for input value ports

**Kind**: instance property of [<code>Port</code>](#CABLES.Port)  

<br/><br/><br/>

<a id="CABLES.Port+direction"></a>
#### port.direction : <code>number</code>xx

direction of port (input(0) or output(1))

**Kind**: instance property of [<code>Port</code>](#CABLES.Port)  

<br/><br/><br/>

<a id="CABLES.Port+links"></a>
#### port.links : [<code>Array.&lt;Link&gt;</code>](#CABLES.Link)xx

links of port

**Kind**: instance property of [<code>Port</code>](#CABLES.Port)  

<br/><br/><br/>

<a id="CABLES.Port+hidePort"></a>
#### port.hidePort()xx

hide port rectangle in op

**Kind**: instance method of [<code>Port</code>](#CABLES.Port)  

<br/><br/><br/>

<a id="CABLES.Port+remove"></a>
#### port.remove()xx

remove port

**Kind**: instance method of [<code>Port</code>](#CABLES.Port)  

<br/><br/><br/>

<a id="CABLES.Port+setUiAttribs"></a>
#### port.setUiAttribs(newAttribs)xx

set ui attributes

**Kind**: instance method of [<code>Port</code>](#CABLES.Port)  

| Param | Type |
| --- | --- |
| newAttribs | <code>Object</code> | 


<br/><br/><br/>

<a id="CABLES.Port+get"></a>
#### port.get()xx

get value of port

**Kind**: instance method of [<code>Port</code>](#CABLES.Port)  

<br/><br/><br/>

<a id="CABLES.Port+setValue"></a>
#### port.setValue()xx

set value of port / will send value to all linked ports (only for output ports)

**Kind**: instance method of [<code>Port</code>](#CABLES.Port)  

<br/><br/><br/>

<a id="CABLES.Port+getTypeString"></a>
#### port.getTypeString() ⇒ <code>string</code>xx

get port type as string, e.g. "Function","Value"...

**Kind**: instance method of [<code>Port</code>](#CABLES.Port)  
**Returns**: <code>string</code> - type  

<br/><br/><br/>

<a id="CABLES.Port+removeLinks"></a>
#### port.removeLinks()xx

remove all links from port

**Kind**: instance method of [<code>Port</code>](#CABLES.Port)  

<br/><br/><br/>

<a id="CABLES.Port+removeLink"></a>
#### port.removeLink(link)xx

remove all link from port

**Kind**: instance method of [<code>Port</code>](#CABLES.Port)  

| Param | Type |
| --- | --- |
| link | [<code>Link</code>](#CABLES.Link) | 


<br/><br/><br/>

<a id="CABLES.Port+getName"></a>
#### port.getName()xx

return port name

**Kind**: instance method of [<code>Port</code>](#CABLES.Port)  

<br/><br/><br/>

<a id="CABLES.Port+getLinkTo"></a>
#### port.getLinkTo(otherPort)xx

return link, which is linked to otherPort

**Kind**: instance method of [<code>Port</code>](#CABLES.Port)  

| Param | Type |
| --- | --- |
| otherPort | [<code>Port</code>](#CABLES.Port) | 


<br/><br/><br/>

<a id="CABLES.Port+removeLinkTo"></a>
#### port.removeLinkTo(otherPort)xx

removes link, which is linked to otherPort

**Kind**: instance method of [<code>Port</code>](#CABLES.Port)  

| Param | Type |
| --- | --- |
| otherPort | [<code>Port</code>](#CABLES.Port) | 


<br/><br/><br/>

<a id="CABLES.Port+isLinkedTo"></a>
#### port.isLinkedTo(otherPort)xx

returns true if port is linked to otherPort

**Kind**: instance method of [<code>Port</code>](#CABLES.Port)  

| Param | Type |
| --- | --- |
| otherPort | [<code>Port</code>](#CABLES.Port) | 


<br/><br/><br/>

<a id="CABLES.Port+trigger"></a>
#### port.trigger()xx

trigger the linked port (usually invoked on an output function port)

**Kind**: instance method of [<code>Port</code>](#CABLES.Port)  

<br/><br/><br/>

<a id="CABLES.Port+getType"></a>
#### port.getType() ⇒ <code>number</code>xx

return type of port

**Kind**: instance method of [<code>Port</code>](#CABLES.Port)  
**Returns**: <code>number</code> - type  

<br/><br/><br/>

<a id="CABLES.Port+getType"></a>
#### port.getType() ⇒ <code>number</code>xx

return true if port is linked

**Kind**: instance method of [<code>Port</code>](#CABLES.Port)  

<br/><br/><br/>

<a id="CABLES.Port+isAnimated"></a>
#### port.isAnimated() ⇒ <code>boolean</code>xx

return true if port is animated

**Kind**: instance method of [<code>Port</code>](#CABLES.Port)  

<br/><br/><br/>

<a id="CABLES.Port+isHidden"></a>
#### port.isHidden() ⇒ <code>boolean</code>xx

return true if port is hidden

**Kind**: instance method of [<code>Port</code>](#CABLES.Port)  

<br/><br/><br/>

<a id="CABLES.Port+onTriggered"></a>
#### port.onTriggered(callback)xx

set callback, which will be executed when port was triggered (usually output port)

**Kind**: instance method of [<code>Port</code>](#CABLES.Port)  

| Param | Type |
| --- | --- |
| callback | <code>function</code> | 


<br/><br/><br/>

<a id="CABLES.Port.portTypeNumberToString"></a>
#### Port.portTypeNumberToString(type) ⇒ <code>string</code>xx

Returns the port type string, e.g. "value" based on the port type number

**Kind**: static method of [<code>Port</code>](#CABLES.Port)  
**Returns**: <code>string</code> - - The port type as string  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>number</code> | The port type number |


<br/><br/><br/>

<a id="CABLES.Timer"></a>
### CABLES.Timerxx

**Kind**: static class of [<code>CABLES</code>](#CABLES)  

* [.Timer](#CABLES.Timer)
    * [.isPlaying()](#CABLES.Timer+isPlaying) ⇒ <code>Boolean</code>
    * [.update()](#CABLES.Timer+update) ⇒ <code>Number</code>
    * [.getMillis()](#CABLES.Timer+getMillis) ⇒ <code>Number</code>
    * [.getTime()](#CABLES.Timer+getTime) ⇒ <code>Number</code>
    * [.togglePlay()](#CABLES.Timer+togglePlay)
    * [.setTime()](#CABLES.Timer+setTime)
    * [.play()](#CABLES.Timer+play)
    * [.pause()](#CABLES.Timer+pause)
    * [.onPlayPause(callback)](#CABLES.Timer+onPlayPause)
    * [.onTimeChange(callback)](#CABLES.Timer+onTimeChange)


<br/><br/><br/>

<a id="CABLES.Timer+isPlaying"></a>
#### timer.isPlaying() ⇒ <code>Boolean</code>xx

returns true if timer is playing

**Kind**: instance method of [<code>Timer</code>](#CABLES.Timer)  
**Returns**: <code>Boolean</code> - value  

<br/><br/><br/>

<a id="CABLES.Timer+update"></a>
#### timer.update() ⇒ <code>Number</code>xx

update timer

**Kind**: instance method of [<code>Timer</code>](#CABLES.Timer)  
**Returns**: <code>Number</code> - time  

<br/><br/><br/>

<a id="CABLES.Timer+getMillis"></a>
#### timer.getMillis() ⇒ <code>Number</code>xx

returns time in milliseconds

**Kind**: instance method of [<code>Timer</code>](#CABLES.Timer)  
**Returns**: <code>Number</code> - value  

<br/><br/><br/>

<a id="CABLES.Timer+getTime"></a>
#### timer.getTime() ⇒ <code>Number</code>xx

returns time in seconds

**Kind**: instance method of [<code>Timer</code>](#CABLES.Timer)  
**Returns**: <code>Number</code> - value  

<br/><br/><br/>

<a id="CABLES.Timer+togglePlay"></a>
#### timer.togglePlay()xx

toggle playing state

**Kind**: instance method of [<code>Timer</code>](#CABLES.Timer)  

<br/><br/><br/>

<a id="CABLES.Timer+setTime"></a>
#### timer.setTime()xx

set current time

**Kind**: instance method of [<code>Timer</code>](#CABLES.Timer)  

<br/><br/><br/>

<a id="CABLES.Timer+play"></a>
#### timer.play()xx

(re)starts the timer

**Kind**: instance method of [<code>Timer</code>](#CABLES.Timer)  

<br/><br/><br/>

<a id="CABLES.Timer+pause"></a>
#### timer.pause()xx

pauses the timer

**Kind**: instance method of [<code>Timer</code>](#CABLES.Timer)  

<br/><br/><br/>

<a id="CABLES.Timer+onPlayPause"></a>
#### timer.onPlayPause(callback)xx

adds callback, which will be executed it playing state changed

**Kind**: instance method of [<code>Timer</code>](#CABLES.Timer)  

| Param | Type |
| --- | --- |
| callback | <code>function</code> | 


<br/><br/><br/>

<a id="CABLES.Timer+onTimeChange"></a>
#### timer.onTimeChange(callback)xx

adds callback, which will be executed when the current time changes

**Kind**: instance method of [<code>Timer</code>](#CABLES.Timer)  

| Param | Type |
| --- | --- |
| callback | <code>function</code> | 


<br/><br/><br/>

<a id="CABLES.ANIM"></a>
### CABLES.ANIM : <code>object</code>xx

**Kind**: static namespace of [<code>CABLES</code>](#CABLES)  

* [.ANIM](#CABLES.ANIM) : <code>object</code>
    * [.EASING_LINEAR](#CABLES.ANIM.EASING_LINEAR) : <code>number</code>
    * [.EASING_ABSOLUTE](#CABLES.ANIM.EASING_ABSOLUTE) : <code>number</code>
    * [.EASING_SMOOTHSTEP](#CABLES.ANIM.EASING_SMOOTHSTEP) : <code>number</code>
    * [.EASING_SMOOTHERSTEP](#CABLES.ANIM.EASING_SMOOTHERSTEP) : <code>number</code>
    * [.EASING_BEZIER](#CABLES.ANIM.EASING_BEZIER) : <code>number</code>
    * [.EASING_CUBIC_IN](#CABLES.ANIM.EASING_CUBIC_IN) : <code>number</code>
    * [.EASING_CUBIC_OUT](#CABLES.ANIM.EASING_CUBIC_OUT) : <code>number</code>
    * [.EASING_CUBIC_INOUT](#CABLES.ANIM.EASING_CUBIC_INOUT) : <code>number</code>
    * [.EASING_EXPO_IN](#CABLES.ANIM.EASING_EXPO_IN) : <code>number</code>
    * [.EASING_EXPO_OUT](#CABLES.ANIM.EASING_EXPO_OUT) : <code>number</code>
    * [.EASING_EXPO_INOUT](#CABLES.ANIM.EASING_EXPO_INOUT) : <code>number</code>
    * [.EASING_SIN_IN](#CABLES.ANIM.EASING_SIN_IN) : <code>number</code>
    * [.EASING_SIN_OUT](#CABLES.ANIM.EASING_SIN_OUT) : <code>number</code>
    * [.EASING_SIN_INOUT](#CABLES.ANIM.EASING_SIN_INOUT) : <code>number</code>
    * [.EASING_BACK_IN](#CABLES.ANIM.EASING_BACK_IN) : <code>number</code>
    * [.EASING_BACK_OUT](#CABLES.ANIM.EASING_BACK_OUT) : <code>number</code>
    * [.EASING_BACK_INOUT](#CABLES.ANIM.EASING_BACK_INOUT) : <code>number</code>
    * [.EASING_ELASTIC_IN](#CABLES.ANIM.EASING_ELASTIC_IN) : <code>number</code>
    * [.EASING_ELASTIC_OUT](#CABLES.ANIM.EASING_ELASTIC_OUT) : <code>number</code>
    * [.EASING_BOUNCE_IN](#CABLES.ANIM.EASING_BOUNCE_IN) : <code>number</code>
    * [.EASING_BOUNCE_OUT](#CABLES.ANIM.EASING_BOUNCE_OUT) : <code>number</code>
    * [.EASING_QUART_IN](#CABLES.ANIM.EASING_QUART_IN) : <code>number</code>
    * [.EASING_QUART_OUT](#CABLES.ANIM.EASING_QUART_OUT) : <code>number</code>
    * [.EASING_QUART_INOUT](#CABLES.ANIM.EASING_QUART_INOUT) : <code>number</code>
    * [.EASING_QUINT_IN](#CABLES.ANIM.EASING_QUINT_IN) : <code>number</code>
    * [.EASING_QUINT_OUT](#CABLES.ANIM.EASING_QUINT_OUT) : <code>number</code>
    * [.EASING_QUINT_INOUT](#CABLES.ANIM.EASING_QUINT_INOUT) : <code>number</code>


<br/><br/><br/>

<a id="CABLES.ANIM.EASING_LINEAR"></a>
#### ANIM.EASING\_LINEAR : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_ABSOLUTE"></a>
#### ANIM.EASING\_ABSOLUTE : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_SMOOTHSTEP"></a>
#### ANIM.EASING\_SMOOTHSTEP : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_SMOOTHERSTEP"></a>
#### ANIM.EASING\_SMOOTHERSTEP : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_BEZIER"></a>
#### ANIM.EASING\_BEZIER : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_CUBIC_IN"></a>
#### ANIM.EASING\_CUBIC\_IN : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_CUBIC_OUT"></a>
#### ANIM.EASING\_CUBIC\_OUT : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_CUBIC_INOUT"></a>
#### ANIM.EASING\_CUBIC\_INOUT : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_EXPO_IN"></a>
#### ANIM.EASING\_EXPO\_IN : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_EXPO_OUT"></a>
#### ANIM.EASING\_EXPO\_OUT : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_EXPO_INOUT"></a>
#### ANIM.EASING\_EXPO\_INOUT : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_SIN_IN"></a>
#### ANIM.EASING\_SIN\_IN : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_SIN_OUT"></a>
#### ANIM.EASING\_SIN\_OUT : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_SIN_INOUT"></a>
#### ANIM.EASING\_SIN\_INOUT : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_BACK_IN"></a>
#### ANIM.EASING\_BACK\_IN : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_BACK_OUT"></a>
#### ANIM.EASING\_BACK\_OUT : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_BACK_INOUT"></a>
#### ANIM.EASING\_BACK\_INOUT : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_ELASTIC_IN"></a>
#### ANIM.EASING\_ELASTIC\_IN : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_ELASTIC_OUT"></a>
#### ANIM.EASING\_ELASTIC\_OUT : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_BOUNCE_IN"></a>
#### ANIM.EASING\_BOUNCE\_IN : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_BOUNCE_OUT"></a>
#### ANIM.EASING\_BOUNCE\_OUT : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_QUART_IN"></a>
#### ANIM.EASING\_QUART\_IN : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_QUART_OUT"></a>
#### ANIM.EASING\_QUART\_OUT : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_QUART_INOUT"></a>
#### ANIM.EASING\_QUART\_INOUT : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_QUINT_IN"></a>
#### ANIM.EASING\_QUINT\_IN : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_QUINT_OUT"></a>
#### ANIM.EASING\_QUINT\_OUT : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.ANIM.EASING_QUINT_INOUT"></a>
#### ANIM.EASING\_QUINT\_INOUT : <code>number</code>xx

**Kind**: static constant of [<code>ANIM</code>](#CABLES.ANIM)  

<br/><br/><br/>

<a id="CABLES.EMBED"></a>
### CABLES.EMBED : <code>object</code>xx

**Kind**: static namespace of [<code>CABLES</code>](#CABLES)  

<br/><br/><br/>

<a id="CABLES.EMBED+addPatch"></a>
#### embeD.addPatch(containerElement, patch)xx

add patch into html element (will create canvas and set size to fill containerElement)

**Kind**: instance method of [<code>EMBED</code>](#CABLES.EMBED)  

| Param | Type | Description |
| --- | --- | --- |
| containerElement | <code>object</code> \| <code>string</code> | dom element or id of element |
| patch | <code>options</code> | options |


<br/><br/><br/>

<a id="CABLES.WEBAUDIO"></a>
### CABLES.WEBAUDIO : <code>object</code>xx

**Kind**: static namespace of [<code>CABLES</code>](#CABLES)  

* [.WEBAUDIO](#CABLES.WEBAUDIO) : <code>object</code>
    * [.createAudioContext(op)](#CABLES.WEBAUDIO.createAudioContext)
    * [.getAudioContext()](#CABLES.WEBAUDIO.getAudioContext)
    * [.createAudioInPort(op, portName, audioNode, [inputChannelIndex])](#CABLES.WEBAUDIO.createAudioInPort) ⇒ [<code>Port</code>](#CABLES.Port) \| <code>undefined</code>
    * [.replaceNodeInPort(port)](#CABLES.WEBAUDIO.replaceNodeInPort)
    * [.createAudioOutPort(op, portName, audioNode)](#CABLES.WEBAUDIO.createAudioOutPort) ⇒ [<code>Port</code>](#CABLES.Port) \| <code>undefined</code>
    * [.createAudioParamInPort(op, portName)](#CABLES.WEBAUDIO.createAudioParamInPort) ⇒ [<code>Port</code>](#CABLES.Port) \| <code>undefined</code>
    * [.loadAudioFile(patch, url, onFinished, onError)](#CABLES.WEBAUDIO.loadAudioFile)
    * [.isValidToneTime(t)](#CABLES.WEBAUDIO.isValidToneTime) ⇒ <code>boolean</code>
    * [.isValidToneNote(note)](#CABLES.WEBAUDIO.isValidToneNote) ⇒ <code>boolean</code>


<br/><br/><br/>

<a id="CABLES.WEBAUDIO.createAudioContext"></a>
#### WEBAUDIO.createAudioContext(op)xx

Checks if a global audio context has been created and creates
it if necessary. This audio context can be used for native Web Audio as well as Tone.js ops.
Associates the audio context with Tone.js if it is being used

**Kind**: static method of [<code>WEBAUDIO</code>](#CABLES.WEBAUDIO)  

| Param | Type | Description |
| --- | --- | --- |
| op | [<code>Op</code>](#CABLES.Op) | The operator which needs the Audio Context |


<br/><br/><br/>

<a id="CABLES.WEBAUDIO.getAudioContext"></a>
#### WEBAUDIO.getAudioContext()xx

Returns the audio context.
Before `createAudioContext` must have been called at least once. 
It most cases you should use `createAudioContext`, which just returns the audio context 
when it has been created already.

**Kind**: static method of [<code>WEBAUDIO</code>](#CABLES.WEBAUDIO)  

<br/><br/><br/>

<a id="CABLES.WEBAUDIO.createAudioInPort"></a>
#### WEBAUDIO.createAudioInPort(op, portName, audioNode, [inputChannelIndex]) ⇒ [<code>Port</code>](#CABLES.Port) \| <code>undefined</code>xx

Creates an audio in port for the op with name `portName`
When disconnected it will disconnect the previous connected audio node
from the op's audio node.

**Kind**: static method of [<code>WEBAUDIO</code>](#CABLES.WEBAUDIO)  
**Returns**: [<code>Port</code>](#CABLES.Port) \| <code>undefined</code> - - The newly created audio in port or `undefined` if there was an error  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| op | [<code>Op</code>](#CABLES.Op) |  | The operator to create the audio port in |
| portName | <code>string</code> |  | The name of the port |
| audioNode | <code>AudioNode</code> |  | The audionode incoming connections should connect to |
| [inputChannelIndex] | <code>number</code> | <code>0</code> | If the audio node has multiple inputs, this is the index of the input channel to connect to |


<br/><br/><br/>

<a id="CABLES.WEBAUDIO.replaceNodeInPort"></a>
#### WEBAUDIO.replaceNodeInPort(port)xx

Sometimes it is necessary to replace a node of a port, if so all
connections to this node must be disconnected and connections to the new
node must be made.
Can be used for both Audio ports as well as AudioParam ports
if used with an AudioParam pass e.g. `synth.frequency` as newNode

**Kind**: static method of [<code>WEBAUDIO</code>](#CABLES.WEBAUDIO)  

| Param | Type | Description |
| --- | --- | --- |
| port | [<code>Port</code>](#CABLES.Port) | The port where the audio node needs to be replaced |


<br/><br/><br/>

<a id="CABLES.WEBAUDIO.createAudioOutPort"></a>
#### WEBAUDIO.createAudioOutPort(op, portName, audioNode) ⇒ [<code>Port</code>](#CABLES.Port) \| <code>undefined</code>xx

Creates an audio out port which takes care of (dis-)connecting on it’s own

**Kind**: static method of [<code>WEBAUDIO</code>](#CABLES.WEBAUDIO)  
**Returns**: [<code>Port</code>](#CABLES.Port) \| <code>undefined</code> - - The newly created audio out port or `undefined` if there was an error  

| Param | Type | Description |
| --- | --- | --- |
| op | <code>CABLES.op</code> | The op to create an audio out port for |
| portName | <code>string</code> | The name of the port to be created |
| audioNode | <code>AudioNode</code> | The audio node to link to the port |


<br/><br/><br/>

<a id="CABLES.WEBAUDIO.createAudioParamInPort"></a>
#### WEBAUDIO.createAudioParamInPort(op, portName) ⇒ [<code>Port</code>](#CABLES.Port) \| <code>undefined</code>xx

Creates an audio param in port for the op with name portName.
The port accepts other audio nodes as signals as well as values (numbers)
When the port is disconnected it will disconnect the previous connected audio node
from the op's audio node and restore the number value set before.

**Kind**: static method of [<code>WEBAUDIO</code>](#CABLES.WEBAUDIO)  
**Returns**: [<code>Port</code>](#CABLES.Port) \| <code>undefined</code> - - The newly created port, which takes care of (dis-)connecting on its own, or `undefined` if there was an error  

| Param | Type | Description |
| --- | --- | --- |
| op | [<code>Op</code>](#CABLES.Op) | The operator to create an audio param input port for |
| portName | <code>string</code> | The name of the port to create |


<br/><br/><br/>

<a id="CABLES.WEBAUDIO.loadAudioFile"></a>
#### WEBAUDIO.loadAudioFile(patch, url, onFinished, onError)xx

Loads an audio file and updates the loading indicators when cables is run in the editor.

**Kind**: static method of [<code>WEBAUDIO</code>](#CABLES.WEBAUDIO)  
**See**: [https://developer.mozilla.org/de/docs/Web/API/AudioContext/decodeAudioData](https://developer.mozilla.org/de/docs/Web/API/AudioContext/decodeAudioData)  

| Param | Type | Description |
| --- | --- | --- |
| patch | [<code>Patch</code>](#CABLES.Patch) | The cables patch, when called from inside an op this is `op.patch` |
| url | <code>string</code> | The url of the audio file to load |
| onFinished | [<code>loadAudioFileFinishedCallback</code>](#loadAudioFileFinishedCallback) | The callback to be called when the loading is finished, passes the AudioBuffer |
| onError | [<code>loadAudioFileErrorCallback</code>](#loadAudioFileErrorCallback) | The callback when there was an error loading the file, the rror message is passed |


<br/><br/><br/>

<a id="CABLES.WEBAUDIO.isValidToneTime"></a>
#### WEBAUDIO.isValidToneTime(t) ⇒ <code>boolean</code>xx

Checks if the passed time is a valid time to be used in any of the Tone.js ops.

**Kind**: static method of [<code>WEBAUDIO</code>](#CABLES.WEBAUDIO)  
**Returns**: <code>boolean</code> - - True if time is valid, false if not  

| Param | Type | Description |
| --- | --- | --- |
| t | <code>string</code> \| <code>number</code> | The time to check |


<br/><br/><br/>

<a id="CABLES.WEBAUDIO.isValidToneNote"></a>
#### WEBAUDIO.isValidToneNote(note) ⇒ <code>boolean</code>xx

Checks if the passed note is a valid note to be used with Tone.js

**Kind**: static method of [<code>WEBAUDIO</code>](#CABLES.WEBAUDIO)  
**Returns**: <code>boolean</code> - - True if the note is a valid note, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| note | <code>string</code> | The note to be checked, e.g. `"C4"` |


<br/><br/><br/>

<a id="CABLES.uuid"></a>
### CABLES.uuid() ⇒ <code>Striug</code>xx

generate a UUID

**Kind**: static method of [<code>CABLES</code>](#CABLES)  
**Returns**: <code>Striug</code> - generated UUID  

<br/><br/><br/>

<a id="CABLES.simpleId"></a>
### CABLES.simpleId() ⇒ <code>Number</code>xx

generate a simple ID

**Kind**: static method of [<code>CABLES</code>](#CABLES)  
**Returns**: <code>Number</code> - new id  

<br/><br/><br/>

<a id="CABLES.smoothStep"></a>
### CABLES.smoothStep(value) ⇒ <code>Number</code>xx

smoothStep a value

**Kind**: static method of [<code>CABLES</code>](#CABLES)  
**Returns**: <code>Number</code> - smoothed value  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>Number</code> | value to be smoothed [0-1] |


<br/><br/><br/>

<a id="CABLES.smootherStep"></a>
### CABLES.smootherStep(value) ⇒ <code>Number</code>xx

smootherstep a value

**Kind**: static method of [<code>CABLES</code>](#CABLES)  
**Returns**: <code>Number</code> - smoothed value  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>Number</code> | value to be smoothed [0-1] |


<br/><br/><br/>

<a id="CABLES.map"></a>
### CABLES.map(value, oldMin, oldMax, newMin, newMax) ⇒ <code>Number</code>xx

map a value in a range to a value in another range

**Kind**: static method of [<code>CABLES</code>](#CABLES)  
**Returns**: <code>Number</code> - mapped value  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>Number</code> | value to be mapped |
| oldMin | <code>Number</code> | old range minimum value |
| oldMax | <code>Number</code> | old range maximum value |
| newMin | <code>Number</code> | new range minimum value |
| newMax | <code>Number</code> | new range maximum value |


<br/><br/><br/>

<a id="CABLES.cacheBust"></a>
### CABLES.cacheBust(url) ⇒ [<code>String</code>](#String)xx

append a unique/random parameter to a url, so the browser is forced to reload the file, even if its cached

**Kind**: static method of [<code>CABLES</code>](#CABLES)  
**Returns**: [<code>String</code>](#String) - url with cachebuster parameter  

| Param | Type |
| --- | --- |
| url | [<code>String</code>](#String) | 


<br/><br/><br/>

<a id="CABLES.patchConfig"></a>
### CABLES.patchConfig : <code>Object</code>xx

patch-config

**Kind**: static typedef of [<code>CABLES</code>](#CABLES)  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [prefixAssetPath] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | path to assets |
| [glCanvasId] | <code>string</code> | <code>&quot;&#x27;glcanvas&#x27;&quot;</code> | dom element id of canvas element |
| [onError] | <code>function</code> | <code></code> | called when an error occurs |
| [onFinishedLoading] | <code>function</code> | <code></code> | called when patch finished loading all assets |
| [onFirstFrameRendered] | <code>function</code> | <code></code> | called when patch rendered it's first frame |
| [glCanvasResizeToWindow] | <code>boolean</code> | <code>false</code> | resize canvas automatically to window size |
| [silent] | <code>boolean</code> | <code>false</code> |  |
| [fpsLimit] | <code>Number</code> | <code>0</code> | 0 for maximum possible frames per second |


<br/><br/><br/>

<a id="Math"></a>
## Math : <code>object</code>xx

**Kind**: global namespace  

* [Math](#Math) : <code>object</code>
    * _instance_
        * [.randomSeed](#Math+randomSeed) : <code>Number</code>
    * _static_
        * [.seededRandom(max, min)](#Math.seededRandom) ⇒ <code>Number</code>


<br/><br/><br/>

<a id="Math+randomSeed"></a>
### math.randomSeed : <code>Number</code>xx

set random seed for seededRandom()

**Kind**: instance property of [<code>Math</code>](#Math)  

<br/><br/><br/>

<a id="Math.seededRandom"></a>
### Math.seededRandom(max, min) ⇒ <code>Number</code>xx

generate a seeded random number

**Kind**: static method of [<code>Math</code>](#Math)  
**Returns**: <code>Number</code> - random value  

| Param | Type | Description |
| --- | --- | --- |
| max | <code>Number</code> | minimum possible random number |
| min | <code>Number</code> | maximum possible random number |


<br/><br/><br/>

<a id="String"></a>
## String : <code>object</code>xx

**Kind**: global namespace  

* [String](#String) : <code>object</code>
    * [.endl()](#String.endl) ⇒ <code>Number</code>
    * [.startsWith(prefix)](#String.startsWith) ⇒ <code>Boolean</code>
    * [.endsWith(suffix)](#String.endsWith) ⇒ <code>Boolean</code>


<br/><br/><br/>

<a id="String.endl"></a>
### String.endl() ⇒ <code>Number</code>xx

append a linebreak to a string

**Kind**: static method of [<code>String</code>](#String)  
**Returns**: <code>Number</code> - string with newline break appended ('\n')  

<br/><br/><br/>

<a id="String.startsWith"></a>
### String.startsWith(prefix) ⇒ <code>Boolean</code>xx

return true if string starts with prefix

**Kind**: static method of [<code>String</code>](#String)  

| Param | Type |
| --- | --- |
| prefix | [<code>String</code>](#String) | 


<br/><br/><br/>

<a id="String.endsWith"></a>
### String.endsWith(suffix) ⇒ <code>Boolean</code>xx

return true if string ends with suffix

**Kind**: static method of [<code>String</code>](#String)  

| Param | Type |
| --- | --- |
| suffix | [<code>String</code>](#String) | 


<br/><br/><br/>

<a id="loadAudioFileFinishedCallback"></a>
## loadAudioFileFinishedCallback : <code>function</code>xx

Callback when an audio file finished loading

**Kind**: global typedef  

<br/><br/><br/>

<a id="loadAudioFileErrorCallback"></a>
## loadAudioFileErrorCallback : <code>function</code>xx

Callback when a request to load an audio file did not succeed.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | The error which occured while loading the audio file |

