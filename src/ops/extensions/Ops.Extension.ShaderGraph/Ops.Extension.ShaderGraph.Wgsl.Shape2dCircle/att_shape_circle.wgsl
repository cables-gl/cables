fn shapeCircle(p: vec2<f32>,r:f32) -> f32
{
return step(length(p) - r,0.0);

}
