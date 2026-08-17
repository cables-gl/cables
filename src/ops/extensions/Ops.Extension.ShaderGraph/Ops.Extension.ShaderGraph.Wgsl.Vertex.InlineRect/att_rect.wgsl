
fn rectangle( VertexIndex:u32, size:vec2<f32>,mulmat:bool)->VertexOutput
{
  var vout:VertexOutput;

  var vpos = array<vec2f, 6>(
      vec2(-size.x, -size.y),
      vec2( size.x, -size.y),
      vec2(-size.x, size.y),

      vec2( size.x,  size.y),
      vec2(-size.x,  size.y),
      vec2( size.x, -size.y)
  );

  var vuv = array<vec2f, 6>(
      vec2(0.0, 1.0),
      vec2(1.0, 1.0),
      vec2(0.0, 0.0),

      vec2(1.0, 0.0),
      vec2(0.0, 0.0),
      vec2(1.0, 1.0)
  );

  if(mulmat)
  {
    vout.position=cables.mvp*vec4f(vpos[VertexIndex].x,vpos[VertexIndex].y,0.0,1.0);
  } else {
    vout.position=vec4f(vpos[VertexIndex].x,vpos[VertexIndex].y,0.0,1.0);
  }

  vout.uv=vuv[VertexIndex];
  return vout;
}
