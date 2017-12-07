
var inX=op.inValue("X");
var inY=op.inValue("Y");

var outX=op.outValue("Result X");
var outY=op.outValue("Result Y");

// inX.onChange=calc;
// inY.onChange=calc;

var mat=mat4.create();

var cgl=op.patch.cgl;


var ivm=mat4.create();
var pm=mat4.create();
var ipm=mat4.create();
var mat=mat4.create();
var dir=vec4.create();

var update=op.inFunction("update");
update.onTriggered=calc;

function calc()
{
    // pm=cgl.pMatrix;
    // vm=cgl.vMatrix;
    
    // mat4.invert(ivm,cgl.vMatrix);
    
    mat=cgl.mvMatrix;
    // mat4.mul(pm,cgl.mvMatrix,ivm);
    
    mat4.invert(ipm,pm);
    mat4.mul(mat,pm,ipm);
    mat4.transpose(mat,mat);
    
    vec4.transformMat4(dir,[inX.get(),inY.get(),0.5,1],mat);
    
    var m=mat[3] + mat[7] + mat[11] + mat[15];
    vec4.divide(dir,dir,[m,m,m,m]);
    
    dir[1]-=2.0;


// https://stackoverflow.com/questions/31613832/converting-screen-2d-to-world-3d-coordinates
// mat = worldMatrix * inverse(ProjectionMatrix)
// dir = transpose(mat) * <x_screen, y_screen, 0.5, 1>

// dir /= mat[3] + mat[7] + mat[11] + mat[15]
// dir -= camera.position

    
    
    
var pos=vec3.create();
var empty=vec3.create();
vec3.transformMat4(pos, empty, cgl.vMatrix);
dir[0]-=pos[0];
dir[1]-=pos[1];
dir[2]-=pos[2];

    outX.set(dir[0]/cgl.canvas.clientWidth/2);
    outY.set(dir[1]/cgl.canvas.clientHeight/2);
    
    
    
    
    // pm=cgl.pMatrix;
    // vm=cgl.vMatrix;

    // var x = 2.0 * inX.get() / cgl.canvas.clientWidth - 1;
    // var y = - 2.0 * inY.get() / cgl.canvas.clientHeight + 1;
    
    // var point3d=vec3.fromValues(x,y,0);
    
    // mat4.mul(mat,pm,vm);

    // mat4.invert(mat,mat);
    
    // vec3.transformMat4(point3d, point3d, mat);
    
    // outX.set(point3d[0]*10);
    // outY.set(point3d[1]*10);
    

    // Matrix4 viewProjectionInverse = inverse(projectionMatrix * viewMatrix);
    // Point3D point3D = new Point3D(x, y, 0); 
    // return viewProjectionInverse.multiply(point3D);
}
