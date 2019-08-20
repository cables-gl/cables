IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float aspect;

UNI bool mirrorX;
UNI bool mirrorY;

UNI float xPos;
UNI float yPos;

UNI bool invertColor;
UNI bool fillShape;

UNI float width;
UNI float height;
UNI float lineThickness;

UNI float rotate;

UNI float r;
UNI float g;
UNI float b;
UNI float a;

{{CGL.BLENDMODES}}

#define PI 3.14159265
#define TAU (2.0*PI)

void pR(inout vec2 p, float a)
{
	p = cos(a)*p + sin(a)*vec2(p.y, -p.x);
}

float sdCircle( vec2 p, float r )
{
  return length(p) - r;
}

float sdBox( in vec2 p, in vec2 b )
{
    vec2 d = abs(p)-b;
    return length(max(d,vec2(0))) + min(max(d.x,d.y),0.0);
}

float sdEquilateralTriangle( in vec2 p , in float size )
{
    const float k = sqrt(3.0);
    p/= vec2(size);
    p.x = abs(p.x) - 1.0;
    p.y = -p.y + 1.0/k;
    if( p.x + k*p.y > 0.0 ) p = vec2( p.x - k*p.y, -k*p.x - p.y )/2.0;
    p.x -= clamp( p.x, -2.0, 0.0 );
    return (-length(p)*sign(p.y))*size;
}

float sdTriangleIsosceles( in vec2 p, in vec2 q )
{

    p.y +=0.5;
    p.x = abs(p.x);

    vec2 a = p - q*clamp( dot(p,q)/dot(q,q), 0.0, 1.0 );
    vec2 b = p - q*vec2( clamp( p.x/q.x, 0.0, 1.0 ), 1.0 );
    float s = -sign( q.y );
    vec2 d = min( vec2( dot(a,a), s*(p.x*q.y-p.y*q.x) ),
                  vec2( dot(b,b), s*(p.y-q.y)  ));

    return -sqrt(d.x)*sign(d.y);
}

float ndot(vec2 a, vec2 b ) { return a.x*b.x - a.y*b.y; }

float sdRhombus( in vec2 p, in vec2 b )
{
    vec2 q = abs(p);
    float h = clamp((-2.0*ndot(q,b)+ndot(b,b))/dot(b,b),-1.0,1.0);
    float d = length( q - 0.5*b*vec2(1.0-h,1.0+h) );
    return d * sign( q.x*b.y + q.y*b.x - b.x*b.y );
}

float sdPentagon( in vec2 p, in float r )
{
    const vec3 k = vec3(0.809016994,0.587785252,0.726542528);
    p.x = abs(p.x);
    p -= 2.0*min(dot(vec2(-k.x,k.y),p),0.0)*vec2(-k.x,k.y);
    p -= 2.0*min(dot(vec2( k.x,k.y),p),0.0)*vec2( k.x,k.y);
    p -= vec2(clamp(p.x,-r*k.z,r*k.z),r);
    return length(p)*sign(p.y);
}

float sdHexagon( in vec2 p, in float r )
{
    const vec3 k = vec3(-0.866025404,0.5,0.577350269);
    p = abs(p);
    p -= 2.0*min(dot(k.xy,p),0.0)*k.xy;
    p -= vec2(clamp(p.x, -k.z*r, k.z*r), r);
    return length(p)*sign(p.y);
}

float sdOctogon( in vec2 p, in float r )
{
    const vec3 k = vec3(-0.9238795325, 0.3826834323, 0.4142135623 );
    p = abs(p);
    p -= 2.0*min(dot(vec2( k.x,k.y),p),0.0)*vec2( k.x,k.y);
    p -= 2.0*min(dot(vec2(-k.x,k.y),p),0.0)*vec2(-k.x,k.y);
    p -= vec2(clamp(p.x, -k.z*r, k.z*r), r);
    return length(p)*sign(p.y);
}

float sdHexagram( in vec2 p, in float r )
{
    const vec4 k=vec4(-0.5,0.8660254038,0.5773502692,1.7320508076);
    p = abs(p);
    p -= 2.0*min(dot(k.xy,p),0.0)*k.xy;
    p -= 2.0*min(dot(k.yx,p),0.0)*k.yx;
    p -= vec2(clamp(p.x,r*k.z,r*k.w),r);
    return length(p)*sign(p.y);
}

void main()
{
    vec2 p = texCoord-0.5;
    p.y/=aspect;

    p *= 2.0;

    float d =0.0;

    if(mirrorX)p.x = abs(p.x);
    if(mirrorY)p.y = abs(p.y);

    p -= vec2(xPos,yPos);

    pR(p,rotate * (TAU) + PI);

    #ifdef IS_CIRCLE

        d = sdCircle(p,width);
    #endif

    #ifdef IS_EQUI_TRIANGLE
        d = sdEquilateralTriangle(p,width);
    #endif

    #ifdef IS_ISO_TRIANGLE
        d = sdTriangleIsosceles(p,vec2(width,height));
    #endif

    #ifdef IS_BOX
        d = sdBox(p,vec2(width,height));
    #endif

    #ifdef IS_RHOMBUS
        d = sdRhombus(p,vec2(width,height));
    #endif

    #ifdef IS_PENTAGON
        d = sdPentagon(p,width);
    #endif

    #ifdef IS_HEXAGON
        d = sdHexagon(p,width);
    #endif

    #ifdef IS_OCTOGON
        d = sdOctogon(p,width);
    #endif

    #ifdef IS_HEXAGRAM
        d = sdHexagram(p*2.0,width);
    #endif

    if (fillShape == false)
    {
        d = abs(d)-abs(lineThickness*0.01);
    }
    if(invertColor)
    {
        d = sign(d);
    }
    else
    {
        d = 1.0 - sign(d);
    }

    d = clamp(0.0,1.0,d);

    //blend section
    vec4 col = vec4(vec4(r,g,b,a)) ;
    //original texture
    vec4 base = texture(tex,texCoord);
    //blend stuff
    outColor = cgl_blend(base,col,d*amount);
    // outColor.rgb=vec3(d);
}