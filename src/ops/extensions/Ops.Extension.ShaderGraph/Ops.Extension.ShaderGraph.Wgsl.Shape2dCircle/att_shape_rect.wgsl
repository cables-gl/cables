fn shapeRect(p: vec2<f32>,size:vec2<f32>) -> f32
{
  let d:vec2<f32>=abs(p)-size;
  let a:f32=length(max(d,vec2<f32>(0.0))) + min(max(d.x,d.y),0.0);
  return step(a,0.);
length(p) - r;

}
