op.name="FieldLines";

// http://hsilomedus.me/wp-content/uploads/d3electricField/electricField.html

var exec=op.inFunction("Exec");
var each=op.outFunction("Each");



var maxPoints=op.inValue("Max LinePoints",500);
var outPoints=op.outArray("Points");
var outNumPoints=op.outValue("Num Points");
var outCanceled=op.outValue("Canceled lines");


var dots = new Float32Array(3000);

var p=0.025;

var dxPos = [p,0,-p,0];
var dyPos = [0,p,0,-p];
var dxNeg = [p,p,-p,-p];
var dyNeg = [-p,p,p,-p];


exec.onTriggered=function()
{
    var numLines=4;

    var forces=CABLES.forceFieldForces;
    var canceled=0;

    for(var forceIndex = 0; forceIndex < forces.length; forceIndex++)
    {
        //Four lines coming from a charge
        for(var pointIndex=0; pointIndex<numLines; pointIndex ++)
        {
            var curX = forces[forceIndex].pos[0];
            var curY = forces[forceIndex].pos[1];
            var polarity = 1;
            if(forces[forceIndex].attraction < 0)
            {
                polarity = -1;
            }
            if(polarity > 0)
            {
                curX += dxPos[pointIndex]||0;
                curY += dyPos[pointIndex]||0;
            }
            else
            {
                curX += dxNeg[pointIndex]||0;
                curY += dyNeg[pointIndex]||0;
            }

            
            var dotCount=0;
            dots[0]=curX;
            dots[1]=curY;
            dots[2]=0;
            // dots.push(curX, curY,0);

            var times = maxPoints.get();//1000;

            while(times-- > 0)
            {
                var dirX = 0;
                var dirY = 0;

                // if(curX!=curX ||curY!=curY )
                // {
                //     curX=0.0001;
                //     curY=0.0001;
                // }

                //Superposition the force vector at the current point
                for(var j = 0; j < forces.length; j++)
                {
                    var distX = (curX - forces[j].pos[0]);
                    var distXSq = distX * distX;
                    
                    var distY = (curY - forces[j].pos[1]);
                    var distYSq = distY * distY;
                    var distanceSq = distXSq + distYSq;

                    //var distance = Math.sqrt(distanceSq);
                    // console.log(distX);

                    var force = forces[j].attraction *10 / distanceSq;
                    var factor= force * polarity;// / distance;
                    dirX += distX * factor;
                    dirY += distY * factor;
                }

                // console.log(forces[0].attraction,dirX,dirY);

                //Move the next dot to follow the force vector
                var dirTotal = Math.sqrt(dirX*dirX + dirY*dirY);
                var addFactor = 0.1 / dirTotal;
                curX = curX + addFactor*dirX;
                curY = curY + addFactor*dirY;

                doStop=false;


                {
                    var xd = dots[dotCount*3-6] - curX;
                    var yd = dots[dotCount*3-5] - curY;
                    var theDist= xd*xd + yd*yd ;
                    
                    if(theDist< 0.03*0.03 )
                    {
                        canceled++;
                        times=0;
                        // doStop=true;
                    }
                    else
                    {
                        
                        dots[dotCount*3+0]=curX;
                        dots[dotCount*3+1]=curY;
                        dots[dotCount*3+2]=0;
                        // dots.push(curX, curY,0);
                        dotCount++;

                    }
                }

                //If the next dot is inside a circle, terminate further iterations
                // for(var jj = 0; jj < forces.length; jj++)
                // {
                    // var distX = (forces[jj].pos[0] - curX);
                    // var distY = (forces[jj].pos[1] - curY);

                    // var xd = forces[jj].pos[0]-curX;
                    // var yd = forces[jj].pos[1]-curY;

                    // var theDist=Math.sqrt( xd*xd + yd*yd );

                    // console.log(dist);
                    // if(distX*distX + distY*distY <=0.0000001)//3 )
                    // if(curX==forces[forceIndex].pos[0] && curY==forces[forceIndex].pos[1] )
                    // if(dist <0.1)console.log(dist);

                    // if (distX*distX + distY*distY <= 10.43)
                    // {
                    //     times=0;
                    // }

                //     if(times>22 && theDist<0.005)
                //     {
                //         canceled++;
                //         times=0;
                //         // doStop=true;
                //     }
                // }

            }

            // if(pointIndex==0)
            // if(doStop)
            // {
            //     if(!dobreak)
            //     {
            //         dobreak=true;
            //         console.log(dots);
            //     }
            // }
            
            outNumPoints.set(dotCount);
            outPoints.set(null);
            outPoints.set(dots);
            each.trigger();
        }
        outCanceled.set(canceled);
    }


    
};

