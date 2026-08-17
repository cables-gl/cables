fn rand(seed: f32) -> f32
{
  return (fract(sin(seed) * 43758.5453123)-0.5)*2.0;
}
