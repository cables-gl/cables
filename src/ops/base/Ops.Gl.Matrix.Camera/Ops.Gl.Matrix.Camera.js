var render=op.addInPort(new Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

/* Inputs */
// projection | prespective & ortogonal
var projectionMode=op.addInPort(new Port(op,"projection mode",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:['prespective','ortogonal']}));
var zNear=op.addInPort(new Port(op,"frustum near",CABLES.OP_PORT_TYPE_VALUE ));
var zFar=op.addInPort(new Port(op,"frustum far",CABLES.OP_PORT_TYPE_VALUE ));

var fov=op.addInPort(new Port(op,"fov",CABLES.OP_PORT_TYPE_VALUE ));

var autoAspect=op.inValueBool("Auto Aspect Ratio",true);
var aspect=op.inValue("Aspect Ratio");

// look at camera
var eyeX=op.addInPort(new Port(op,"eye X"));
var eyeY=op.addInPort(new Port(op,"eye Y"));
var eyeZ=op.addInPort(new Port(op,"eye Z"));

var centerX=op.addInPort(new Port(op,"center X"));
var centerY=op.addInPort(new Port(op,"center Y"));
var centerZ=op.addInPort(new Port(op,"center Z"));

// camera transform and movements
var posX=op.addInPort(new Port(op,"truck"),0);
var posY=op.addInPort(new Port(op,"boom"),0);
var posZ=op.addInPort(new Port(op,"dolly"),0);

var rotX=op.addInPort(new Port(op,"tilt"),0);
var rotY=op.addInPort(new Port(op,"pan"),0);
var rotZ=op.addInPort(new Port(op,"roll"),0);


/* Outputs */
var outAsp=op.addOutPort(new Port(op,"Aspect",CABLES.OP_PORT_TYPE_VALUE));
var outArr=op.outArray("Look At Array");


/* logic */
var cgl=op.patch.cgl;

// prespective
projectionMode.set('prespective');
zNear.set(0.01);
zFar.set(500.0);
fov.set(45);
aspect.set(1);

var asp=0;

// look at camera
centerX.set(0);
centerY.set(0);
centerZ.set(0);

eyeX.set(0);
eyeY.set(0);
eyeZ.set(5);

var vUp=vec3.create();
var vEye=vec3.create();
var vCenter=vec3.create();
var transMatrix=mat4.create();
mat4.identity(transMatrix);

var arr=[];

// Transform and move
var vPos=vec3.create();
var transMatrixMove=mat4.create();
mat4.identity(transMatrixMove);

var updateCameraMovementMatrix=true;

render.onTriggered=function() {
    // Aspect ration
    if(!autoAspect.get()) asp=aspect.get();
    else asp=cgl.getViewPort()[2]/cgl.getViewPort()[3];
    outAsp.set(asp);
    
    // translation (truck, boom, dolly)
    cgl.pushViewMatrix();
    
    if (updateCameraMovementMatrix) {
        mat4.identity(transMatrixMove);
        
        vec3.set(vPos, posX.get(),posY.get(),posZ.get());
        if(posX.get()!==0.0 || posY.get()!==0.0 || posZ.get()!==0.0)
            mat4.translate(transMatrixMove,transMatrixMove, vPos);
        
        if(rotX.get()!==0)
            mat4.rotateX(transMatrixMove,transMatrixMove, rotX.get()*CGL.DEG2RAD);
        if(rotY.get()!==0)
            mat4.rotateY(transMatrixMove,transMatrixMove, rotY.get()*CGL.DEG2RAD);
        if(rotZ.get()!==0)
            mat4.rotateZ(transMatrixMove,transMatrixMove, rotZ.get()*CGL.DEG2RAD);
        
        updateCameraMovementMatrix = false;
    }
    
    mat4.multiply(cgl.vMatrix,cgl.vMatrix,transMatrixMove);
    
    // projection (prespective / ortogonal)
    cgl.pushPMatrix();
    
    // look at
    cgl.pushViewMatrix();
 
    if (projectionMode.get()=='prespective') {
        mat4.perspective(
            cgl.pMatrix,
            fov.get()*0.0174533,
            asp, 
            zNear.get(), 
            zFar.get()
        );
    } else if (projectionMode.get()=='ortogonal') {
        mat4.ortho(
            cgl.pMatrix,
            -1 * (fov.get() / 14),
             1 * (fov.get() / 14),
            -1 * (fov.get() / 14) / asp,
             1 * (fov.get() / 14) / asp,
            zNear.get(), 
            zFar.get()
        );
    }
    
    
	arr[0]=eyeX.get();
	arr[1]=eyeY.get();
	arr[2]=eyeZ.get();

	arr[3]=centerX.get();
	arr[4]=centerY.get();
	arr[5]=centerZ.get();

	arr[6]=0;
	arr[7]=1;
	arr[8]=0;

	outArr.set(arr);

	vec3.set(vUp, 0, 1, 0);
	vec3.set(vEye, eyeX.get(),eyeY.get(),eyeZ.get());
	vec3.set(vCenter, centerX.get(),centerY.get(),centerZ.get());

	mat4.lookAt(transMatrix, vEye, vCenter, vUp);

	mat4.multiply(cgl.vMatrix,cgl.vMatrix,transMatrix);

	trigger.trigger();

	cgl.popViewMatrix();
	cgl.popPMatrix();

	cgl.popViewMatrix();
    
    
	// GUI for dolly, boom and truck
	if(CABLES.UI && gui.patch().isCurrentOp(op)) 
		gui.setTransformGizmo({
			posX:posX,
			posY:posY,
			posZ:posZ
		});
};

var updateUI=function() {
	if(!autoAspect.get()) {
		aspect.setUiAttribs({hidePort:false,greyout:false});
	} else {
		aspect.setUiAttribs({hidePort:true,greyout:true});
	}
};

var cameraMovementChanged=function() {
	updateCameraMovementMatrix = true;
};

// listeners
posX.onChange=cameraMovementChanged;
posY.onChange=cameraMovementChanged;
posZ.onChange=cameraMovementChanged;

rotX.onChange=cameraMovementChanged;
rotY.onChange=cameraMovementChanged;
rotZ.onChange=cameraMovementChanged;

autoAspect.onChange=updateUI;
updateUI();


