fn shapeCircle(p: vec2<f32>,r:f32,border:f32) -> f32
{
  var a=0.;
  a=(length(p) - r);

  let aa = fwidth(a);
  var alpha = 1.0 - smoothstep(-aa, aa, a);


  if(border>0.0)
  {
    let b=length(p) - (r-border);
    let bb = fwidth(a);
    alpha  -= 1.-smoothstep(-bb, bb, b);
  }

  return alpha;
}
