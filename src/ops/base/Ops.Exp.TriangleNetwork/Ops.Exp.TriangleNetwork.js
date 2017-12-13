op.name="TriangleNetwork";

// in ports
var pointsPort = op.inArray("Points");
var maxDistancePort = op.inValue("Max Distance", 0.4);
var maxTrianglesPerPointPort = op.inValue("Max Triangles Per Point", 2);
var linesProbabilityPort = op.inValue("Line Probability", 0.09);
var holeProbabilityPort = op.inValue("Hole Probability", 0.3);

// out ports
var trianglesPort = op.outArray("Triangles");
var linesPort = op.outArray("Lines");

pointsPort.onChange = update;
maxDistancePort.onChange = update;
maxTrianglesPerPointPort.onChange = update;
linesProbabilityPort.onChange = update;
holeProbabilityPort.onChange = update;


var unusedConnections = []; // two-dim array, will contain connections, which are not used for a triangle, [[ia, ib], [ib, ic]], does not contain all

// TODO: Error checking for inputs

/**
 * Called when an input changes
 */
function update() {
    var startTime=CABLES.now();
    var points = pointsPort.get();
    if(!points) { return; }
    unusedConnections = []; // clear unusedConnections
    var connections = getConnections(points);
    //op.log("points", points);
    //op.log("connectionsss", connections);
    var triangles = getTriangles(points, connections);
    trianglesPort.set(triangles);
    //op.log("triangles", triangles);
    // op.log("unusedConnections", unusedConnections);
    var flatConnections = getFlatPoinsConnectionArray(points, unusedConnections);
    linesPort.set(flatConnections);
}

/**
 * [[ia, ib], [ic, id]] -> [xa, ya, za, xb, yb, zb, …]
 */
function getFlatPoinsConnectionArray(points, connections) {
    var ret = [];
    //var probability = linesProbabilityPort.get();
    connections.forEach(function(c) {
        //if(Math.random() < probability) {
            ret.push(
                points[c[0]],
                points[c[0]+1],
                points[c[0]+2],
                points[c[1]],
                points[c[1]+1],
                points[c[1]+2]
            );   
        //}
    });
    return ret;
}

/**
 * Returns indexes of connected points, e.g. [[0, 3], [0, 6]]
 */
function getConnections(points) {
    var connections = [];
    for(var i=0; i<points.length-3; i+=3) {
        for(var j=i+3; j<points.length; j+=3) {
            var dist = distance(points, i, j);
            // console.log(dist);    
            if(dist <= maxDistancePort.get()) {
                connections.push([i, j]);    
            }
        }
    }
    return connections;
}

/**
 * Returns all triangles, respects maxTrianglesPerPointPort
 */
function getTriangles(points, connections) {
    var triangles = [];
    var trianglesPerPoint = {};
    var holeProbability = holeProbabilityPort.get();
    //op.log("connections", connections);
    for(var i=0; i<connections.length; i++) {
        var pointCons = getConnectionsForPoint(
            connections[i][0], 
            connections
        );
        //op.log("pointCons", pointCons);
        var pointTriangles = getTrianglesForPointConnection(
            connections[i][0], 
            pointCons, 
            connections
        );
        //op.log("pointTriangles", pointTriangles);
        for(var j=0; j<pointTriangles.length; j++) {
            var pt = pointTriangles[j];
            pt.sort();
            //op.log("pointTriangle", pointTriangle);
            if(!triangleExists(triangles, pt)) {
                var maxTrianglesPerPoint = maxTrianglesPerPointPort.get();
                if(Math.random() > holeProbability) {
                    if(maxTrianglesPerPoint < 0) { maxTrianglesPerPoint = 0; }// TODO: Print Warning}
                    if(
                        (!trianglesPerPoint[pt[0]] || 
                        trianglesPerPoint[pt[0]] <= maxTrianglesPerPoint) && 
                        (!trianglesPerPoint[pt[1]] || 
                        trianglesPerPoint[pt[1]] <= maxTrianglesPerPoint) &&
                        (!trianglesPerPoint[pt[2]] ||
                        trianglesPerPoint[pt[2]] <= maxTrianglesPerPoint)
                    ) {
                        triangles.push(pt);     
                        if(!trianglesPerPoint[pt[0]]) trianglesPerPoint[pt[0]] = 0;
                        if(!trianglesPerPoint[pt[1]]) trianglesPerPoint[pt[1]] = 0;
                        if(!trianglesPerPoint[pt[2]]) trianglesPerPoint[pt[2]] = 0;
                        trianglesPerPoint[pt[0]] += 1;
                        trianglesPerPoint[pt[1]] += 1;
                        trianglesPerPoint[pt[2]] += 1;
                        // op.log("trianglesPerPoint", trianglesPerPoint);
                    }    
                }
            }
        }
    }
    var trianglesFlat=[];
    trianglesFlat.length=trianglesFlat.length*9;
    
    for(var ti=0;ti<triangles.length;ti++)
    {
        trianglesFlat[ti*9+0]=points[triangles[ti][0]];
        trianglesFlat[ti*9+1]=points[triangles[ti][0]+1];
        trianglesFlat[ti*9+2]=points[triangles[ti][0]+2];
        trianglesFlat[ti*9+3]=points[triangles[ti][1]];
        trianglesFlat[ti*9+4]=points[triangles[ti][1]+1];
        trianglesFlat[ti*9+5]=points[triangles[ti][1]+2];
        trianglesFlat[ti*9+6]=points[triangles[ti][2]];
        trianglesFlat[ti*9+7]=points[triangles[ti][2]+1];
        trianglesFlat[ti*9+8]=points[triangles[ti][2]+2];
    }
    // triangles.forEach(function(t) {
    //     trianglesFlat.push(
    //             points[t[0]],    
    //             points[t[0]+1],
    //             points[t[0]+2],
    //             points[t[1]],    
    //             points[t[1]+1],
    //             points[t[1]+2],
    //             points[t[2]],    
    //             points[t[2]+1],
    //             points[t[2]+2]
    //         );
    // });
    return trianglesFlat;
}

/**
 * Checks if triangle exists in triangles
 * All entries in triangles must be sorted before, as well as triangle
 */
function triangleExists(triangles, triangle) {
    //triangle.sort();
    
    for(var i=0; i<triangles.length; i++) {
        var t = triangles[i];
        //t.sort();

        if( t[0] === triangle[0] && t[1] === triangle[1] && t[2] === triangle[2] ) {
            return true;    
        }
    }
    return false;
}

/**
 * Returns an array of triangles which a point forms, e.g. [[0, 1, 2], [0, 3, 4], …]
 */
function getTrianglesForPointConnection(ia, iaCons, allCons) {
    //op.log("getTrianglesForPointConnection -----------------------");
    if(!iaCons || iaCons.length === 0) { return null; }
    var pointTriangles = [];
    var probability = linesProbabilityPort.get();
    //op.log("All Connections: ", allCons);
    //op.log("Point: ", ia);
    //op.log("Connections from point: ", iaCons);
    iaCons.forEach(function(ib) {
        var ibCons = getConnectionsForPoint(ib, allCons);
        ibCons.forEach(function(ic) {
            if(hasConnection(allCons, ic, ia)) {
                pointTriangles.push([
                    ia, 
                    ib, 
                    ic
                ]);
            } else {
                if(ia && ic && ia !== ic && !hasConnection(unusedConnections, ia, ic)) {
                   if(Math.random() < probability) {
                        //unusedConnections.push([ia, ic]);     
                   } 
                }
            }
        });
        //if(ibCons.length === 1 || ibCons.length === 2) {
        //if(ibCons.length === 1) {
        if(ibCons.length <= 3 && Math.random() < probability) {
            if(ia && ib && ia !== ib && !hasConnection(unusedConnections, ia, ib)) {
                if(Math.random() < probability * 7) { // increase chances for loose ends
                        unusedConnections.push([ia, ib]);
                   } 
            }
        }
    });
    //op.log("--------------------------------------------");
    return pointTriangles;
}

/**
 * Checks if the connection array has a connection [ia, ib] 
 * ia must be smaller than ib
 */
function hasConnection(connections, ia, ib) {
    for(var i=0; i<connections.length; i++) {
        if((connections[i][0] === ia && connections[i][1] === ib) ||
           (connections[i][0] === ib && connections[i][1] === ia)) {
            return true;
        }
    }
    return false;
}

function getConnectionsForPoint(ia, connections) {
    var con = [];
    for(var i=0; i<connections.length; i++) {
        // TODO: Maybe check if points are equal, exclude then
        if(connections[i][0] === ia) {
            con.push(connections[i][1]);
        } else if(connections[i][1] === ia) {
            con.push(connections[i][0]);
        }
    }
    return con;
}

/**
 * Calculates the distance between point ia and ib
 * @param points Flat array of points: [x1, y1, z1, x2, y2, z2, …]
 * @param ia Index of the x-cordinate of point A in the points array
 * @param ib Index of the x-cordinate of point B in the points array
 */
function distance(points, ia, ib) {
    var dx = points[ib] - points[ia];
    var dy = points[ib+1] - points[ia+1];
    var dz = points[ib+2] - points[ia+2];
    
    var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));
    
    return dist;
}
