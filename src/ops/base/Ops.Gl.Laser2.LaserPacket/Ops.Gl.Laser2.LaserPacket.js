op.name="LaserPacket";


var exe=op.inFunctionButton("Send");

var inDraw=op.inValueBool("Draw");
var close=op.inValueBool("Close");
var blackEnd=op.inValueBool("blackEnd");

var inPoints=op.inArray("Points");
var inColors=op.inArray("Colors");

var inClampX=op.inValue("Clamp X");
var inClampY=op.inValue("Clamp Y");


var objOut=op.outObject("Packet");

var outNumPoints=op.outValue("Numpoints");

// inPoints.onChange=send;
// inColors.onChange=send;
exe.onTriggered=send;


function send()
{
    var i=0;
    
    var icolors=inColors.get();
    var colors=[];
    
    clipBottom=inClampY.get();
    clipRight=inClampX.get();

    
    if(!icolors)
    {
        colors=[255,0,0];
    }
    else
    {
        for(i=0;i<icolors.length;i++)
        {
            colors[i]=Math.round( icolors[i]*255);
        }
    }

    var points=[];
    if(inPoints.get())

    {
    var points=inPoints.get().slice(0);

    }


    if(!points)
    {
        points=[
            0,0,
            0,0,
            0,0,
            0,0,
            0,1000,
            0,1000,
            0,1000,
            0,1000,
            1000,1000,
            1000,1000,
            1000,1000,
            1000,1000,
            1000,0,
            1000,0,
            1000,0,
            1000,0
            ];
    }
    else
    {
        for(i=0;i<points.length;i++)
        {
            points[i]=Math.round(points[i]);
        }
    }
    
    
    // now clip
    var clippedPoints=[];
    var clippedColors=[];

    
    var wasClipped=false;
    
    for(var i=0;i<points.length-2;i+=2)
    {
        var l=clip( [ points[i+0],points[i+1] ],[points[i+2],points[i+3]] );

        
        if(l)
        {
            
            if(wasClipped)
            {
                clippedPoints.push(Math.round(l[0]));
                clippedPoints.push(Math.round(l[1]));
                clippedColors.push(0);
                clippedColors.push(0);
                clippedColors.push(0);
                clippedPoints.push(Math.round(l[0]));
                clippedPoints.push(Math.round(l[1]));
                clippedColors.push(0);
                clippedColors.push(0);
                clippedColors.push(0);
            }

            wasClipped=false;
            
            clippedPoints.push(Math.round(l[0]));
            clippedPoints.push(Math.round(l[1]));
            clippedPoints.push(Math.round(l[2]));
            clippedPoints.push(Math.round(l[3]));
            
            clippedColors.push(colors[0]);
            clippedColors.push(colors[1]);
            clippedColors.push(colors[2]);
            
            clippedColors.push(colors[0]);
            clippedColors.push(colors[1]);
            clippedColors.push(colors[2]);
        }
        else wasClipped=true;
    }
    

    points=clippedPoints;
    colors=clippedColors;

    
    // if(colors.length/3 != points.length/2)
    // {
    //     var oldLength=colors.length;
    //     var newLength=(points.length/2)*3;
        
    //     var colR=colors[0];
    //     var colG=colors[1];
    //     var colB=colors[2];
    //     colors.length=Math.floor(newLength);

    //     for(i=0;i<newLength;i+=3)
    //     {
    //         colors[i+0]=colR;
    //         colors[i+1]=colG;
    //         colors[i+2]=colB;
    //     }
    // }


    
    // close...
    
    if(blackEnd.get())
    {
        var lastX=points[points.length-2];
        var lastY=points[points.length-1];
        points.push(lastX);
        points.push(lastY);

        colors.push(0);
        colors.push(0);
        colors.push(0);

        lastX=points[0];
        lastY=points[1];
        points.push(lastX);
        points.push(lastY);

        colors.push(0);
        colors.push(0);
        colors.push(0);

        lastX=points[0];
        lastY=points[1];
        points.push(lastX);
        points.push(lastY);

        colors.push(0);
        colors.push(0);
        colors.push(0);
    }

    if(close.get())
    {
        // last point to first point
        var firstX=points[0];
        var firstY=points[1];

        points.unshift(firstY);
        points.unshift(firstX);

        colors.unshift(colors[2]);
        colors.unshift(colors[1]);
        colors.unshift(colors[0]);
    }


    // first point black!
    var firstX=points[0];
    var firstY=points[1];

    points.unshift(firstY);
    points.unshift(firstX);
    colors.unshift(0);
    colors.unshift(0);
    colors.unshift(0);
    points.unshift(firstY);
    points.unshift(firstX);
    colors.unshift(0);
    colors.unshift(0);
    colors.unshift(0);

    points.unshift(firstY);
    points.unshift(firstX);
    colors.unshift(0);
    colors.unshift(0);
    colors.unshift(0);


    
    // console.log(colors.length/3,points.length/2);
    
    var packet=
        {
            "points":points,
            "colors":colors,
            "numPoints": (points.length/2),
            "speed": "15000",
            "laserId": "2"
        };

    outNumPoints.set( (points.length/2) );


    if(packet.numPoints>0 && firstX!==undefined)
    {
        // console.log(
        //     packet.numPoints,
        //     points.length/2,
        //     colors.length/3);

        // console.log(packet.points);


        objOut.set(null);
        objOut.set(packet);
        if(inDraw.get())
        {
            draw(packet);
        }
        
    }
}


//----------------------------
// clip

var clipBottom=2;
var clipTop=0;
var clipLeft=0;
var clipRight=2;



function outCodes(P)
{
    var Code = 0;

    if(P[1] > clipBottom)Code += 1;/* code for above */
    else if(P[1] < clipTop)Code += 2;/* code for below */

    if(P[0] > clipRight)Code += 4;/* code for right */
    else if(P[0] < clipLeft)Code += 8;/* code for left */

    return Code;
}

function rejectCheck(outCode1, outCode2)
{
    if ((outCode1 & outCode2)!= 0 )return true;
    return false;
}


function acceptCheck(outCode1, outCode2)
{
    if ( (outCode1 == 0)&& (outCode2 == 0))return true;
    return false;
}


function clip(P0,P1)
{
    // Cohen Sutherland 2D Clipper

    var outCode0=0,outCode1=0;
    while(true)
    {
        outCode0 = outCodes(P0);
        outCode1 = outCodes(P1);

        if( rejectCheck(outCode0,outCode1))return false;
        if( acceptCheck(outCode0,outCode1))return [P0[0],P0[1],P1[0],P1[1]];

        if(outCode0 == 0)
        {
            var tempCoord=[0,0];
            var tempCode=0;
            tempCoord = P0[0];P0[0]= P1[0];P1[0] = tempCoord;
            tempCoord = P0[1];P0[1]= P1[1];P1[1] = tempCoord;
            tempCode = outCode0;outCode0 = outCode1;outCode1 = tempCode;
        }
        if( (outCode0 & 1)!= 0 )
        {
            P0[0] += (P1[0] - P0[0])*(clipBottom - P0[1])/(P1[1] - P0[1]);
            P0[1] = clipBottom;
        }
        else
        if( (outCode0 & 2)!= 0 )
        {
            P0[0] += (P1[0] - P0[0])*(clipTop - P0[1])/(P1[1] - P0[1]);
            P0[1] = clipTop;
        }
        else
        if( (outCode0 & 4)!= 0 )
        {
            P0[1] += (P1[1] - P0[1])*(clipRight - P0[0])/(P1[0] - P0[0]);
            P0[0] = clipRight;
        }
        else
        if( (outCode0 & 8)!= 0 )
        {
            P0[1] += (P1[1] - P0[1])*(clipLeft - P0[0])/(P1[0] - P0[0]);
            P0[0] = clipLeft;
        }
    }
    
}



// -----------------------------

var cgl=op.patch.cgl;
var geom=new CGL.Geometry("simplespline");
geom.vertices=[0,0,0,0,0,0,0,0,0];
var mesh=new CGL.Mesh(cgl,geom);
var buff=new Float32Array();

var transMatrix=mat4.create();
var scale=0.001;
var vScale=vec3.create();
vec3.set(vScale, scale,scale,scale);
mat4.identity(transMatrix);
mat4.scale(transMatrix,transMatrix, vScale);

function drawLine(arr)
{
    var shader=cgl.getShader();
    numPoints=arr.length/2;
    var leng=(arr.length/2)*3;
    buff=new Float32Array(leng);
    
    for(var i=0;i<arr.length/2;i++)
    {
        buff[i*3+0]=arr[i*2+0];
        buff[i*3+1]=arr[i*2+1];
        buff[i*3+2]=0;
    }
    
    
    var attr=mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION,buff,3);
    
    if(numPoints<=0)attr.numItems=buff.length/3;
        else attr.numItems=Math.min(numPoints,buff.length/3);

    mesh.render(shader);

}





function draw(p)
{
    cgl.pushMvMatrix();
    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,transMatrix);

    var shader=cgl.getShader();
    if(!shader)return;

    var oldPrim=shader.glPrimitive;
    shader.glPrimitive=cgl.gl.LINE_STRIP;

    // clamp lines
    drawLine([0,0,inClampX.get(),0]);
    drawLine([0,inClampY.get(),inClampX.get(),inClampY.get()]);

    for(var i=0;i<p.points.length-2;i+=2)
    {
        var colIndex=(i/2)*3;
        if(
            p.colors[colIndex+0]!=0 ||
            p.colors[colIndex+1]!=0 || 
            p.colors[colIndex+2]!=0 )
        {
            // console.log(l);
            drawLine( 
            [ 
                p.points[i+0],
                p.points[i+1],
                p.points[i+2],
                p.points[i+3]
            ]);
        }
    }



    shader.glPrimitive=oldPrim;
    cgl.popMvMatrix();

    
}
