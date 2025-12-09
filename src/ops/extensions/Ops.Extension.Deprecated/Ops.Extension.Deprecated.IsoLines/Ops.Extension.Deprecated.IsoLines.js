op.name = "IsoLines";

// http://hsilomedus.me/wp-content/uploads/d3electricField/electricField.html

let exec = op.inTrigger("Exec");
let each = op.outTrigger("Each");

let inWidth = op.inValue("Width");
let inHeight = op.inValue("Height");

let inFieldsX = op.inValue("Fields X");
let inFieldsY = op.inValue("Fields Y");

let maxPoints = op.inValue("Max LinePoints", 500);

let outPoints = op.outArray("Points");
let outNumPoints = op.outValue("Num Points");

let dots = new Float32Array(6000);

let fieldFilled = [];

exec.onTriggered = function ()
{
    for (var i = 0; i < 10; i++)
    {
        fieldFilled[i] = [];
        for (var j = 0; j < 10; j++)
            fieldFilled[i][j] = null;
    }

    let width = inWidth.get();
    let height = inHeight.get();

    let horizontalBlock = width / inFieldsX.get();
    let verticalBlock = height / inFieldsY.get();

    let horizontalBlockHalf = horizontalBlock / 2;
    let verticalBlockHalf = verticalBlock / 2;

    let forces = CABLES.forceFieldForces;

    let calculatedFields = [];
    let maxForce = 0;
    let attrMul = 0.3333;

    for (var i = 0; i < fieldFilled.length; i++)
    {
        var direction = 1;
        for (let jj = 0; jj < fieldFilled[i].length; jj++)
        {
            if (!fieldFilled[i][jj])
            {
                // create a path here
                // Iterate at most 2 times in case the surface gets out of the area
                for (let circleTimes = 0; circleTimes < 3; circleTimes += 2)
                {
                    // Define the center of the current block as a starting point of the surface
                    let curX = (i * horizontalBlock + horizontalBlockHalf) - width / 2;
                    let curY = (jj * verticalBlock + verticalBlockHalf) - height / 2;

                    var direction = 1 - circleTimes;

                    let dotCounter = 0;
                    dots[0] = curX;
                    dots[1] = curY;
                    dots[2] = 0;
                    dotCounter++;

                    // Superposition the fields from all forces, and get the resulting force vector
                    let dirX = 0;
                    let dirY = 0;
                    let totalForce = 0;
                    for (var j = 0; j < forces.length; j++)
                    {
                        var distX = curX - forces[j].pos[0];
                        var distY = curY - forces[j].pos[1];
                        var distanceSq = distX * distX + distY * distY;
                        var force = forces[j].attraction * attrMul / distanceSq;

                        var distanceFactor = force / Math.sqrt(distanceSq);

                        // Measure the initial force in order to match the equipotential surface points
                        totalForce += force;
                        dirX += distX * distanceFactor;
                        dirY += distY * distanceFactor;
                    }

                    // Maximum 2000 dots per surface line
                    let times = maxPoints.get();
                    while (times-- > 0)
                    {
                        let dirTotal = Math.sqrt(dirX * dirX + dirY * dirY);
                        let stepX = dirX / dirTotal * 0.005;
                        let stepY = dirY / dirTotal * 0.005;
                        // The equipotential surface moves normal to the force vector
                        curX += direction * 1.0 * stepY;
                        curY -= direction * 1.0 * stepX;

                        // Correct the exact point a bit to match the initial force as near it can
                        let minForceIndex = -1;
                        let minForceDiff = 0;
                        let minDirX = 0;
                        let minDirY = 0;
                        let minCurX = 0;
                        let minCurY = 0;

                        curX -= 1 * stepX;
                        curY -= 1 * stepY;

                        for (let pointIndex = 0; pointIndex < 7; pointIndex++, curX += stepX, curY += stepY)
                        {
                            dirX = 0;
                            dirY = 0;

                            let forceSum = 0;
                            for (var j = 0; j < forces.length; j++)
                            {
                                var distX = curX - forces[j].pos[0];
                                var distY = curY - forces[j].pos[1];
                                var distanceSq = distX * distX + distY * distY;
                                var force = forces[j].attraction * attrMul / distanceSq;

                                var distanceFactor = force / Math.sqrt(distanceSq);

                                // Measure the initial force in order to match the equipotential surface points
                                forceSum += force;
                                dirX += distX * distanceFactor;
                                dirY += distY * distanceFactor;
                            }

                            let forceDiff = Math.abs(forceSum - totalForce);

                            if (minForceIndex == -1 || forceDiff < minForceDiff)
                            {
                                minForceIndex = pointIndex;
                                minForceDiff = forceDiff;
                                minDirX = dirX;
                                minDirY = dirY;
                                minCurX = curX;
                                minCurY = curY;
                            }
                            else
                            {
                                break;
                            }
                        }

                        // Set the corrected equipotential point
                        curX = minCurX;
                        curY = minCurY;
                        dirX = minDirX;
                        dirY = minDirY;

                        // Mark the containing block as filled with a surface line.
                        let indI = parseInt(curX / horizontalBlock);
                        let indJ = parseInt(curY / verticalBlock);
                        if (indI >= 0 && indI < fieldFilled.length)
                        {
                            if (indJ >= 0 && indJ < fieldFilled[indI].length)
                            {
                                fieldFilled[indI][indJ] = true;
                            }
                        }

                        // Add the dot to the line
                        // dots.push(curX, curY,0);
                        dots[dotCounter * 3] = curX;
                        dots[dotCounter * 3 + 1] = curY;
                        dots[dotCounter * 3 + 2] = 0;
                        dotCounter++;

                        if (dots.length > 5)
                        {
                            // If got to the begining, a full circle has been made, terminate further iterations
                            if (indI == i && indJ == jj)
                            {
                                distX = dots[0] - curX;
                                distY = dots[1] - curY;
                                if (distX * distX + distY * distY <= 21.49)
                                {
                                    // dots.push(dots[0], dots[1],0);
                                    times = 0;
                                    circleTimes = 3;
                                }
                            }
                            // If got out of the area, terminate furhter iterations for this turn.
                            if (curX < -width / 2 || curX > width / 2 || curY < -height / 2 || curY > height / 2)
                            {
                                times = 0;
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
