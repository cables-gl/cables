float desaturate(vec3 col)
{
   return vec3(dot(vec3(0.2126,0.7152,0.0722), col)).r;

}