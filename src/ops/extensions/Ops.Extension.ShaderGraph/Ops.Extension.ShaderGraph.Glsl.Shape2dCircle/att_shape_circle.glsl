float shapeCircle(vec2 p,float r,float border)
{
  float a=0.;
  a=(length(p) - r);

  float aa = fwidth(a);
  float alpha = 1.0 - smoothstep(-aa, aa, a);


  if(border>0.0)
  {
    float b=length(p) - (r-border);
    float bb = fwidth(a);
    alpha  *= smoothstep(-bb, bb, b);
  }

  return alpha;
}
