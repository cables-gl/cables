
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
    var pos =vec4<f32>(v.position, 1.0);

    var mvMatrix=uniVert.viewMatrix * uniVert.modelMatrix;
    vsOut.position = uniVert.projMatrix * mvMatrix * pos;

    vsOut.normal = v.normal;
    vsOut.texcoord = v.texcoord;
    return vsOut;
}

@fragment
fn myFSMain(v: MyVSOutput) -> @location(0) vec4<f32>
{
    return vec4<f32>(.5,.5,.5,1.0);
}

