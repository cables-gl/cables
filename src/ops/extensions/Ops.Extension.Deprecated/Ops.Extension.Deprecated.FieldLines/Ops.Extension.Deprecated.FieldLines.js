// http://hsilomedus.me/wp-content/uploads/d3electricField/electricField.html

let exec = op.inTrigger("Exec");
let each = op.outTrigger("Each");

let maxPoints = op.inValue("Max LinePoints", 500);
let outPoints = op.outArray("Points");
let outNumPoints = op.outValue("Num Points");
let outCanceled = op.outValue("Canceled lines");

let dots = new Float32Array(9000);

let p = 0.025;

let dxPos = [p, 0, -p, 0];
let dyPos = [0, p, 0, -p];
let dxNeg = [p, p, -p, -p];
let dyNeg = [-p, p, p, -p];

exec.onTriggered = function ()
{
    let numLines = 4;

    let forces = CABLES.forceFieldForces;
    let canceled = 0;

    for (let forceIndex = 0; forceIndex < forces.length; forceIndex++)
    {
        // Four lines coming from a charge
        for (let pointIndex = 0; pointIndex < numLines; pointIndex++)
        {
            let curX = forces[forceIndex].pos[0];
            let curY = forces[forceIndex].pos[1];
            let polarity = 1;
            if (forces[forceIndex].attraction < 0)
            {
                polarity = -1;
            }
            if (polarity > 0)
            {
                curX += dxPos[pointIndex] || 0;
                curY += dyPos[pointIndex] || 0;
            }
            else
            {
                curX += dxNeg[pointIndex] || 0;
                curY += dyNeg[pointIndex] || 0;
            }

            let dotCount = 0;
            dots[0] = curX;
            dots[1] = curY;
            dots[2] = 0;
            // dots.push(curX, curY,0);

            let times = maxPoints.get();// 1000;

            while (times-- > 0)
            {
                let dirX = 0;
                let dirY = 0;

                // if(curX!=curX ||curY!=curY )
                // {
                //     curX=0.0001;
                //     curY=0.0001;
                // }

                // Superposition the force vector at the current point
                for (let j = 0; j < forces.length; j++)
                {
                    let distX = (curX - forces[j].pos[0]);
                    let distXSq = distX * distX;

                    let distY = (curY - forces[j].pos[1]);
                    let distYSq = distY * distY;
                    let distanceSq = distXSq + distYSq;

                    // var distance = Math.sqrt(distanceSq);
                    // console.log(distX);

                    let force = forces[j].attraction * 10 / distanceSq;
                    let factor = force * polarity;// / distance;
                    dirX += distX * factor;
                    dirY += distY * factor;
                }

                // console.log(forces[0].attraction,dirX,dirY);

                // Move the next dot to follow the force vector
                let dirTotal = Math.sqrt(dirX * dirX + dirY * dirY);
                let addFactor = 0.1 / dirTotal;
                curX += addFactor * dirX;
                curY += addFactor * dirY;

                {
                    let xd = dots[dotCount * 3 - 6] - curX;
                    let yd = dots[dotCount * 3 - 5] - curY;
                    let theDist = xd * xd + yd * yd;

                    if (theDist < 0.12 * 0.12)
                    {
                        canceled++;
                        times = 0;
                        // doStop=true;
                    }
                    else
                    {
                        dots[dotCount * 3 + 0] = curX;
                        dots[dotCount * 3 + 1] = curY;
                        dots[dotCount * 3 + 2] = 0;
                        // dots.push(curX, curY,0);
                        dotCount++;
                    }
                }

                // If the next dot is inside a circle, terminate further iterations
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
