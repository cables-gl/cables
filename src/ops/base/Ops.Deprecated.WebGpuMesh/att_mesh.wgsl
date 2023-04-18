struct VSUniforms
{
    modelMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    projMatrix: mat4x4<f32>,
};

struct FSUniforms
{
    color:vec3<f32>//,
    // lightDirection: vec3<f32>,
};

@group(0) @binding(0) var<uniform> vsUniforms: VSUniforms;
@group(0) @binding(1) var<uniform> fsUniforms: FSUniforms;



struct MyVSInput
{
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) texcoord: vec2<f32>,
};

struct MyVSOutput
{
    @builtin(position) position: vec4<f32>,
    @location(0) normal: vec3<f32>,
    @location(1) texcoord: vec2<f32>,
};

@vertex
fn myVSMain(v: MyVSInput) -> MyVSOutput
{
    var vsOut: MyVSOutput;
    var pos =vec4<f32>(v.position, 1.0);// vsUniforms.worldViewProjection * v.position;
    // vsOut.normal = (vsUniforms.worldInverseTranspose * vec4<f32>(v.normal, 0.0)).xyz;

    var mvMatrix=vsUniforms.viewMatrix * vsUniforms.modelMatrix;
    vsOut.position = vsUniforms.projMatrix * mvMatrix * pos;

    vsOut.normal = v.normal;
    vsOut.texcoord = v.texcoord;
    return vsOut;
}





// @group(0) @binding(2) var diffuseSampler: sampler;
// @group(0) @binding(3) var diffuseTexture: texture_2d<f32>;

@fragment
fn myFSMain(v: MyVSOutput) -> @location(0) vec4<f32>
{
    // var diffuseColor = textureSample(diffuseTexture, diffuseSampler, v.texcoord);
    // var a_normal = normalize(v.normal);
    // var l = dot(a_normal, fsUniforms.lightDirection) * 0.5 + 0.5;
    // return vec4<f32>(diffuseColor.rgb * l, diffuseColor.a);
    // return vec4<f32>(fsUniforms.color, 1.0);
    return vec4<f32>(v.normal.xyz+fsUniforms.color*0.001 , 1.0);
}

