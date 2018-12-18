UNI sampler2D tex;
UNI float exponent;
UNI float strength;
UNI vec2 texSize;
IN vec2 texCoord;

void main()
{
    vec4 center = texture(tex, texCoord);
    vec4 color = vec4(0.0);
    float total = 0.0;
    float pixels=4.0;
    for (float x = -pixels; x <= pixels; x += 1.0) {
        for (float y = -pixels; y <= pixels; y += 1.0) {
            vec4 smpl = texture(tex, texCoord + vec2(x, y) / texSize);
            float weight = 1.0 - abs(dot(smpl.rgb - center.rgb, vec3(0.25)));
            weight = pow(weight, (1.0-exponent)*50.0);
            color += smpl * weight;
            total += weight;
        }
    }
    outColor = color / total;
}
