float maprange(float value,float min1,float max1,float min2,float max2)
{
  float v=min2 + (value - min1) * (max2 - min2) / (max1 - min1);

  v=clamp(v,min2,max2);
  return v;
}

