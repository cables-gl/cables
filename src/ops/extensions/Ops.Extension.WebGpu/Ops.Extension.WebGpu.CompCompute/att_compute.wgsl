///////////// custom code:222


struct Particle {
  position : vec3f,
  lifetime : f32,
  color    : vec4f,
  velocity : vec3f,
}

struct Particles
{
    particles : array<Particle>,
}


// fn rand(co:vec2<f32>)  :float
fn rand( co: vec2<f32>) -> f32
{
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

@compute @workgroup_size(32)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>)
{
    //resultMatrix[global_id.x] = f32(global_id.x)/100.0/**/;

    resultMatrix[global_id.x] = (resultMatrix[global_id.x]+0.001*rand( vec2<f32>( f32(global_id.x), f32(global_id.x)+0.3)))%1.0;
}