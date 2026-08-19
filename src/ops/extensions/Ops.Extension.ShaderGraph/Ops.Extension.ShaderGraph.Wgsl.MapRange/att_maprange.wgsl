fn rand(value: f32,min1:f32,max1:f32,min2:f32,max2:f32) -> f32
{
      var v=min2 + (value - min1) * (max2 - min2) / (max1 - min1);

v=clamp(v,min2,max2);
return v;
}

