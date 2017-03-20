op.name="FieldLines";

var exec=op.inFunction("Exec");
var each=op.outFunction("Each");

var outPoints=op.outArray("Points");


exec.onTriggered=function()
{
    var numLines=4;
    var p=0.000005;

    var dxPos = [p,0,-p,0];
    var dyPos = [0,p,0,-p];
    var dxNeg = [p,p,-p,-p];
    var dyNeg = [-p,p,p,-p];
    var forces=CABLES.forceFieldForces;

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

            var dots = [];
            dots.push(curX, curY,0);

            var times = 1000;//1000;

            while(times-- > 0)
            {
                var dirX = 0;
                var dirY = 0;
                
                if(curX!=curX ||curY!=curY )
                {
                    curX=0.0001;
                    curY=0.0001;
                }
        
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

                //If the next dot is inside a circle, terminate further iterations
                for(var j = 0; j < forces.length; j++)
                {
                    var distX = (forces[j].pos[0] - curX);
                    var distY = (forces[j].pos[1] - curY);

                    if(distX*distX + distY*distY <=0.0000001)//3 )
                    {
                        // console.log('finished',dots.length);
                        times=0;
                        // break;
                    }
                }

                dots.push(curX, curY,0);
            }

            // if(pointIndex==0)
            {
                outPoints.set(dots);
                each.trigger();
            }

        }
    }


    
};

