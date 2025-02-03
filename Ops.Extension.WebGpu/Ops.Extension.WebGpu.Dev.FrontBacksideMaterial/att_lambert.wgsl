struct VSUniforms
{
    modelMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    projMatrix: mat4x4<f32>,
};

struct LambertProperties
{
    color:vec4<f32>,
    backColor:vec4<f32>
};


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
    var pos=vec4<f32>(v.position, 1.0);

    var mvMatrix=vsUniforms.viewMatrix * vsUniforms.modelMatrix;
    vsOut.position = vsUniforms.projMatrix * mvMatrix * pos;

    vsOut.normal = v.normal;
    vsOut.texcoord = v.texcoord;
    return vsOut;
}

@fragment
fn myFSMain
    (
        @builtin(front_facing) is_front: bool,
        v: MyVSOutput
    ) -> @location(0) vec4<f32>
{

    if(!is_front)
    {
        return fsUniforms.backColor+vec4f(0.1);
    }
    return fsUniforms.color+vec4f(0.1);
}

