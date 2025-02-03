


struct MyVSInput
{
    @location(0) position: vec3f,
    @location(1) normal: vec3f,
    @location(2) texCoord: vec2f,
};

struct MyVSOutput
{
    @builtin(position) position: vec4f,
    @location(0) normal: vec3f,
    @location(1) texCoord: vec2f,
    @location(2) @interpolate(flat) instIdx: u32,
};

@vertex
fn myVSMain(
    v: MyVSInput,
    @builtin(instance_index) instIdx: u32,
) -> MyVSOutput
{
    var vsOut: MyVSOutput;
    var pos=vec4f(v.position, 1.0);

    var modelMatrix=vsUniforms.modelMatrix;

    #ifdef INSTANCING
        modelMatrix[3][0]+=arr[instIdx].x;
        modelMatrix[3][1]+=arr[instIdx].y;
        modelMatrix[3][2]+=arr[instIdx].z;
    #endif

    var modelViewMatrix=vsUniforms.viewMatrix * modelMatrix;


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

    vsOut.position = vsUniforms.projMatrix * modelViewMatrix * pos;
    vsOut.normal = v.normal;
    vsOut.texCoord = v.texCoord;
    vsOut.instIdx=instIdx;
    return vsOut;
}

@fragment
fn myFSMain
    (
        @builtin(front_facing) is_front: bool,
        v: MyVSOutput
    ) -> @location(0) vec4f
{

    var col:vec4f=fsUniforms.color;

    var tc=v.texCoord;
    tc*=fsUniforms.texTransform.xy;
    tc+=fsUniforms.texTransform.zw;

    #ifdef HAS_TEXTURE
        // tc=fract(tc); // fake repeat
        col = textureSample(ourTexture,ourSampler, tc);

        #ifdef COLORIZE_TEXTURE
            col*=fsUniforms.color;
        #endif

    #endif


    #ifdef HAS_MASK_TEXTURE
        var mask = textureSample(ourTextureMask,ourSampler, tc);
        if(mask.r<=0.0001)
        {
            discard;
        }

    #endif



    if(v.instIdx==0){
        // col=vec4(1.0,0.0,0.0,1.0);
    }

    {{MODULE_COLOR}}

    return col;//+fsUniforms.color+vec4f(v.texCoord,1.0,1.0);
    // return vec4f(v.texCoord,0.0,1.0);
    // return vec4f(v.normal,1.0);

    // if(!is_front)
    // {
    //     return fsUniforms.backColor+texCol;
    // }
    // return fsUniforms.color+texCol;
}

