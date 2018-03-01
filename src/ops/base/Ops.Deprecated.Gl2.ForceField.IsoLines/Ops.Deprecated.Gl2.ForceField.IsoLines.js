op.name="IsoLines";

// http://hsilomedus.me/wp-content/uploads/d3electricField/electricField.html

var exec=op.inFunction("Exec");
var each=op.outFunction("Each");


var inWidth=op.inValue("Width");
var inHeight=op.inValue("Height");

var inFieldsX=op.inValue("Fields X");
var inFieldsY=op.inValue("Fields Y");


var maxPoints=op.inValue("Max LinePoints",500);

var outPoints=op.outArray("Points");
var outNumPoints=op.outValue("Num Points");

var dots = new Float32Array(6000);

var fieldFilled=[];


exec.onTriggered=function()
{
    for(var i=0;i<10;i++)
    {
        fieldFilled[i]=[];
        for(var j=0;j<10;j++) 
            fieldFilled[i][j]=null;
    }
    
    var width=inWidth.get();;
    var height=inHeight.get();;

    var horizontalBlock = width/inFieldsX.get();
    var verticalBlock = height/inFieldsY.get();
    
    var horizontalBlockHalf = horizontalBlock / 2;
    var verticalBlockHalf = verticalBlock / 2;

    var forces=CABLES.forceFieldForces;

    var calculatedFields = [];
    var maxForce = 0;
    var attrMul=0.3333;

    for (var i = 0; i < fieldFilled.length; i++)
    {
        var direction = 1;
        for (var jj=0; jj< fieldFilled[i].length; jj++)
        {
           if (!fieldFilled[i][jj])
           {
               //create a path here
               //Iterate at most 2 times in case the surface gets out of the area
               for (var circleTimes = 0; circleTimes <3; circleTimes+=2)
               {
                   //Define the center of the current block as a starting point of the surface
                   var curX = (i*horizontalBlock + horizontalBlockHalf)-width/2;
                   var curY = (jj*verticalBlock + verticalBlockHalf)-height/2;

                   var direction = 1-circleTimes;
                   
                   var dotCounter=0;
                   dots[0]=curX;
                   dots[1]=curY;
                   dots[2]=0;
                   dotCounter++;

                   //Superposition the fields from all forces, and get the resulting force vector
                   var dirX = 0;
                   var dirY = 0;
                   var totalForce = 0;
                   for (var j = 0; j < forces.length; j++)
                   {
                       var distX = curX - forces[j].pos[0];
                       var distY = curY - forces[j].pos[1];
                       var distanceSq = distX*distX + distY*distY;
                       var force = forces[j].attraction * attrMul / distanceSq;

                       var distanceFactor = force/ Math.sqrt(distanceSq);

                       //Measure the initial force in order to match the equipotential surface points
                       totalForce+= force;
                       dirX += distX * distanceFactor;
                       dirY += distY * distanceFactor;
                   }

                   //Maximum 2000 dots per surface line
                   var times = maxPoints.get();
                   while (times-- > 0)
                   {
                       var dirTotal = Math.sqrt(dirX*dirX + dirY*dirY);
                       var stepX = dirX/dirTotal*0.005;
                       var stepY = dirY/dirTotal*0.005;
                       //The equipotential surface moves normal to the force vector
                       curX = curX + direction*1.0*stepY;
                       curY = curY - direction*1.0*stepX;

                       //Correct the exact point a bit to match the initial force as near it can
                       var minForceIndex = -1;
                       var minForceDiff = 0;
                       var minDirX = 0;
                       var minDirY = 0;
                       var minCurX = 0;
                       var minCurY = 0;

                       curX -= 1*stepX;
                       curY -= 1*stepY;

                       for (var pointIndex = 0; pointIndex < 7; pointIndex++, curX += stepX, curY += stepY)
                       {
                           dirX = 0;
                           dirY = 0;

                           var forceSum = 0;
                           for (var j = 0; j < forces.length; j++)
                           {
                               var distX = curX - forces[j].pos[0];
                               var distY = curY - forces[j].pos[1];
                               var distanceSq = distX*distX + distY*distY;
                               var force = forces[j].attraction * attrMul / distanceSq;

                               var distanceFactor = force / Math.sqrt(distanceSq);


                               //Measure the initial force in order to match the equipotential surface points
                               forceSum += force;
                               dirX += distX * distanceFactor;
                               dirY += distY * distanceFactor;
                           }

                           var forceDiff = Math.abs(forceSum - totalForce);

                           if (minForceIndex == -1 || forceDiff < minForceDiff)
                           {
                               minForceIndex = pointIndex;
                               minForceDiff = forceDiff;
                               minDirX = dirX;
                               minDirY = dirY;
                               minCurX = curX;
                               minCurY = curY;
                           } else {
                               break;
                           }
                       }

                       //Set the corrected equipotential point
                       curX = minCurX;
                       curY = minCurY;
                       dirX = minDirX;
                       dirY = minDirY;

                       //Mark the containing block as filled with a surface line.
                       var indI = parseInt(curX/horizontalBlock);
                       var indJ = parseInt(curY/verticalBlock);
                       if (indI >= 0 && indI < fieldFilled.length)
                       {
                            if (indJ >= 0 && indJ < fieldFilled[indI].length)
                            {
                                fieldFilled[indI][indJ] = true;
                            }
                        }

                        //Add the dot to the line
                        //dots.push(curX, curY,0);
                        dots[dotCounter*3]=curX;
                        dots[dotCounter*3+1]=curY;
                        dots[dotCounter*3+2]=0;
                        dotCounter++;
                        
                        if(dots.length > 5)
                        {
                            //If got to the begining, a full circle has been made, terminate further iterations
                            if (indI == i && indJ == jj)
                            {
                                distX = dots[0] - curX;
                                distY = dots[1] - curY;
                                if (distX*distX + distY*distY <= 21.49)
                                {
                                    // dots.push(dots[0], dots[1],0);
                                    times = 0;
                                    circleTimes = 3;
                                }
                            }
                            //If got out of the area, terminate furhter iterations for this turn.
                            if (curX < -width/2 || curX > width/2 || curY < -height/2 || curY > height/2)
                            {
                                times=0;
                            }
                       }
                   }


                outNumPoints.set(dotCounter);
                outPoints.set(null);
                outPoints.set(dots);
                each.trigger();

                //   calculatedFields.push([totalForce, dots]);
                //   maxForce = Math.max(maxForce, Math.abs(totalForce));
               }


           }
       }
    }




    



    
};

