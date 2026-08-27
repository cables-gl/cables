{{BINDINGS}}

{{HEADER}}

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
};

@fragment
fn main(in:VertexOutput) -> @location(0) vec4f
{
{{MAIN}}

return color;
}