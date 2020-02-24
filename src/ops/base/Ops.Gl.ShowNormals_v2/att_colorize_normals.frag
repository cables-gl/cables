UNI vec4 inColor;

void main() {
    {{MODULE_BEGIN_FRAG}}
    vec4 col = inColor;

    {{MODULE_COLOR}}

    outColor = col;
}