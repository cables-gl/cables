op.name="ScreenPosTo3d";

var inX=op.inValue("X");
var inY=op.inValue("Y");



var outX=op.outValue("Result X");
var outY=op.outValue("Result Y");

inX.onChange=calc;
inY.onChange=calc;

var mat=mat4.create();

var cgl=op.patch.cgl;
function calc()
{
        // int height, Matrix viewMatrix, Matrix projectionMatrix) {

    var x = 2.0 * inX.get() / cgl.canvas.clientWidth - 1;
    var y = - 2.0 * inY.get() / cgl.canvas.clientHeight + 1;
    
    var point3d=vec3.fromValues(x,y,0);
    
    mat4.mul(mat,cgl.pMatrix,cgl.vMatrix);

    mat4.invert(mat,mat);
    
    vec3.transformMat4(point3d, point3d, mat);
    
    outX.set(point3d[0]*10);
    outY.set(point3d[1]*10);
    

    // Matrix4 viewProjectionInverse = inverse(projectionMatrix * viewMatrix);
    // Point3D point3D = new Point3D(x, y, 0); 
    // return viewProjectionInverse.multiply(point3D);
}
