fn shapeCircle(p: vec2<f32>,r:f32,border:f32) -> f32
{
if(border>0.0)
{return step(length(p) - r,0.0)-step(length(p) - (r-border),0.);
}else
{return step(length(p) - r,0.0);
}
}
