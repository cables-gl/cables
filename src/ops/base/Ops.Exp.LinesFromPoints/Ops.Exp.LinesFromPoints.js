
var pointsPort = op.inArray("Points");
var linesPort = op.outArray("Lines");

pointsPort.onChange = update;

function update() {
    var points = pointsPort.get();
    var lineArray = [];
    if(!points) { return; }
    for(var i=0; i<points.length-3; i+=3) {
        for(var j=i+3; j<points.length; j+=3) {
            //console.log(distance(points, i, j));    
            lineArray.push(
                points[i], 
                points[i+1], 
                points[i+2],
                points[j], 
                points[j+1], 
                points[j+2]
            );
        }
    }
    linesPort.set(lineArray);
}

function distance(points, ia, ib) {
    var dx = points[ib] - points[ia];
    var dy = points[ib+1] - points[ia+1];
    var dz = points[ib+2] - points[ia+2];
    
    var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));
    
    return dist;
}

