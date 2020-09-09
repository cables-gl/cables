# Shadertoy

Go to this [example page](https://cables.gl/p/5f4cbae9f131bc0ec30591da) to see a basic setup of shadertoy in cables.
Youtube tutorial [porting shadertoy to cables part 01](https://youtu.be/j_ins4RW0c8)

Porting shaders from shadertoy isn't that difficult once you know the basics.
The main ops that you'll need are:
- [custom shader op](https://cables.gl/op/Ops.Gl.Shader.CustomShader_v2)
- [shader2Texture op](https://cables.gl/op/Ops.Gl.Shader.Shader2Texture)

standard glsl in [shadertoy](https://www.shadertoy.com/) and the equivalent in cables is:
```javascript
fragCoord.xy                                //pixel coordinates in shadertoy
gl_FragCoord.xy                             //pixel coordinates in cables

vec2 uv =  fragCoord/iResolution.xy;        // normalized pixel co-ordinates from 0-1 on shadertoy
IN vec2 texcoord                            // normalized pixel co-ordinates from 0-1 in cables,already created
```
The uniforms on [shadertoy](https://www.shadertoy.com/) and their equivalent in cables are as follows:

```javascript
uniform vec3      iResolution;              // viewport resolution (in pixels)
UNI vec3          iResolution;              // get width and height output from mainloop,canvasinfo for aspect ratio/z

uniform float     iTime;                    // shader playback time (in seconds)
UNI float         iTime;                    // Use the output of the timer op

uniform float     iTimeDelta;               // render time (in seconds)
UNI float         iTimeDelta;               // use the output of the TimeDelta op

uniform int       iFrame;                   // shader playback frame
UNI int           iFrame;                   // connect trigger counter to mainloop output

uniform float     iChannelTime[4];          // channel playback time (in seconds)
UNI float         iChannelTime0;            // get the current playtime from the relevant media op

uniform vec3      iChannelResolution[4];    // channel resolution (in pixels)
UNI vec3          iChannelResolution0..3;   // channel resolution (in pixels)

uniform samplerXX iChannel0..3;             // input channel. XX = 2D/Cube
UNI sampler2D     iChannel0..3;             // Creates a texture input which can be used

uniform vec4      iDate;                    // (year, month, day, time in seconds)
UNI vec4          iDate;                    // (year, month, day, time in seconds)

uniform float     iSampleRate;              // sound sample rate (i.e., 44100)
UNI float         iSampleRate;              // Use the audiobuffer op to access this

uniform vec4      iMouse;                   // mouse pixel coords. xy: current (if MLB down), zw: click
UNI vec4          iMouse                    // use mouse op. see example patch for in depth explanation.
```



