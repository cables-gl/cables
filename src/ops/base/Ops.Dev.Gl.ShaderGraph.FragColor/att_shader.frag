void setColor(vec4 col)
{
    #ifdef SETCOLOR_ALPHA
        col.a=1.0;
    #endif
    {{MODULE_COLOR}}
    outColor=col;
}