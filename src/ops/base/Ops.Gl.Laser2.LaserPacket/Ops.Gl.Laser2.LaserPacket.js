op.name="LaserPacket";


var exe=op.inFunctionButton("Send");

var inLaser=op.inValue("laser id",0);
var inSpeed=op.inValue("speed",7000);


var inDraw=op.inValueBool("Draw");
var inDrawClamp=op.inValueBool("Draw Clamp");
var close=op.inValueBool("Close");
var blackEnd=op.inValueBool("blackEnd");
var inDots=op.inValueBool("dots");


var inPoints=op.inArray("Points");
var inColors=op.inArray("Colors");

var pointRepeat=op.inValueInt("Point Repeat",1);

var inNeverDrop=op.inValueBool("neverDrop");


var inClampXLeft=op.inValue("Clamp X Left");
var inClampYTop=op.inValue("Clamp Y Top");

var inClampX=op.inValue("Clamp X",4000);
var inClampY=op.inValue("Clamp Y",2250);


var objOut=op.outObject("Packet");
var outNumPoints=op.outValue("Numpoints");

exe.onTriggered=send;

var clippedPoints=[];
clippedPoints.length=3000;

var clippedColors=[];
clippedColors.length=3000;



function send()
{
    var i=0;
    
    var icolors=inColors.get();
    var colors=[];
    
    clipBottom=inClampY.get();
    clipRight=inClampX.get();
    clipTop=inClampYTop.get();
    clipLeft=inClampXLeft.get();

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
    if(inPoints.get()) points=inPoints.get().slice(0);


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
    
    if(pointRepeat.get()>1)
    {
        var num=Math.floor(pointRepeat.get());
        var npoints=[];
        for(i=0;i<points.length/2;i++)
        {
            for(var j=0;j<num;j++)
            {
                npoints.push(points[i*2+0]);
                npoints.push(points[i*2+1]);
            }
        }
        points=npoints;
    }
    
    
    // now clip
    // var clippedPoints=[];
    // var clippedColors=[];
    var cpIndex=0;
    var ccIndex=0;
    
    
    var wasClipped=false;
    var lcount=0;
    
    for(var i=0;i<points.length-2;i+=4)
    {
        var l=clip( [ points[i+0],points[i+1] ],[points[i+2],points[i+3]] );

        if(l)
        {
            if(lcount==0)
            {

            }
            lcount++;

            if(wasClipped)
            {
                console.log("CLIP");
                clippedPoints[cpIndex++]=Math.round(l[0]);
                clippedPoints[cpIndex++]=Math.round(l[1]);
                clippedColors[ccIndex++]=0;
                clippedColors[ccIndex++]=0;
                clippedColors[ccIndex++]=0;
                clippedPoints[cpIndex++]=Math.round(l[0]);
                clippedPoints[cpIndex++]=Math.round(l[1]);
                clippedColors[ccIndex++]=0;
                clippedColors[ccIndex++]=0;
                clippedColors[ccIndex++]=0;
            }

            wasClipped=false;

            clippedPoints[cpIndex++]=Math.round(l[0]);
            clippedPoints[cpIndex++]=Math.round(l[1]);

            clippedColors[ccIndex++]=colors[0];
            clippedColors[ccIndex++]=colors[1];
            clippedColors[ccIndex++]=colors[2];

            clippedPoints[cpIndex++]=Math.round(l[2]);
            clippedPoints[cpIndex++]=Math.round(l[3]);

            clippedColors[ccIndex++]=colors[0];
            clippedColors[ccIndex++]=colors[1];
            clippedColors[ccIndex++]=colors[2];

        }
        else 
        {
            // console.log("completly clipped");
            wasClipped=true;
        }
    }
    


    
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
        clippedPoints[cpIndex++]=lastX;
        clippedPoints[cpIndex++]=lastY;

        clippedColors[ccIndex++]=0;
        clippedColors[ccIndex++]=0;
        clippedColors[ccIndex++]=0;

        // lastX=points[0];
        // lastY=points[1];
        clippedPoints[cpIndex++]=lastX;
        clippedPoints[cpIndex++]=lastY;

        clippedColors[ccIndex++]=0;
        clippedColors[ccIndex++]=0;
        clippedColors[ccIndex++]=0;


        clippedPoints[cpIndex++]=lastX;
        clippedPoints[cpIndex++]=lastY;

        clippedColors[ccIndex++]=0;
        clippedColors[ccIndex++]=0;
        clippedColors[ccIndex++]=0;


        clippedPoints[cpIndex++]=lastX;
        clippedPoints[cpIndex++]=lastY;

        clippedColors[ccIndex++]=0;
        clippedColors[ccIndex++]=0;
        clippedColors[ccIndex++]=0;


        clippedPoints[cpIndex++]=lastX;
        clippedPoints[cpIndex++]=lastY;

        clippedColors[ccIndex++]=0;
        clippedColors[ccIndex++]=0;
        clippedColors[ccIndex++]=0;


        clippedPoints[cpIndex++]=lastX;
        clippedPoints[cpIndex++]=lastY;

        clippedColors[ccIndex++]=0;
        clippedColors[ccIndex++]=0;
        clippedColors[ccIndex++]=0;


        clippedPoints[cpIndex++]=lastX;
        clippedPoints[cpIndex++]=lastY;

        clippedColors[ccIndex++]=0;
        clippedColors[ccIndex++]=0;
        clippedColors[ccIndex++]=0;


        clippedPoints[cpIndex++]=lastX;
        clippedPoints[cpIndex++]=lastY;

        clippedColors[ccIndex++]=0;
        clippedColors[ccIndex++]=0;
        clippedColors[ccIndex++]=0;


        lastX=points[0];
        lastY=points[1];
        

        clippedPoints[cpIndex++]=lastX;
        clippedPoints[cpIndex++]=lastY;

        clippedColors[ccIndex++]=0;
        clippedColors[ccIndex++]=0;
        clippedColors[ccIndex++]=0;
        
        
    }

    points=clippedPoints;
    colors=clippedColors;
    
    points.length=cpIndex;
    colors.length=ccIndex;

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
    }

    if(inDots.get())
    {
        var dotpoints=[];
        var dotcolors=[];
        var count=0;

        for(var i=0;i<points.length/2;i++)
        {
            for(var j=0;j<8;j++)
            {
                dotpoints.push(points[i*2+0],points[i*2+1]);
                dotcolors.push(0,0,0);
            }

            for(var j=0;j<1;j++)
            {
                dotpoints.push(points[i*2+0],points[i*2+1]);
                dotcolors.push(colors[0],colors[1],colors[2]);
            }

            for(var j=0;j<1;j++)
            {
                dotpoints.push(points[i*2+0],points[i*2+1]);
                dotcolors.push(0,0,0);
            }
        }

        points=dotpoints;
        colors=dotcolors;
    }



    // first point black!
    var firstX=points[0];
    var firstY=points[1];
    
    var lastX=points[points.length-2];
    var lastY=points[points.length-1];
    points.push(lastX,lastY);
    colors.push(0,0,0);

    points.push(lastX,lastY);
    colors.push(0,0,0);


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

    points.unshift(firstY);
    points.unshift(firstX);
    colors.unshift(0);
    colors.unshift(0);
    colors.unshift(0);


    
    // console.log(colors.length/3,points.length/2);
    
    var packet=
        {
            "points":points.slice(0),
            "colors":colors.slice(0),
            "numPoints": (points.length/2),
            "speed": ""+inSpeed.get(),
            "laserId": +inLaser.get()
        };
        
    if(inNeverDrop.get())packet.neverDrop=1;
    else packet.neverDrop=0;



for(var i=0;i<points.length;i++)
{
    if(points[i]<0)return;//console.log("LESS THEN ZERO BIATCH");
}

outNumPoints.set(null);
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
    var first=true;
    var outCode0=0,outCode1=0;
    while(true)
    {
        outCode0 = outCodes(P0);
        outCode1 = outCodes(P1);

        if( rejectCheck(outCode0,outCode1))return false;
        if( acceptCheck(outCode0,outCode1)) 
        // if(first) 
        return [P0[0],P0[1],P1[0],P1[1]];
        //  return [P1[0],P1[1],P0[0],P0[1]];

        wasClipped=true;
        first=false;

        // console.log("clip area...",clipLeft,clipTop,clipBottom,clipRight);
        // console.log("clip...",P0,P1);

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
    cgl.pushModelMatrix();
    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,transMatrix);

    var shader=cgl.getShader();
    if(!shader)return;

    var oldPrim=shader.glPrimitive;
    shader.glPrimitive=cgl.gl.LINE_STRIP;

    // clamp lines
    if(inDrawClamp.get())
    {
        drawLine([0,0,inClampX.get(),0]);
        drawLine([0,inClampY.get(),inClampX.get(),inClampY.get()]);
    }

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
    cgl.popModelMatrix();

    
}
