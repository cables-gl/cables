UNI float MOD_amount;
UNI vec2 MOD_range;
UNI mat4 MOD_transMatrix;
UNI mat4 MOD_invTransMatrix;

void MOD_bendDistort(inout vec3 pos, inout vec3 norm)
{
    pos = (MOD_transMatrix * vec4(pos, 1.0)).xyz;
    norm = (vec4(norm, 0.0) * MOD_invTransMatrix).xyz;

    float PI = 3.14159265;
    if (abs(MOD_amount) > 1e-5) {
        float bendAngle = MOD_amount;
        float radius = 1.0 / bendAngle;

        float d = clamp(pos.x, MOD_range.x, MOD_range.y);
        float th = PI * 0.5 + (bendAngle * d);
        float s = sin(th);
        float c = cos(th);
        pos.xy = vec2(s * (pos.x - d) - c * (radius + pos.y),
                      c * (pos.x - d) + s * (radius + pos.y) - radius);
        norm.xy = vec2(s * norm.x - c * norm.y,
                       c * norm.x + s * norm.y);
    }

    pos = (MOD_invTransMatrix * vec4(pos, 1.0)).xyz;
    norm = (vec4(norm, 0.0) * MOD_transMatrix).xyz;
}
