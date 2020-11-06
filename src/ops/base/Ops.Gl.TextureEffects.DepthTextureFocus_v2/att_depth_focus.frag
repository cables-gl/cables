IN vec2 texCoord;
UNI sampler2D image;
UNI float nearPlane;
UNI float farPlane;
UNI float focus; // center
UNI float width;


void main()
{
    float depthFromTexture = texture(image,texCoord).r;

    float z_viewSpace = (nearPlane * farPlane) / (farPlane - depthFromTexture * (farPlane - nearPlane));
    z_viewSpace = abs(z_viewSpace - (focus));
    z_viewSpace = smoothstep(0.0, width, z_viewSpace);

    #ifndef INVERT
        z_viewSpace = 1. - z_viewSpace;
    #endif

    outColor = vec4(vec3(z_viewSpace), 1.);
}