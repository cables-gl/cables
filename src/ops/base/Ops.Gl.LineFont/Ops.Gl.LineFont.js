op.name="LineFont";

var render=op.inFunction('render');
var string=op.inValueString('Text','cables');

var letterSpacing=op.inValue('Letter Spacing',1);
var lineWidth=op.inValue('Line Width',2);
var align=op.inValueSelect('align',['left','center','right']);

var stringWidth=0;
var meshes=[];
var vec=vec3.create();
var cgl=op.patch.cgl;
var characters=
    [
        {
            // a
            l:[
                [182.667,349.057,164.167,349.057],
                [160.333,360.557,171.333,326.89,175.333,326.89,186,360.557],
            ]    
        },
        {
            // b
            l:
            [
                [174.333,343.057,160.255,343.057],
                [160.333,326.89,175.5,326.89,178.333,330.724,178.333,340.724,174.333,343.057,180.5,346.807,180.5,357.474,176,360.557,160.167,360.557,160.333,326.89]
            ]
        },
        {
            // c
            l:
            [
                [180.583,331.307,175.917,326.807,166,326.807,160.083,332.557,160.083,354.557,165.833,360.474,175.917,360.474,180.5,355.807],
            ]
        },
        {
            // d
            l:
            [
                [160.083,327.057,160.083,360.557,175.417,360.557,180.708,355.265,180.708,332.974,175.104,327.057,160.083,327.057],
            ]
        },
        {
            // e
            l:
            [
                [175.167,343.932,160.436,343.932],
                [177.917,326.807,164.5,326.807,160.436,330.872,160.436,356.845,164.014,360.422,177.917,360.422]
            ]
        },
        {
            // f
            l:
            [
                [176.792,326.932,164.125,326.932,160.167,330.891,160.167,360.683],
                [173.458,345.599,160.167,345.599],
            ]
        },
        {
            // g
            l:
            [
                [180.455,332.395,175.391,328.33,166.194,328.33,160.167,334.357,160.167,355.933,165.792,360.557,176.038,360.557,181.62,354.976,181.62,344.811,173.122,344.811 	],
            ]
        },
        {
            //h
            l:
            [
                [160.167,326.89,160.167,360.557],
                [160.5,343.723,182.333,343.723],
                [182.333,326.89,182.333,360.974]
            ]
        },
        {
            // i
            l:
            [
                [160.167,326.807,160.167,360.641]
            ]
        },
        {
            // j
            l:
            [
                [159.833,326.89,166.833,326.89,166.833,362.057,163.962,364.928,159.833,364.928],
            ]
        },
        {
            // k
            l:
            [
                [160.167,326.807,160.167,360.974],
                [178.917,326.807,160.167,348.474],
                [164.905,342.998,180.333,360.64]
            ]
        },
        {
            //l
            l:
            [
                [160.167,326.974,160.167,360.558,176.083,360.558],
            ]
        },
        {
            l:
            [
                [160.167,360.557,160.247,326.89,164.997,326.89,175.5,360.557,178,360.557,188.58,326.89,193.33,326.89,193.25,360.557],
            ]
        },
        {
            // n
            l:
            [
                [160.167,360.599,160.167,326.933,164.629,326.933,178.333,360.599,182.083,360.599,182.083,326.933],
            ]
        },
        {
            l:
            [
                [160.283,332.448,165.764,326.967,178.405,326.967,183.668,332.23,183.668,354.365,177.434,360.599,166.367,360.599,160.167,354.399,160.283,332.448],
            ]
        },
        
        {
            //p
            l:
            [
                [160.167,360.432,160.167,327.015,175.955,327.015,179.667,330.728,179.667,341.015,175.602,345.08,160.167,345.08],
            ]
        },
        
        {
            // q
            l:
            [
                [184.504,361.693,180.517,357.706],
                [160.283,332.413,165.764,326.932,178.405,326.932,183.668,332.195,183.668,354.33,177.434,360.564,166.367,360.564,160.167,354.364,160.283,332.413],
            ]
        },
        {
            // r
            l:
            [
                [179.667,360.307,173.5,344.955],
                [160.167,360.307,160.167,326.89,175.955,326.89,179.667,330.603,179.667,340.89,175.602,344.955,160.167,344.955],
            ]
        },
        {
            // s
            l:
            [
                [179.979,326.87,165.895,326.87,160.167,332.598,160.167,338.307,179.292,349.057,179.292,355.223,173.917,360.598,160.167,360.598],
            ]
        },
        {
            // t
            l:
            [
                [170.417,326.89,170.417,360.974],
                [180.5,326.89,160.167,326.89]
            ]
        },
        {
            // u
            l:
            [
                [160.167,327.14,160.167,356.845,164.108,360.786,178.125,360.786,182.012,356.899,181.958,327.14],
            ]
        },
        {
            // v
            l:
            [
                [160.167,326.901,170.167,360.797,174.417,360.797,184.667,326.734],
            ]
        },
        {
            // w
            l:
            [
                [203.5,326.89,195.208,360.557,191.458,360.557,184,326.89,179.758,326.89,172.208,360.557,168.458,360.557,160.167,326.89],
            ]
        },
        {
            // x
            l:
            [
                [181.333,360.64,159.667,326.807],
                [159.667,360.557,181.75,326.807]
            ]
        },
        {
            // y
            l:
            [
                [160.167,326.891,168.508,347.224,173.992,347.224,182.917,326.891],
                [171.333,347.224,171.333,360.641]
            ]
        },
        {
            // z
            l:
            [
                [161.167,326.807,180.5,326.807,180.5,332.473,161.167,355.223,161.167,360.557,180.5,360.557],
            ]
        },
        
        
        {
            // 0
            l:
            [
                [167.591,326.89,173.076,326.89,180.5,334.315,180.5,353.132,173.076,360.557,167.591,360.557,160.167,353.132,160.167,334.315,167.591,326.89],
            ]
        },
        {
            // 1
            l:
            [
                [160.167,334.315,167.549,326.932,170.333,326.89,170.417,360.557],
            ]
        },
        {
            // 2
            l:
            [
                [164.066,330.415,167.591,326.89,180.5,326.89,180.5,330.603,160.167,351.224,160.167,360.557,180.5,360.599],
            ]
        },
        {
            // 3
            l:
            [
                [169.583,342.932,180.5,342.932],
                [163.129,331.353,167.591,326.89,180.5,326.89,180.5,360.557,167.591,360.557,162.837,355.803],
            ]
        },
        {
            // 4
            l:
            [
                [178.076,326.89,178.076,360.599],
                [160.167,326.89,160.167,338.474,165.104,343.412,178.5,343.412],
            ]
        },
        {
            // 5
            l:
            [
                [180.5,326.89,160.098,326.958,160.167,342.932,180.5,342.932,180.5,353.132,173.076,360.557,160.167,360.557],
            ]
        },
        {
            // 6
            l:
            [
                [173.076,326.89,167.591,326.89,160.167,333.89,160.167,353.132,167.591,360.557,173.417,360.557,180.671,353.303,180.671,342.932,160.167,342.932],
            ]
        },
        {
            // 7
            l:
            [
                [163.591,326.89,180.5,326.89,170.417,360.557],
            ]
        },
        {
            // 8
            l:
            [
                [180.5,334.315,173.076,326.89,167.591,326.89,160.167,334.315,180.5,353.132,173.076,360.557,167.591,360.557,160.167,353.132,180.5,334.315],
            ]
        },
        {
            // 9
            l:
            [
                [167.591,360.557,173.076,360.557,180.5,353.132,180.5,334.315,173.076,326.89,167.591,326.89,160.167,334.315,160.167,342.932,180.5,342.932]                
            ]
        },
        
        {
            // &
            l:
            [
                [182.496,351.137,173.076,360.557,167.591,360.557,160.167,353.132,160.167,348.087,173.922,339.533,172.229,326.89,165.167,326.89,165.052,339.515,184.292,359.432],
            ]
        },
        {
            // '
            l:
            [
        		[160.167,326.932,160.167,333.557],
        		[162.879,326.932,162.879,333.557]

            ]
        },
        {
            // ;
            l:
            [
        		[160.167,342.932,160.167,346.224],
        		[160.167,354.224,160.167,360.557]
            ]
        },
        {
            // :
            l:
            [
        		[160.167,342.932,160.167,346.224],
        		[160.167,354.224,160.167,357.974]
            ]
        },
        {
            // _
            l:
            [
        		[160.167,360.557,170.417,360.557]
            ]
        },
        {
            // +
            l:
            [
        		[160.167,342.932,170,342.932],
                [164.833,347.849,164.833,338.015]
            ]
        },
        {
            // -
            l:
            [
        		[160.167,342.932,170,342.932],
            ]
        },
        {
            // /
            l:
            [
        		[180.5,326.89,160.167,360.557],
            ]
        },
        {
            // .
            l:
            [
        		[160.167,360.599,163.417,360.599],
            ]
        },
        {
            // ,
            l:
            [
        		[165.163,360.557,160.167,365.553],
            ]
        },
        {
            // )
            l:
            [
        		[160.167,360.557,167.591,353.132,167.591,334.315,160.167,326.89],
            ]
        },
        {
            // (
            l:
            [
        		[167.591,326.89,160.167,334.315,160.167,353.132,167.591,360.557],
            ]
        },
        {
            // ?
            l:
            [
        		[170.333,363.481,170.333,368.966],
        		[160.167,334.315,167.591,326.89,173.076,326.89,180.5,334.315,180.5,342.932,170.333,353.132,170.333,360.557]
            ]
        },
        {
            // !
            l:
            [
                [160.167,353.557,160.167,326.89],
                [160.167,357.64,160.167,360.557]
            ]
        },

    ];


function translateX(w)
{
    vec3.set(vec, w,0,0);
    mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
}

var alignMode=0;
align.onValueChanged=function()
{
    if(align.get()=="left")alignMode=0;
    if(align.get()=="center")alignMode=1;
    if(align.get()=="right")alignMode=2;
};

var oldPrim=0;
function renderChar(charIndex,simulate)
{
    shader=cgl.getShader();
    if(!shader)return;
    oldPrim=shader.glPrimitive;

    shader.glPrimitive=cgl.gl.LINE_STRIP;

    if(charIndex>=characters.length)charIndex=0;
    
    if(!simulate)
    {
        for(var m=0;m<characters[charIndex].m.length;m++)
        {
            characters[charIndex].m[m].render(op.patch.cgl.getShader());
        }
        translateX(characters[charIndex].w*letterSpacing.get());
    }
    else
    {
        stringWidth+=characters[charIndex].w*letterSpacing.get();
    }
    shader.glPrimitive=oldPrim;
}


render.onTriggered=function()
{
    stringWidth=0;
    if(!string.get())return;
    var spaceWidth=0.3;
    vec3.set(vec, 0.3,0,0);
    cgl.pushModelMatrix();

    var startCharacters=97;
    var startNumbers=48;
    
    var str=string.get()+'';

    cgl.gl.lineWidth(lineWidth.get());

    for(var sim=0;sim<2;sim++)
    {
        var simulate=sim===0;
        
        if(!simulate) 
        {
            if(alignMode==1) translateX(-stringWidth/2+0.04*letterSpacing.get());
            if(alignMode==2) translateX(-stringWidth+0.08*letterSpacing.get());
        }

        for(var i=0;i<str.length;i++)
        {
            var w=0;
            var charIndex=str.toLowerCase().charCodeAt(i);
    
            if(charIndex==38) renderChar(36); // &
            else if(charIndex==39) renderChar(37); // '
            else if(charIndex==34) renderChar(37); // '
            else if(charIndex==59) renderChar(38); // ;
            else if(charIndex==58) renderChar(39); // :
            else if(charIndex==95) renderChar(40); // _
            else if(charIndex==43) renderChar(41); // +
            else if(charIndex==45) renderChar(42); // -
            else if(charIndex==47) renderChar(43); // /
            else if(charIndex==46) renderChar(44); // .
            else if(charIndex==44) renderChar(45); // ,
            else if(charIndex==41) renderChar(46); // )
            else if(charIndex==40) renderChar(47); // ()
            else if(charIndex==63) renderChar(48); // ?
            else if(charIndex==33) renderChar(49); // !
            else
            if(charIndex>=startNumbers && charIndex<=startNumbers+10)
            {
                renderChar(charIndex-startNumbers+26,simulate);
            }
            else
            if(charIndex>=startCharacters && charIndex-startCharacters<characters.length)
            {
                renderChar(charIndex-startCharacters,simulate);
            }
            else
            if(charIndex==32)
            {
                translateX(spaceWidth);
                stringWidth+=spaceWidth;
            }
        }
    }

    cgl.popModelMatrix();
};

function avg(which)
{
    var avgX=0,avgY=0;
    var count=0;
    for(var l=0;l<characters[which].l.length;l++)
    {
        for(var j=0;j<characters[which].l[l].length;j+=2)
        {
            avgX+=characters[which].l[l][j];
            avgY+=characters[which].l[l][j+1];
            count++;
        }
    }
    avgX/=count;
    avgY/=count;
    return [avgX,avgY];
}

function min(which)
{
    var min=9999999;

    for(var l=0;l<characters[which].l.length;l++)
    {
        for(var j=0;j<characters[which].l[l].length;j+=2)
        {
            min=Math.min(min,characters[which].l[l][j]);
        }
    }
    return min;
}

function width(which)
{
    var min=9999999;
    var max=-9999999;

    for(var l=0;l<characters[which].l.length;l++)
    {
        for(var j=0;j<characters[which].l[l].length;j+=2)
        {
            min=Math.min(min,characters[which].l[l][j]);
            max=Math.max(max,characters[which].l[l][j]);
        }
    }
    return ((max-min));
}


meshes.length=0;

var avgXY=[];
var avg1=avg(0);
var avg2=avg(1);

avgXY=[ (avg1[0]+avg2[0])/2, (avg1[1]+avg2[1])/2 ];

for(var i=0;i<characters.length;i++)
{
    characters[i].w=width(i)*(0.002);
    characters[i].m=[];
    for(var l=0;l<characters[i].l.length;l++)
    {
        var count=0;
        var indices=[];
        var vertices=[];

        for(var j=0;j<characters[i].l[l].length;j+=2)
        {
            vertices.push( (characters[i].l[l][j]-min(i))*0.005 );
            vertices.push( (characters[i].l[l][j+1]-avgXY[1])*-0.005 );
            vertices.push( 0 );
            
            indices.push(count);
            count++;
        }
        
        var geom=new CGL.Geometry();
        geom.vertices=vertices;
        geom.verticesIndices=indices;
        var mesh=new CGL.Mesh(op.patch.cgl,geom);
        characters[i].m.push(mesh);
    }
    
    characters[i].w+=0.1;
}
