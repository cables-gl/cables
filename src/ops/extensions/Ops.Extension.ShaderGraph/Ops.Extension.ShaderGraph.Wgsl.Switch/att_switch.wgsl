fn myswitch(index: f32,v0:f32,v1:f32,v2:f32,v3:f32,v4:f32,v5:f32,v6:f32,v7:f32) -> f32
{
  if(index>=0.&&index<=1.) {return v0;}
  if(index>=1.&&index<=2.) {return v1;}
  if(index>=2.&&index<=3.) {return v2;}
  if(index>=3.&&index<=4.) {return v3;}
  if(index>=4.&&index<=5.) {return v4;}
  if(index>=5.&&index<=6.) {return v5;}
  if(index>=6.&&index<=7.) {return v6;}
  if(index>=7.&&index<=8.) {return v7;}
  // if(index==8.) {return v8;}

    return 0.;
}
