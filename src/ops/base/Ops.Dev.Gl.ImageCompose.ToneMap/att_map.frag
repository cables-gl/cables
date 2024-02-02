
IN vec2 texCoord;
UNI sampler2D tex;

UNI float adjust;
UNI float gamma;


float lum(vec3 col)
{
    return dot(vec3(0.2126,0.7152,0.0722), col );
}


////////////////////////////////////
/// hej

vec3 tonemap_hej(vec3 colour)
{

    vec3 X = max(vec3(0.0, 0.0, 0.0), colour - 0.004);
    vec3 retColor = (X * (6.2 * X + 0.5)) / (X * (6.2 * X + 1.7) + 0.06);

    return retColor * retColor;
}


////////////////////////////////////
/// reinhard

vec3 reinhard(vec3 colour)
{
    float lum = lum(colour.rgb);
    float lumTm = lum * adjust;
    float scale = lumTm / (1.0 + lumTm);

    colour *= scale / lum;
    return colour;

}

////////////////////////////////////
/// uncharted

vec3 tonemap_Uncharted2(vec3 x)
{
    x *= 16.0;
    const float A = 0.15;
    const float B = 0.50;
    const float C = 0.10;
    const float D = 0.20;
    const float E = 0.02;
    const float F = 0.30;

    return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
}

/////////////////////////////////////
/// linear

vec3 tonemap_photographic(vec3 texColor)
{

    return  vec3(1.0, 1.0, 1.0) - exp2(-adjust * texColor);
}

/////////////////////////////////////
/// tanh

vec3 tonemap_tanh(vec3 x)
{
    x = clamp(x, -40.0, 40.0);
    return (exp(x) - exp(-x)) / (exp(x) + exp(-x));
}

////////////////////////////////////
/// ACES


vec3 aces_tonemap(vec3 color){
	mat3 m1 = mat3(
        0.59719, 0.07600, 0.02840,
        0.35458, 0.90834, 0.13383,
        0.04823, 0.01566, 0.83777
	);
	mat3 m2 = mat3(
        1.60475, -0.10208, -0.00327,
        -0.53108,  1.10813, -0.07276,
        -0.07367, -0.00605,  1.07602
	);
	vec3 v = m1 * color;
	vec3 a = v * (v + 0.0245786) - 0.000090537;
	vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
// 	return pow(clamp(m2 * (a / b), 0.0, 1.0), vec3(1.0 / 2.2));
	return clamp(m2 * (a / b), 0.0, 1.0);
}

//////////////////////////////////
/// UNREAL

vec3 tonemap_Unreal(vec3 x)
{
    // Unreal 3, Documentation: "Color Grading"
    // Adapted to be close to Tonemap_ACES, with similar range
    // Gamma 2.2 correction is baked in, don't use with sRGB conversion!
    return x / (x + 0.155) * 1.019;
}

////////////////////////////////
/// AGX

#define AGX_LOOK 0

// Mean error^2: 3.6705141e-06
vec3 agxDefaultContrastApprox(vec3 x) {
  vec3 x2 = x * x;
  vec3 x4 = x2 * x2;

  return + 15.5     * x4 * x2
         - 40.14    * x4 * x
         + 31.96    * x4
         - 6.868    * x2 * x
         + 0.4298   * x2
         + 0.1191   * x
         - 0.00232;
}

vec3 agx(vec3 val) {
  const mat3 agx_mat = mat3(
    0.842479062253094, 0.0423282422610123, 0.0423756549057051,
    0.0784335999999992,  0.878468636469772,  0.0784336,
    0.0792237451477643, 0.0791661274605434, 0.879142973793104);

  const float min_ev = -12.47393f;
  const float max_ev = 4.026069f;

  // Input transform (inset)
  val = agx_mat * val;

  // Log2 space encoding
  val = clamp(log2(val), min_ev, max_ev);
  val = (val - min_ev) / (max_ev - min_ev);

  // Apply sigmoid function approximation
  val = agxDefaultContrastApprox(val);

  return val;
}

vec3 agxEotf(vec3 val) {
  const mat3 agx_mat_inv = mat3(
    1.19687900512017, -0.0528968517574562, -0.0529716355144438,
    -0.0980208811401368, 1.15190312990417, -0.0980434501171241,
    -0.0990297440797205, -0.0989611768448433, 1.15107367264116);

  // Inverse input transform (outset)
  val = agx_mat_inv * val;

  // sRGB IEC 61966-2-1 2.2 Exponent Reference EOTF Display
  // NOTE: We're linearizing the output here. Comment/adjust when
  // *not* using a sRGB render target
  val = pow(val, vec3(2.2));

  return val;
}

vec3 agxLook(vec3 val) {
  const vec3 lw = vec3(0.2126, 0.7152, 0.0722);
  float luma = dot(val, lw);

  // Default
  vec3 offset = vec3(0.0);
  vec3 slope = vec3(1.0);
  vec3 power = vec3(1.0);
  float sat = 1.0;

#ifdef AGX_LOOK_1
  // Golden
  slope = vec3(1.0, 0.9, 0.5);
  power = vec3(0.8);
  sat = 0.8;
// #elif AGX_LOOK == 2
#endif
#ifdef AGX_LOOK_2
  // Punchy
  slope = vec3(1.0);
  power = vec3(1.35, 1.35, 1.35);
  sat = 1.4;
#endif

  // ASC CDL
  val = pow(val * slope + offset, power);

  return luma + sat * (val - luma);
}

////////////////////////////////////////////
void main()
{
    vec4 col=vec4(1.0,0.0,0.0,1.0);
    col=texture(tex,texCoord);

    #ifdef DO_MAP
        #ifdef MAP_ACES
            col.rgb=aces_tonemap(col.rgb*adjust);
        #endif
        #ifdef MAP_AGX
            col.rgb=agxLook(col.rgb*adjust);
        #endif
        #ifdef MAP_UNCHARTED
            col.rgb=tonemap_Uncharted2(col.rgb*adjust);
        #endif
        #ifdef MAP_UNREAL
            col.rgb=tonemap_Unreal(col.rgb*adjust);
        #endif
        #ifdef MAP_TANH
            col.rgb=tonemap_tanh(col.rgb*adjust);
        #endif
        #ifdef MAP_REINHARD
            col.rgb=reinhard(col.rgb);
        #endif
        #ifdef MAP_PHOTO
            col.rgb=tonemap_photographic(col.rgb);
        #endif
        #ifdef MAP_HEJ
            col.rgb=tonemap_hej(col.rgb);
        #endif
    #endif

    #ifdef GAMMA_CORRECT
        col.rgb = pow(col.rgb, vec3(1.0/(gamma)));
    #endif



    outColor=col;
}