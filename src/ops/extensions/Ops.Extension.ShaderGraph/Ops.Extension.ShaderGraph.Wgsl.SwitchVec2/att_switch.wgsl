fn myswitchvec2(index: f32,v0:vec2f,v1:vec2f,v2:vec2f,v3:vec2f,v4:vec2f,v5:vec2f,v6:vec2f,v7:vec2f) -> vec2f
{
  if(index==0.) {return v0;}
  if(index==1.) {return v1;}
  if(index==2.) {return v2;}
  if(index==3.) {return v3;}
  if(index==4.) {return v4;}
  if(index==5.) {return v5;}
  if(index==6.) {return v6;}
  if(index==7.) {return v7;}
  // if(index==8.) {return v8;}

    return vec2f(0.);
}
