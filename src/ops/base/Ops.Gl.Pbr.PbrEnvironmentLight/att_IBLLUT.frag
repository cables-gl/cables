precision highp float;
precision highp int;
precision highp sampler2D;

#ifndef WEBGL1
#define NUM_SAMPLES 1024u
#else
#define NUM_SAMPLES 1024
#endif
#define PI 3.14159265358

IN vec3 P;
{{MODULES_HEAD}}

// from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/ShadersInclude/hdrFilteringFunctions.fx
// modified to use different syntax for a number of variables
#if NUM_SAMPLES > 0
    #ifndef WEBGL1
        // https://learnopengl.com/PBR/IBL/Specular-IBL
        // Hammersley
        float radicalInverse_VdC(uint bits)
        {
            bits = (bits << 16u) | (bits >> 16u);
            bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
            bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
            bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
            bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
            return float(bits) * 2.3283064365386963e-10; // / 0x100000000
        }

        vec2 hammersley(uint i, uint N)
        {
            return vec2(float(i)/float(N), radicalInverse_VdC(i));
        }
    #else
        float vanDerCorpus(int n, int base)
        {
            float invBase = 1.0 / float(base);
            float denom   = 1.0;
            float result  = 0.0;

            for(int i = 0; i < 32; ++i)
            {
                if(n > 0)
                {
                    denom   = mod(float(n), 2.0);
                    result += denom * invBase;
                    invBase = invBase / 2.0;
                    n       = int(float(n) / 2.0);
                }
            }

            return result;
        }

        vec2 hammersley(int i, int N)
        {
            return vec2(float(i)/float(N), vanDerCorpus(i, 2));
        }
    #endif

	// from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/ShadersInclude/importanceSampling.fx
	vec3 hemisphereImportanceSampleDggx(vec2 u, float a) {
		// pdf = D(a) * cosTheta
		float phi = 2. * PI * u.x;

		// NOTE: (aa-1) == (a-1)(a+1) produces better fp accuracy
		float cosTheta2 = (1. - u.y) / (1. + (a + 1.) * ((a - 1.) * u.y));
		float cosTheta = sqrt(cosTheta2);
		float sinTheta = sqrt(1. - cosTheta2);

		return vec3(sinTheta * cos(phi), sinTheta * sin(phi), cosTheta);
	}

	// from https://google.github.io/filament/Filament.md.html#toc9.5
	// modified to use different syntax for a number of variables
    const float NUM_SAMPLES_FLOAT = float(NUM_SAMPLES);
    const float NUM_SAMPLES_FLOAT_INVERSED = 1. / NUM_SAMPLES_FLOAT;
    const float NUM_SAMPLES_FLOAT_INVERSED4 = 4. / NUM_SAMPLES_FLOAT;

    float Visibility(float NdotV, float NdotL, float alphaG)
    {
        // from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/ShadersInclude/pbrBRDFFunctions.fx
        #ifdef WEBGL1
            // Appply simplification as all squared root terms are below 1 and squared
            float GGXV = NdotL * (NdotV * (1.0 - alphaG) + alphaG);
            float GGXL = NdotV * (NdotL * (1.0 - alphaG) + alphaG);
            return 0.5 / (GGXV + GGXL);
        #else
            float a2 = alphaG * alphaG;
            float GGXV = NdotL * sqrt(NdotV * (NdotV - a2 * NdotV) + a2);
            float GGXL = NdotV * sqrt(NdotL * (NdotL - a2 * NdotL) + a2);
            return 0.5 / (GGXV + GGXL);
        #endif
    }

	void main()
	{
	    // actual implementation (not documentation) here: https://github.com/google/filament/blob/94ff2ea6b1e39d909e9066459f2ce8c2942eb876/libs/ibl/src/CubemapIBL.cpp
		{{MODULE_BEGIN_FRAG}}
		float NoV = P.x;
		float a   = P.y;

		vec3 V;
		V.x = sqrt(1.0 - NoV*NoV);
		V.y = 0.0;
		V.z = NoV;

		vec2 r = vec2(0.0);

        #ifndef WEBGL1
        for(uint i = 0u; i < NUM_SAMPLES; i++)
        #else
        for(int i = 0; i < NUM_SAMPLES; i++)
        #endif
        {
			vec2 Xi = hammersley(i, NUM_SAMPLES);
			vec3 H  = hemisphereImportanceSampleDggx(Xi, a);
			vec3 L  = 2.0 * dot(V, H) * H - V;

			float VoH = clamp(dot(V, H), 0.0, 1.0);
			float NoL = clamp(L.z, 0.0, 1.0);
			float NoH = clamp(H.z, 0.0, 1.0);

			if (NoL > 0.0) {
				float Gv = Visibility(NoV, NoL, a) * NoL * (VoH / NoH);
				float Fc = pow(1.0 - VoH, 5.0);

				// modified for multiscattering https://google.github.io/filament/Filament.md.html#toc5.3.4.7
			    r.x += Gv * Fc;
				r.y += Gv;
			}
		}
		r *= NUM_SAMPLES_FLOAT_INVERSED4;

		{{MODULE_COLOR}}
		outColor = vec4(r.x, r.y, 0.0, 1.0);
	}
#endif
