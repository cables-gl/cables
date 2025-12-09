struct VSUniforms
{
    modelMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    projMatrix: mat4x4<f32>,
    normalMatrix: mat4x4<f32>
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
    @location(1) attrCol: vec4<f32>,
};

////////////////////////////////////

@vertex
fn myVSMain(v: MyVSInput) -> MyVSOutput
{
    var vsOut: MyVSOutput;
    var pos =vec4<f32>(v.position, 1.0);

    var mvMatrix=uniVert.viewMatrix * uniVert.modelMatrix;
    vsOut.position = uniVert.projMatrix * mvMatrix * pos;

    #ifdef SHOW_POS
        vsOut.attrCol = vec4f(pos.xyz,1.0);
    #endif
    #ifdef SHOW_NORMAL_MAT
        vsOut.attrCol =  (vec4f(v.normal,0.0)*uniVert.normalMatrix) ;
    #endif
    #ifdef SHOW_NORMALS
        vsOut.attrCol = vec4f(v.normal,1.0);
    #endif
    #ifdef SHOW_TEXCOORDS
        vsOut.attrCol = vec4f(v.texcoord,0.0,1.0);
    #endif

    return vsOut;
}

///////////////////////////////////////

@fragment
fn myFSMain
    (
        @builtin(front_facing) is_front: bool,
        v: MyVSOutput
    ) -> @location(0) vec4<f32>
{
    return v.attrCol;
}

