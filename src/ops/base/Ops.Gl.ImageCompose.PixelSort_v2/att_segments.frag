IN vec2 texCoord;

UNI sampler2D tex;
UNI float segmentLength;
UNI float thresholdLow;
UNI float thresholdHigh;

#ifndef RANK_PASS
    UNI sampler2D texRank;
#endif

#ifdef MASK
    UNI sampler2D texMask;
#endif

#ifdef GROUP
    UNI sampler2D texGroup;
#endif

#define MAX_SEGMENT_LENGTH 1024

ivec2 size;
ivec2 dir;
ivec2 lineStart;

float getValue(vec3 color)
{
    #ifdef SORT_R
        return color.r;
    #endif
    #ifdef SORT_G
        return color.g;
    #endif
    #ifdef SORT_B
        return color.b;
    #endif
    #ifdef SORT_LUM
        return dot(vec3(0.2126, 0.7152, 0.0722), color);
    #endif
}

float hash(float x)
{
    return fract(sin(x * 12.9898) * 43758.5453);
}

vec2 pixelToUv(ivec2 p)
{
    return (vec2(p) + 0.5) / vec2(size);
}

ivec2 linePixel(int i)
{
    return lineStart + dir * i;
}

float valueAt(int i)
{
    return getValue(texelFetch(tex, linePixel(i), 0).rgb);
}

bool isSortable(int i)
{
    float value = valueAt(i);
    if (value < thresholdLow || value > thresholdHigh) return false;

    #ifdef MASK
        if (texture(texMask, pixelToUv(linePixel(i))).r <= 0.0) return false;
    #endif

    return true;
}

bool isConnected(int a, int b)
{
    if (!isSortable(a) || !isSortable(b)) return false;

    #ifdef GROUP
        if (texture(texGroup, pixelToUv(linePixel(a))).r != texture(texGroup, pixelToUv(linePixel(b))).r) return false;
    #endif

    return true;
}

bool sortsBefore(float value, int index, float otherValue, int otherIndex)
{
    if (value != otherValue)
    {
        #ifdef INVERT
            return value < otherValue;
        #else
            return value > otherValue;
        #endif
    }
    return index < otherIndex;
}

void main()
{
    size = textureSize(tex, 0);
    ivec2 p = ivec2(gl_FragCoord.xy);

    dir = ivec2(1, 0);
    int index = p.x;
    int lineIndex = p.y;
    int lineLength = size.x;

    #ifdef STR_COLS
        dir = ivec2(0, 1);
        index = p.y;
        lineIndex = p.x;
        lineLength = size.y;
    #endif

    lineStart = p - dir * index;

    vec4 col = texelFetch(tex, p, 0);

    #ifdef RANK_PASS
        outColor = vec4(-1.0, 0.0, 0.0, 1.0);
    #else
        outColor = col;
    #endif

    if (!isSortable(index)) return;

    int blockLength = clamp(int(segmentLength), 1, MAX_SEGMENT_LENGTH);
    int blockOffset = 0;
    #ifdef STAGGER
        blockOffset = int(hash(float(lineIndex)) * float(blockLength));
    #endif

    int blockStart = ((index + blockOffset) / blockLength) * blockLength - blockOffset;
    int blockEnd = min(blockStart + blockLength, lineLength) - 1;
    blockStart = max(blockStart, 0);

    int segmentStart = index;
    for (int i = 0; i < MAX_SEGMENT_LENGTH; i++)
    {
        if (segmentStart <= blockStart || !isConnected(segmentStart - 1, segmentStart)) break;
        segmentStart--;
    }

    int segmentEnd = index;
    for (int i = 0; i < MAX_SEGMENT_LENGTH; i++)
    {
        if (segmentEnd >= blockEnd || !isConnected(segmentEnd, segmentEnd + 1)) break;
        segmentEnd++;
    }

    #ifdef RANK_PASS
        float value = getValue(col.rgb);
        int rank = 0;
        for (int i = 0; i < MAX_SEGMENT_LENGTH; i++)
        {
            int j = segmentStart + i;
            if (j > segmentEnd) break;
            if (j != index && sortsBefore(valueAt(j), j, value, index)) rank++;
        }
        outColor = vec4(float(rank), 0.0, 0.0, 1.0);
    #else
        int targetRank = index - segmentStart;
        for (int i = 0; i < MAX_SEGMENT_LENGTH; i++)
        {
            int j = segmentStart + i;
            if (j > segmentEnd) break;
            if (int(texelFetch(texRank, linePixel(j), 0).r + 0.5) == targetRank)
            {
                outColor = texelFetch(tex, linePixel(j), 0);
                break;
            }
        }

        #ifdef MASK
            outColor = mix(col, outColor, texture(texMask, pixelToUv(p)).r);
        #endif
    #endif
}
