
struct MyVSInput
{
    @location(0) position: vec3f,
    @location(1) normal: vec3f,
    @location(2) texCoord: vec2f,
};

struct VertexOutput
{
    @builtin(position) position: vec4f,
    @location(0) normal: vec3f,
    @location(1) texCoord: vec2f,
    @location(2) @interpolate(flat) instIdx: u32,
    {{VERTEX_OUTPUT 3}}
};

@vertex
fn myVSMain(
    v: MyVSInput,
    @builtin(instance_index) instIdx: u32,
) -> VertexOutput
{
    var vertexOut: VertexOutput;
    var pos=vec4f(v.position, 1.0);

    var modelMatrix=uniVert.modelMatrix;

    #ifdef INSTANCING
        modelMatrix[3][0]+=arr[instIdx*3+0];
        modelMatrix[3][1]+=arr[instIdx*3+1];
        modelMatrix[3][2]+=arr[instIdx*3+2];
    #endif

    var modelViewMatrix=uniVert.viewMatrix * modelMatrix;

    #ifdef BILLBOARDING
        modelViewMatrix[0][0] = 1.0;
        modelViewMatrix[0][1] = 0.0;
        modelViewMatrix[0][2] = 0.0;

        // #ifndef BILLBOARDING_CYLINDRIC
            modelViewMatrix[1][0] = 0.0;
            modelViewMatrix[1][1] = 1.0;
            modelViewMatrix[1][2] = 0.0;
        // #endif

        modelViewMatrix[2][0] = 0.0;
        modelViewMatrix[2][1] = 0.0;
        modelViewMatrix[2][2] = 1.0;
    #endif

    {{MODULE_VERTEX_POSITION}}


//   #ifdef MOD_SPACE_MODEL
//       MOD_vertPos=pos;
//   #endif

//   #ifdef MOD_SPACE_WORLD
//       MOD_vertPos=modelMatrix*pos;
//   #endif

//   #ifdef MOD_SPACE_UV
//       MOD_vertPos=vec4(v.texCoord.x, v.texCoord.y, 0.0, 1.0);
//   #endif

    vertexOut.position = uniVert.projMatrix * modelViewMatrix * pos;
    vertexOut.normal = v.normal;
    vertexOut.texCoord = v.texCoord;
    vertexOut.instIdx=instIdx;
    return vertexOut;
}

@fragment
fn myFSMain
    (
        @builtin(front_facing) is_front: bool,
        vertexOut: VertexOutput
    ) -> @location(0) vec4f
{

    var col:vec4f=uniFrag.color;

    var tc=vertexOut.texCoord;
    tc*=uniFrag.texTransform.xy;
    tc+=uniFrag.texTransform.zw;

    #ifdef HAS_TEXTURE
        // tc=fract(tc); // fake repeat
        col = textureSample(ourTexture,ourSampler, tc);

        #ifdef COLORIZE_TEXTURE
            col*=uniFrag.color;
        #endif
    #endif

    #ifdef HAS_MASK_TEXTURE
        var mask = textureSample(ourTextureMask,ourSampler, tc);
        if(mask.r<=0.0001)
        {
            discard;
        }
        col.a=mask.r;
    #endif
col.a=1.0;
    {{MODULE_COLOR}}

    return col;
}
