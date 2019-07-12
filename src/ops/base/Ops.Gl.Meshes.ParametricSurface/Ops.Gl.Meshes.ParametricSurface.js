/* presets for parametric surface */
const parametricBodies = [
            {
        title: 'Rectangle',
        xFunction: 'u',
        yFunction: 'v',
        zFunction: '0',
        uMin: 0,
        uMax: 2,
        vMin: 0,
        vMax: 1,
        isPiU: false,
        isPiV: false,
        uSegments: 24,
        vSegments: 24,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        displaceU: -1,
        displaceV: -0.5
    },
    {
        title: 'Archimedic Spiral',
        xFunction: 'u*cos(u)',
        yFunction: 'v',
        zFunction: 'u*sin(u)',

        uMin: 0,
        uMax: 50,
        vMin: 0,
        vMax: 1,
        isPiU: false,
        isPiV: false,

        uSegments: 300,
        vSegments: 20,

        scaleX: 0.05,
        scaleY: 0.05,
        scaleZ: 0.05,

        displaceU: 0,
        displaceV: -3
    },
        {
        title: 'Cylinder',
        xFunction: '0.5*cos(u)',
        yFunction: 'v',
        zFunction: '0.5*sin(u)',

        uMin: -1,
        uMax: 1,
        vMin: 0,
        vMax: 1,
        isPiU: true,
        isPiV: false,

        uSegments: 50,
        vSegments: 50,

        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,

        displaceU: 0,
        displaceV: 0
    },
                    {
        title: 'Pillow',
        zFunction: 'cos(u)',
        yFunction: '-1*cos(v)',
        xFunction: '0.8*sin(u)*sin(v)',

        uMin: 0,
        uMax: 1,
        vMin: -1,
        vMax: 1,
        isPiU: true,
        isPiV: true,

        uSegments: 50,
        vSegments: 50,

        scaleX: 0.8,
        scaleY: 0.8,
        scaleZ: 0.8,

        displaceU: 0,
        displaceV: 0
    },
                        {
        title: 'Sine Surface',
        zFunction: 'sin(u)',
        yFunction: 'sin(v)',
        xFunction: 'sin(u+v)',

        uMin: -1,
        uMax: 1,
        vMin: -1,
        vMax: 1,
        isPiU: true,
        isPiV: true,

        uSegments: 50,
        vSegments: 50,

        scaleX: 0.8,
        scaleY: 0.8,
        scaleZ: 0.8,

        displaceU: 0,
        displaceV: 0
    },
                        {
        title: 'Steinbach Screw',
        xFunction: 'v*cos(u)',
        yFunction: 'u*sin(v)',
        zFunction: 'u*cos(v)',



        uMin: -4,
        uMax: 4,
        vMin: 0,
        vMax: 2,
        isPiU: false,
        isPiV: true,

        uSegments: 50,
        vSegments: 50,

        scaleX: 0.18,
        scaleY: 0.18,
        scaleZ: 0.18,

        displaceU: 0,
        displaceV: 0
    },

                            {
        title: 'Moebius Band',
        xFunction: 'cos(v)*(1 + u*cos(v/2))',
        yFunction: 'sin(v)*(1 + u*cos(v/2))',
        zFunction: 'u*sin(v/2)',



        uMin: -0.3,
        uMax: 0.3,
        vMin: 0,
        vMax: 2,
        isPiU: false,
        isPiV: true,

        uSegments: 50,
        vSegments: 50,

        scaleX: 0.6,
        scaleY: 0.6,
        scaleZ: 0.6,

        displaceU: 0,
        displaceV: 0
    },
                    {
        title: 'Wavy Sphere',
        xFunction: 'u*cos(cos(u))*cos(v)',
        yFunction: 'u*cos(cos(u))*sin(v)',
        zFunction: 'u*sin(cos(u))',

        uMin: 0,
        uMax: 45,
        vMin: 0,
        vMax: 2,
        isPiU: false,
        isPiV: true,

        uSegments: 100,
        vSegments: 100,

        scaleX: 0.02,
        scaleY: 0.02,
        scaleZ: 0.02,

        displaceU: 0,
        displaceV: 0
    },
        {
        title: 'Spring',
        xFunction: '(2 + 0.5*cos(v))*cos(u)',
        yFunction: '(2 + 0.5*cos(v))*sin(u)',
        zFunction: '0.5*(sin(v) + 2*u/PI)',

        uMin: 0,
        uMax: 15,
        vMin: 0,
        vMax: 2,
        isPiU: true,
        isPiV: true,

        uSegments: 100,
        vSegments: 100,

        scaleX: 0.1,
        scaleY: 0.1,
        scaleZ: 0.1,

        displaceU: 0,
        displaceV: 0
    },

            {
        title: 'Folium',
        xFunction: 'cos(u)*(2*v/PI - tanh(v))',
        yFunction: 'cos(u + 2*PI/3)/cosh(v)',
        zFunction: 'cos(u - 2*PI/3)/cosh(v)',

        uMin: -1,
        uMax: 1,
        vMin: -1,
        vMax: 1,
        isPiU: true,
        isPiV: true,

        uSegments: 50,
        vSegments: 50,

        scaleX: 1.3,
        scaleY: 1.3,
        scaleZ: 1.3,

        displaceU: 0,
        displaceV: 0
    },
                {
        title: 'Hyperbolic Octahedron',
        xFunction: 'pow(cos(u)*cos(v), 3)',
        yFunction: 'pow(sin(u)*cos(v), 3)',
        zFunction: 'pow(sin(v), 3)',

        uMin: -1/2,
        uMax: 1/2,
        vMin: -1,
        vMax: 1,
        isPiU: true,
        isPiV: true,

        uSegments: 50,
        vSegments: 50,

        scaleX: 1.3,
        scaleY: 1.3,
        scaleZ: 1.3,

        displaceU: 0,
        displaceV: 0
    },
                    {
        title: `Maeder's Owl`,
        xFunction: 'v*cos(u)-0.5*v*v*cos(2*u)',
        yFunction: '-1*v*sin(u) - 0.5*v*v*sin(2*u)',
        zFunction: '4*exp(1.5*log(v))*cos(3*u/2)/3',

        uMin: 0,
        uMax: 4,
        vMin: 0.001,
        vMax: 4,
        isPiU: true,
        isPiV: false,

        uSegments: 100,
        vSegments: 100,

        scaleX: 0.071,
        scaleY: 0.071,
        scaleZ: 0.071,

        displaceU: 0,
        displaceV: 0
    },
            {
        title: 'Tranguloid Trefoil',
        xFunction: '2*sin(3*u)/(2+cos(v))',
        yFunction: '2*(sin(u) + 2*sin(2*u))/(2+cos(v+2*PI/3))',
        zFunction: '(cos(u)-2*cos(2*u))*(2+cos(v+2*PI/3))/4',

        uMin: -1,
        uMax: 1,
        vMin: -1,
        vMax: 1,
        isPiU: true,
        isPiV: true,

        uSegments: 50,
        vSegments: 50,

        scaleX: 0.3,
        scaleY: 0.2,
        scaleZ: 0.3,

        displaceU: 0,
        displaceV: 0
    },
            {
        title: 'Apple',
        xFunction: 'cos(u)*(5 + 4.8 *cos(v)) + pow(v/PI, 20)',
        yFunction: '-2.3*log(1-v*0.3157) + 6*sin(v) + 2*cos(v) ',
        zFunction: 'sin(u)*(5 + 4.8*cos(v)) + 0.25*cos(5*u)',

        uMin: -1,
        uMax: 1,
        vMin: -1,
        vMax: 1,
        isPiU: true,
        isPiV: true,

        uSegments: 50,
        vSegments: 50,

        scaleX: 0.06,
        scaleY: 0.06,
        scaleZ: 0.06,

        displaceU: 0,
        displaceV: 0
    },
                {
        title: `Kuen's Surface`,
        xFunction: '(2*(cos(u) + u*sin(u))*sin(v))/(1+u*u*sin(v)*sin(v))',
        yFunction: '(2*(-u*cos(u) + sin(u))*sin(v))/(1+u*u*sin(v)*sin(v))',
        zFunction: 'log(tan(v/2)) + 2*cos(v)/(1+u*u*sin(v)*sin(v))',

        uMin: -4.3,
        uMax: 4.3,
        vMin: 0.03,
        vMax: 31.11,
        isPiU: false,
        isPiV: false,

        uSegments: 100,
        vSegments: 100,

        scaleX: 0.7,
        scaleY: 0.7,
        scaleZ: 0.7,

        displaceU: 0,
        displaceV: 0
    },
                    {
        title: `Henneberg's Surface`,
        xFunction: '2*cos(v)*sinh(u)-0.667*cos(3*v)*sinh(3*u)',
        yFunction: '2*sin(v)*sinh(u)+0.667*sin(3*v)*sinh(3*u)',
        zFunction: '2*cos(2*v)*cosh(2*u)',

        uMin: -1,
        uMax: 1,
        vMin: -0.5,
        vMax: 0.5,
        isPiU: false,
        isPiV: true,

        uSegments: 100,
        vSegments: 100,

        scaleX: 0.1,
        scaleY: 0.1,
        scaleZ: 0.1,

        displaceU: 0,
        displaceV: 0
    },
    {
            /*
a : 1.6
b : 1.6
c	:	1.0
h	:	1.5
k	:	-7.0
w	:	0.075
umin	:	-50.0
umax	:	-1.0
    */
      title: "Pseudoheliceras subcatenatum",

        xFunction: 'exp(0.075*u)*(1.5 + 1.6 * cos(v))*cos(1.0*u)',
        yFunction: '-1 * exp(0.075*u)*(1.5 + 1.6 * cos(v))*sin(1.0*u)',
        zFunction: 'exp(0.075*u)*(-7 + 1.6 * sin(v))',

        uMin: -50,
        uMax: -1,
        vMin: 0,
        vMax: 2,
        isPiU: false,
        isPiV: true,

        uSegments: 50,
        vSegments: 50,

        scaleX: 0.3,
        scaleY: 0.3,
        scaleZ: 0.3,

        displaceU: 0,
        displaceV: 0

    },
        {
        title: 'Little Cycloid',
        xFunction: 'cos(u/2)*cos(u/5)*(10 + cos(v)) + sin(u/5)*sin(v)*cos(v)',
        yFunction: 'sin(u/2)*cos(u/5)*(10 + cos(v)) + sin(u/5)*sin(v)*cos(v)',
        zFunction: '-sin(u/5)*(10+cos(v))*sin(v)*cos(v)',

        uMin: 0,
        // 2*b*c
        uMax: 2*5*2,
        vMin: 0,
        vMax: 4,
        isPiU: true,
        isPiV: true,

        uSegments: 100,
        vSegments: 100,

        scaleX: 0.05,
        scaleY: 0.05,
        scaleZ: 0.05,

        displaceU: 0,
        displaceV: -3
    },
            {
        //  R=50, r=12.5, p=7 und q=3
        title: 'Torus Knot',
        xFunction: '(50+90*cos(7*u) + 12.5*cos(v)) * cos(8*u)',
        yFunction: '12.5*sin(v) + 90*sin(7*u)',
        zFunction: '(50+90*cos(7*u) + 12.5*cos(v)) * sin(8*u)',
        uMin: 0,
        uMax: 2,
        vMin: 0,
        vMax: 2,
        isPiU: true,
        isPiV: true,
        uSegments: 200,
        vSegments: 200,
        scaleX: 0.005,
        scaleY: 0.005,
        scaleZ: 0.005,
        displaceU: 0,
        displaceV: 0
    },
            {
        title: 'Triaxial Tritorus',
        yFunction: 'sin(u)*(1 + cos(v))',
        xFunction: 'sin(u+2*PI/3)*(1+cos(v+2*PI/3))',
        zFunction: 'sin(u+4*PI/3)*(1+cos(v+4*PI/3))',
        uMin: -1,
        uMax: 1,
        vMin: -1,
        vMax: 1,
        isPiU: true,
        isPiV: true,
        uSegments: 100,
        vSegments: 100,
        scaleX: 0.7,
        scaleY: 0.7,
        scaleZ: 0.7,
        displaceU: 0,
        displaceV: 0
    },
                {
        title: 'Triaxial Hexatorus',
        xFunction: 'sin(u)/(sqrt(2)+cos(v))',
        yFunction: 'sin(u+2*PI/3)/(sqrt(2)+cos(v+2*PI/3))',
        zFunction: 'cos(u-2*PI/3)/(sqrt(2)+cos(v-2*PI/3))',
        uMin: 0,
        uMax: 2,
        vMin: 0,
        vMax: 2,
        isPiU: true,
        isPiV: true,
        uSegments: 100,
        vSegments: 100,
        scaleX: 0.8,
        scaleY: 0.8,
        scaleZ: 0.8,
        displaceU: 0,
        displaceV: 0
    },
      {
        title: 'Hyperbolic Helicoid',
        xFunction: 'sinh(v)*cos(4.13*u)/(1+cosh(u)*cosh(v))',
        yFunction: 'sinh(v)*sin(4.13*u)/(1+cosh(u)*cosh(v))',
        zFunction: 'cosh(v)*sinh(u)/(1+cosh(u)*cosh(v))',
        uMin: -4,
        uMax: 4,
        vMin: -4,
        vMax: 4,
        isPiU: false,
        isPiV: false,
        uSegments: 100,
        vSegments: 100,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        displaceU: 0,
        displaceV: 0
      },

        {
        title: 'Triple Corkscrew III',
        xFunction: 'u*1.3',
        yFunction: '0.5*(0.4*(1 - abs(u)) * cos(v) + cos(0.4)*cos(u*PI/2)*cos(u*10*PI))',
        zFunction: '0.5*(0.4*(1-abs(u))*sin(v) + cos(0.4)*cos(u*PI/2)*sin(u*10*PI))',
        uMin: -1,
        uMax: 1,
        vMin: -1,
        vMax: 1,
        isPiU: false,
        isPiV: true,
        uSegments: 190,
        vSegments: 190,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        displaceU: 0,
        displaceV: 0
    },
            {
                // a = 0.4
                // uMin = -13.2
                // uMax = 13.2
                // vMin = -37.4
                // vMax = 37.4


                // r = 1-0.4*0.4
                // w = sqrt(r)
                // d = a( pow(w * cosh(a*u), 2) + pow(a*sin(w*v), 2) )
                // x = -u + (2*r*cosh(a*u)*sinh(a*u)/d)
                // y = 2*w*cosh(a*u)*(-1*(w*cos(v)*cos(w*v)) - (sin(v) * sin(w*v)))/d
                // z = 2*w*cosh(a*u) * (-1* (w*sin(v)*cos(w*v)) + (cos(v)*sin(w*v)))/d
                /*
                w = sqrt(1-0.4*0.4)
                d = 0.4( pow(sqrt(1-0.4*0.4) * cosh(0.4*u), 2) + pow(0.4*sin(sqrt(1-0.4*0.4)*v), 2) )
                x = -u + (2*(1-0.4*0.4)*cosh(0.4*u)*sinh(0.4*u)/(0.4*( pow(sqrt(1-0.4*0.4) * cosh(0.4*u), 2) + pow(0.4*sin(sqrt(1-0.4*0.4)*v), 2) )))
                y = 2*(sqrt(1-0.4*0.4))*cosh(0.4*u)*(-1*((sqrt(1-0.4*0.4))*cos(v)*cos((sqrt(1-0.4*0.4))*v)) - (sin(v) * sin((sqrt(1-0.4*0.4))*v)))/(0.4*( pow(sqrt(1-0.4*0.4) * cosh(0.4*u), 2) + pow(0.4*sin(sqrt(1-0.4*0.4)*v), 2) ))
                z = 2*sqrt(1-0.4*0.4)*cosh(0.4*u) * (-1* (sqrt(1-0.4*0.4)*sin(v)*cos(sqrt(1-0.4*0.4)*v)) + (cos(v)*sin(sqrt(1-0.4*0.4)*v)))/(0.4*( pow(sqrt(1-0.4*0.4) * cosh(0.4*u), 2) + pow(0.4*sin(sqrt(1-0.4*0.4)*v), 2) ))
                */
        title: 'Breather Surface',
        xFunction: '-u + (2*(1-0.4*0.4)*cosh(0.4*u)*sinh(0.4*u)/(0.4*( pow(sqrt(1-0.4*0.4) * cosh(0.4*u), 2) + pow(0.4*sin(sqrt(1-0.4*0.4)*v), 2) )))',
        yFunction: '2*(sqrt(1-0.4*0.4))*cosh(0.4*u)*(-1*((sqrt(1-0.4*0.4))*cos(v)*cos((sqrt(1-0.4*0.4))*v)) - (sin(v) * sin((sqrt(1-0.4*0.4))*v)))/(0.4*( pow(sqrt(1-0.4*0.4) * cosh(0.4*u), 2) + pow(0.4*sin(sqrt(1-0.4*0.4)*v), 2) ))',
        zFunction: '2*sqrt(1-0.4*0.4)*cosh(0.4*u) * (-1* (sqrt(1-0.4*0.4)*sin(v)*cos(sqrt(1-0.4*0.4)*v)) + (cos(v)*sin(sqrt(1-0.4*0.4)*v)))/(0.4*( pow(sqrt(1-0.4*0.4) * cosh(0.4*u), 2) + pow(0.4*sin(sqrt(1-0.4*0.4)*v), 2) ))',
        uMin: -13.2,
        uMax: 13.2,
        vMin: -37.4,
        vMax: 37.4,
        isPiU: false,
        isPiV: false,
        uSegments: 190,
        vSegments: 190,
        scaleX: 0.2,
        scaleY: 0.2,
        scaleZ: 0.2,
        displaceU: 0,
        displaceV: 0
    },
                {
                // a = 0.4
                // uMin = -13.2
                // uMax = 13.2
                // vMin = -37.4
                // vMax = 37.4


                // r = 1-0.4*0.4
                // w = sqrt(r)
                // d = a( pow(w * cosh(a*u), 2) + pow(a*sin(w*v), 2) )
                // x = -u + (2*r*cosh(a*u)*sinh(a*u)/d)
                // y = 2*w*cosh(a*u)*(-1*(w*cos(v)*cos(w*v)) - (sin(v) * sin(w*v)))/d
                // z = 2*w*cosh(a*u) * (-1* (w*sin(v)*cos(w*v)) + (cos(v)*sin(w*v)))/d
                /*
                w = sqrt(1-0.4*0.4)
                d = 0.4( pow(sqrt(1-0.4*0.4) * cosh(0.4*u), 2) + pow(0.4*sin(sqrt(1-0.4*0.4)*v), 2) )
                x = -u + (2*(1-0.4*0.4)*cosh(0.4*u)*sinh(0.4*u)/(0.4*( pow(sqrt(1-0.4*0.4) * cosh(0.4*u), 2) + pow(0.4*sin(sqrt(1-0.4*0.4)*v), 2) )))
                y = 2*(sqrt(1-0.4*0.4))*cosh(0.4*u)*(-1*((sqrt(1-0.4*0.4))*cos(v)*cos((sqrt(1-0.4*0.4))*v)) - (sin(v) * sin((sqrt(1-0.4*0.4))*v)))/(0.4*( pow(sqrt(1-0.4*0.4) * cosh(0.4*u), 2) + pow(0.4*sin(sqrt(1-0.4*0.4)*v), 2) ))
                z = 2*sqrt(1-0.4*0.4)*cosh(0.4*u) * (-1* (sqrt(1-0.4*0.4)*sin(v)*cos(sqrt(1-0.4*0.4)*v)) + (cos(v)*sin(sqrt(1-0.4*0.4)*v)))/(0.4*( pow(sqrt(1-0.4*0.4) * cosh(0.4*u), 2) + pow(0.4*sin(sqrt(1-0.4*0.4)*v), 2) ))
                */
        title: 'Breather Surface II',
        xFunction: '-u + (2*(1-0.6*0.6)*cosh(0.6*u)*sinh(0.6*u)/(0.6*( pow(sqrt(1-0.6*0.6) * cosh(0.6*u), 2) + pow(0.6*sin(sqrt(1-0.6*0.6)*v), 2) )))',
        yFunction: '2*(sqrt(1-0.6*0.6))*cosh(0.6*u)*(-1*((sqrt(1-0.6*0.6))*cos(v)*cos((sqrt(1-0.6*0.6))*v)) - (sin(v) * sin((sqrt(1-0.6*0.6))*v)))/(0.6*( pow(sqrt(1-0.6*0.6) * cosh(0.6*u), 2) + pow(0.6*sin(sqrt(1-0.6*0.6)*v), 2) ))',
        zFunction: '2*sqrt(1-0.6*0.6)*cosh(0.6*u) * (-1* (sqrt(1-0.6*0.6)*sin(v)*cos(sqrt(1-0.6*0.6)*v)) + (cos(v)*sin(sqrt(1-0.6*0.6)*v)))/(0.6*( pow(sqrt(1-0.6*0.6) * cosh(0.6*u), 2) + pow(0.6*sin(sqrt(1-0.6*0.6)*v), 2) ))',
        uMin: -8,
        uMax: 8,
        vMin: -15.55,
        vMax: 15.55,
        isPiU: false,
        isPiV: false,
        uSegments: 190,
        vSegments: 190,
        scaleX: 0.2,
        scaleY: 0.2,
        scaleZ: 0.2,
        displaceU: 0,
        displaceV: 0
    }
    ]


var shouldRender = true;
var shouldScale = true;

const shapes = op.inDropDown("shapes", parametricBodies.map(bod => bod.title));

const render = op.inTrigger('render');
const inSegmentsU = op.inValueInt('u Segments', 48);
const inSegmentsV = op.inValueInt('v Segments', 48);
const multByPiU = op.inValueBool("Multiple of PI - u", false);
const inMinU = op.inValueFloat('uMin', -2);
const inMaxU = op.inValueFloat('uMax', 2);
const inDisplaceU = op.inValueFloat("Displace U", 0);

const multByPiV = op.inValueBool("Multiple of PI - v", false);
const inMinV = op.inValueFloat('vMin', -1);
const inMaxV = op.inValueFloat('vMax', 1);
const inDisplaceV = op.inValueFloat("Displace V", 0);

op.setPortGroup("Segments",[inSegmentsU, inSegmentsV]);
op.setPortGroup("V range", [multByPiV, inMaxV, inMinV, inDisplaceV]);
op.setPortGroup("U range", [multByPiU, inMaxU, inMinU, inDisplaceU]);
const inFunctionX = op.inString("X Function", "u");
const inFunctionY = op.inString("Y Function", "v");

const inFunctionZ = op.inString("Z Function", "0");
const inScaleX = op.inFloatSlider("Scale X", 1);
const inScaleY = op.inFloatSlider("Scale Y", 1);
const inScaleZ = op.inFloatSlider("Scale Z", 1);

op.setPortGroup("XYZ Functions", [inFunctionX, inScaleX, inFunctionY, inScaleY, inFunctionZ, inScaleZ]);
op.setPortGroup("Scaling",[inScaleX, inScaleY, inScaleZ]);
const draw = op.inValueBool('Draw', true);
op.setPortGroup('Draw', [draw]);


const inObj = {
    xFunction: inFunctionX,
    yFunction: inFunctionY,
    zFunction: inFunctionZ,

    isPiU: multByPiU,
    uMin: inMinU,
    uMax: inMaxU,

    isPiV: multByPiV,
    vMin: inMinV,
    vMax: inMaxV,

    uSegments: inSegmentsU,
    vSegments: inSegmentsV,

    scaleX: inScaleX,
    scaleY: inScaleY,
    scaleZ: inScaleZ,

    displaceU: inDisplaceU,
    displaceV: inDisplaceV
};


const trigger = op.outTrigger('trigger');


const geomOut = op.outObject('geometry');
const outPosition = op.outArray("Position");
const outLength = op.outNumber("Position Amount");
geomOut.ignoreValueSerialize = true;


Object.keys(inObj).forEach(key => {
    inObj[key].set(parametricBodies[0][key]);
});

shapes.set("Rectangle");

shapes.onChange = ({ value }) => {
    const [shape] = parametricBodies.filter(s => s.title === value);
    Object.keys(inObj).forEach(key => {
        inObj[key].set(shape[key]);
    });

    if(CABLES.UI) gui.patch().showOpParams(op);

    create();
};

const cgl = op.patch.cgl;
let mesh = null;
var geom = null;

const create = () => {
    if (shouldRender) {
    const uSegments = inSegmentsU.get();
    const vSegments = inSegmentsV.get();

    let uMax = inMinU.get() > inMaxU.get() ? inMinU.get() : inMaxU.get();
    let vMax = inMinV.get() > inMaxV.get() ? inMinV.get() : inMaxV.get();
    let uMin = inMaxU.get() < inMinU.get() ? inMaxU.get() : inMinU.get();
    let vMin = inMaxV.get() < inMinV.get() ? inMaxV.get() : inMinV.get();

    uMax =  multByPiU.get() ? uMax * Math.PI : uMax;
    vMax = multByPiV.get() ? vMax * Math.PI : vMax;

    uMin =  multByPiU.get() ? uMin * Math.PI : uMin;
    vMin = multByPiV.get() ? vMin * Math.PI : vMin;

    const displaceU = inDisplaceU.get();
    const displaceV = inDisplaceV.get();

    const xFunctionString = inFunctionX.get();
    const yFunctionString = inFunctionY.get();
    const zFunctionString = inFunctionZ.get();

    const scaleX = inScaleX.get();
    const scaleY = inScaleY.get();
    const scaleZ = inScaleZ.get();
    let xFunction;
    let yFunction;
    let zFunction;

    const coords = [];
    const texCoords = [];
    const paramVertexIndices = [];
    let normals;
    let tangents;
    let bitangents;

    try {
     xFunction = new Function('m', 'u', 'v', `with(m) { return ${xFunctionString} }`);
     yFunction = new Function('m', 'u', 'v', `with(m) { return ${yFunctionString} }`);
     zFunction = new Function('m', 'u', 'v', `with(m) { return ${zFunctionString} }`);

    for (let i = 0; i <= uSegments; i += 1) {
        for (let j = 0; j <= vSegments; j += 1) {
            const u_tex =  uMin + (i * (uMax - uMin) / uSegments);
            const v_tex = vMin + (j * (vMax - vMin) / vSegments);

            const u = displaceU + u_tex;
            const v = displaceV + v_tex;

            var x = xFunction(Math, u, v);
            var y = yFunction(Math, u, v);
            var z = zFunction(Math, u, v);

            if (shouldScale) {
                x = x * scaleX;
                y = y * scaleY;
                z = z * scaleZ;
            }

            coords.push(x, y, z);


            texCoords.push(CABLES.map(u_tex, uMin, uMax, 0, 1), CABLES.map(v_tex, vMin, vMax, 1, 0));

                if (i < uSegments && j < vSegments ) {
                    paramVertexIndices.push(i * (vSegments + 1) + j);
                    paramVertexIndices.push((i + 1) * (vSegments + 1) + j);
                    paramVertexIndices.push((i ) * (vSegments + 1) + j + 1);

                    paramVertexIndices.push((i + 1) * (vSegments + 1) + j);
                    paramVertexIndices.push((i + 1) * (vSegments + 1) + j + 1);
                    paramVertexIndices.push((i ) * (vSegments + 1) + j + 1);
                }

        }
    }

    tangents = [];
    bitangents = [];
    normals = [];

} catch (e) {
    if (e instanceof ReferenceError || e instanceof SyntaxError) { console.error(e); return; }
    console.log(e);
}
        geom = new CGL.Geometry("parametric surface");
        geom.clear();
        geom.vertices = coords || [];
        geom.texCoords = texCoords;
        geom.verticesIndices = paramVertexIndices;

        geom.calculateNormals();
        geom.calcTangentsBitangents();

    if (geom.vertices.length == 0) return;

    if (!mesh) {
        mesh = new CGL.Mesh(cgl, geom);
    } else {
        mesh.setGeom(geom);
    }
        geomOut.set(null);
        geomOut.set(geom);

    }
    outPosition.set(null);
    outPosition.set(geom.vertices);
    outLength.set(geom.vertices.length);
    shouldRender = false;
    shouldScale = false;
}

create();

const setRender = () =>{
    shouldScale = true;
    shouldRender = true;
    }
const setScale = () => {
    shouldScale = true;
    shouldRender = true;
}

 draw.onChange =
 inSegmentsU.onChange =
 inSegmentsV.onChange =
 inMaxU.onChange =
 inMaxV.onChange =
 inMinU.onChange =
 inMinV.onChange =
 inDisplaceV.onChange =
 inDisplaceU.onChange =
 multByPiV.onChange =
 multByPiU.onChange =
 inFunctionX.onChange =
 inFunctionY.onChange =
 inFunctionZ.onChange = setRender;

inScaleX.onChange =
inScaleY.onChange =
inScaleZ.onChange = setScale;

render.onTriggered = function () {
    if (shouldRender) create();
    if (draw.get())
    {
        mesh.render(cgl.getShader());
    }
    trigger.trigger();

};
