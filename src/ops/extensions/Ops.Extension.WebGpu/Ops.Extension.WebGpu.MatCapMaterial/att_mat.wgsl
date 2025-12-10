// struct uniVert
// {
//     modelMatrix: mat4x4<f32>,
//     viewMatrix: mat4x4<f32>,
//     projMatrix: mat4x4<f32>,
//     normalMatrix: mat4x4<f32>,
// };

struct LambertProperties
{
    color:vec4f,
    texTransform:vec4f
};


struct MyVSInput
{
    @location(0) position: vec3f,
    @location(1) normal: vec3f,
    @location(2) texCoord: vec2<f32>,

};

struct MyVSOutput
{
    @builtin(position) position: vec4f,
    @location(0) normal: vec3f,
    @location(1) texCoord: vec2<f32>,
    @location(2) viewSpacePosition: vec3f,

};

@vertex
fn myVSMain(v: MyVSInput) -> MyVSOutput
{
    var vsOut: MyVSOutput;
    var pos=vec4f(v.position, 1.0);

    var mvMatrix=uniVert.viewMatrix * uniVert.modelMatrix;
    var mvPos:vec4f = (mvMatrix * pos);

    vsOut.position = uniVert.projMatrix * mvPos;

    vsOut.viewSpacePosition = normalize((mvMatrix * vec4f(v.position, 1.0)).xyz);
    vsOut.normal = normalize((vec4f(v.normal,0.0) * uniVert.normalMatrix).xyz);

    vsOut.texCoord = v.texCoord;
    return vsOut;
}

@fragment

fn myFSMain
    (
        @builtin(front_facing) is_front: bool,
        v: MyVSOutput
    ) -> @location(0) vec4f
{

    var col:vec4f=uniFrag.color;

    // var tc=v.texCoord;
    // tc*=uniFrag.texTransform.xy;
    // tc+=uniFrag.texTransform.zw;

    #ifdef HAS_TEXTURE
        var mcCoord:vec2f=getMatCapUV(v.viewSpacePosition, v.normal);
        col *= textureSample(ourTexture, ourSampler, mcCoord);
    #endif


    #ifdef HAS_TEXTURE_DIFFUSE
        var tc:vec2f=v.texCoord;
        tc*=uniFrag.texTransform.xy;
        tc+=uniFrag.texTransform.zw;
        col*=textureSample(texDiffuse, ourSampler, tc);
    #endif


    return col;
}

fn getMatCapUV( viewSpacePosition : vec3f, normal : vec3f ) -> vec2<f32>
{

	var cross_space:vec3f = cross(normalize(viewSpacePosition), normal); //
	var mat_space:vec2f = vec2f(cross_space.z, cross_space.x);
	mat_space *= vec2f(-0.5, -0.5);
	mat_space += vec2f(0.5, 0.5);
	return mat_space;
}
