vec2 rand(vec2 value,float min1,float max1,float min2,float max2)
{
  vec2 v=min2 + (value - min1) * (max2 - min2) / (max1 - min1);

  v=clamp(v,min2,max2);
  return v;
}

