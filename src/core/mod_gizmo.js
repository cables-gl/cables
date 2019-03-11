
CABLES.htmlLine=function(parentElement,color)
{
    var line=null;
    function createLineElement(x, y, length, angle) {
        line = document.createElement("div");
        var styles = 'border: 1px solid '+color+'; '+
                   'width: ' + length + 'px; '+
                   'height: 0px; '+
                   '-moz-transform: rotate(' + angle + 'rad); '+
                   '-webkit-transform: rotate(' + angle + 'rad); '+
                   '-o-transform: rotate(' + angle + 'rad); '+
                   '-ms-transform: rotate(' + angle + 'rad); '+
                   'position: absolute; '+
                   'top: ' + y + 'px; '+
                   'left: ' + x + 'px; ';
        line.setAttribute('style', styles);  
        line.classList.add('gizmoline');
        return line;
    }
    
    function setPos(x, y, length, angle) {
        line.style.width=length + 'px';
        line.style.top= y + 'px';
        line.style.left= x + 'px';
        line.style['-moz-transform']='rotate(' + angle + 'rad)';
        line.style['-webkit-transform']='rotate(' + angle + 'rad)';
        line.style['-o-transform']='rotate(' + angle + 'rad)';
        line.style['-ms-transform']='rotate(' + angle + 'rad)';
        // line.setAttribute('style');
    }
    

    this.set=function(x1, y1, x2, y2)
    {
        var a = x1 - x2,
            b = y1 - y2,
            c = Math.sqrt(a * a + b * b);
    
        var sx = (x1 + x2) / 2,
            sy = (y1 + y2) / 2;
    
        var x = sx - c / 2,
            y = sy;
    
        var alpha = Math.PI - Math.atan2(-b, a);
    
        setPos(x, y, c, alpha);

    };
    

    
    
    this.hide=function()
    {
        if(line)line.style.display='none';
    };
    
    this.show=function()
    {
        if(line)line.style.display='block';
    };
    
    parentElement.appendChild(createLineElement(100, 100, 200, 200));
    this.hide();
    
            // this._eleCenter = document.createElement('div');
            // this._eleCenter.id="gizmo";
            // this._eleCenter.style.background="#fff";
            // this._eleCenter.style.opacity="0.5";
            // this._eleCenter.classList.add('gizmo');
            // container.appendChild(this._eleCenter);

            // document.body.appendChild(createLineElement(100, 100, 200, 200));
        
};


CABLES.Gizmo=function()
{
    this._eleCenter=null;
    this._eleX=null;
    this._eleY=null;

    this._params=null;
    this._origValue=0;
    this._dragSum=0;
    this._dir=1;
};



// CABLES.Gizmo.prototype.drawLine=function(x,y,z)
// {
//     var cgl=gui.scene().cgl;
//     cgl.gl.disable(cgl.gl.DEPTH_TEST);


//     if(!this.geom)
//     {
//         this.geom=new CGL.Geometry("gizmoline");
//         this.geom.vertices=[0,0,0,0,0,0,0];
//         this.geom.vertices.length=18;
//         this.mesh=new CGL.Mesh(cgl,this.geom);

//         this.shaderX=new CGL.Shader(cgl,'gizmo mat');
//         this.shaderX.setSource(this.shaderX.getDefaultVertexShader(),this.shaderX.getDefaultFragmentShader(1,0,0));
//         this.shaderX.glPrimitive=cgl.gl.LINES;

//         this.shaderY=new CGL.Shader(cgl,'gizmo mat');
//         this.shaderY.setSource(this.shaderY.getDefaultVertexShader(),this.shaderY.getDefaultFragmentShader(0,1,0));
//         this.shaderY.glPrimitive=cgl.gl.LINES;

//         this.shaderZ=new CGL.Shader(cgl,'gizmo mat');
//         this.shaderZ.setSource(this.shaderZ.getDefaultVertexShader(),this.shaderZ.getDefaultFragmentShader(0,0,1));
//         this.shaderZ.glPrimitive=cgl.gl.LINES;
//     }

//     var ind=0;




//     this.geom.vertices[ind++]=this._params.posX.get();
//     this.geom.vertices[ind++]=this._params.posY.get();
//     this.geom.vertices[ind++]=this._params.posZ.get();

//     this.geom.vertices[ind++]=this._params.posX.get()+x;
//     this.geom.vertices[ind++]=this._params.posY.get()+y;
//     this.geom.vertices[ind++]=this._params.posZ.get()+z;





//     var shader=this.shaderX;
//     if(y>0)shader=this.shaderY;
//     if(z>0)shader=this.shaderZ;

//     this.mesh.updateVertices(this.geom);

//     cgl.setShader(shader);

//     this.mesh.render(shader);

//     cgl.setPreviousShader();
//     cgl.gl.enable(cgl.gl.DEPTH_TEST);

// };


CABLES.Gizmo.prototype.getDir=function(x2,y2)
{
    var xd = this._params.x-x2;
    var yd = this._params.y-y2;
    var dist=(xd+yd)/2;

    // console.log('dist',dist);
    if(dist<0)return 1;
    return -1;

};

CABLES.Gizmo.tempParams={};

CABLES.Gizmo.prototype.set=function(params,cgl)
{
    if(!params)return this.setParams(params);

    if(!cgl && CABLES.UI) cgl=gui.scene().cgl;

    cgl.pushModelMatrix();
    function toScreen(trans)
    {
        var vp=cgl.getViewPort();
        var x=( vp[2]-( vp[2]  * 0.5 - trans[0] * vp[2] * 0.5 / trans[2] ));
        var y=( vp[3]-( vp[3]  * 0.5 + trans[1] * vp[3] * 0.5 / trans[2] ));
        
        return {x:x,y:y};
    }

    function distance(x1,y1,x2,y2)
    {
        var xd = x2-x1;
        var yd = y2-y1;
        return Math.sqrt(xd*xd + yd*yd);
    }
    
    var m=mat4.create();
    var pos=vec3.create();
    var trans=vec3.create();
    var transX=vec3.create();
    var transY=vec3.create();
    var transZ=vec3.create();
    
    mat4.translate(cgl.mvMatrix,cgl.mvMatrix, [params.posX.get(),params.posY.get(),params.posZ.get()]);
    mat4.multiply(m,cgl.vMatrix,cgl.mvMatrix);

    vec3.transformMat4(pos, [0,0,0], m);
    vec3.transformMat4(trans, pos, cgl.pMatrix);
    var zero=toScreen(trans);

    // normalize distance to gizmo handles
    vec3.transformMat4(pos, [1,0,0], m);
    vec3.transformMat4(transX, pos, cgl.pMatrix);
    var screenDist=toScreen(transX);
    var d1=distance(zero.x, zero.y, screenDist.x, screenDist.y);

    vec3.transformMat4(pos, [0,1,0], m);
    vec3.transformMat4(transX, pos, cgl.pMatrix);
    screenDist=toScreen(transX);
    var d2=distance(zero.x, zero.y, screenDist.x, screenDist.y);

    vec3.transformMat4(pos, [0,0,1], m);
    vec3.transformMat4(transX, pos, cgl.pMatrix);
    screenDist=toScreen(transX);
    var d3=distance(zero.x, zero.y, screenDist.x, screenDist.y);

    var d=Math.max(d3,Math.max(d1,d2));
    var w=1/(d+0.00000001)*50;
    this._multi=w;

    vec3.transformMat4(pos, [w,0,0], m);
    vec3.transformMat4(transX, pos, cgl.pMatrix);

    vec3.transformMat4(pos, [0,w,0], m);
    vec3.transformMat4(transY, pos, cgl.pMatrix);

    vec3.transformMat4(pos, [0,0,w], m);
    vec3.transformMat4(transZ, pos, cgl.pMatrix);
    
    var screenX=toScreen(transX);
    var screenY=toScreen(transY);
    var screenZ=toScreen(transZ);
    
    cgl.popModelMatrix();
    

    CABLES.Gizmo.tempParams.x=zero.x;
    CABLES.Gizmo.tempParams.y=zero.y;
    CABLES.Gizmo.tempParams.xx=screenX.x;
    CABLES.Gizmo.tempParams.xy=screenX.y;
    CABLES.Gizmo.tempParams.yx=screenY.x;
    CABLES.Gizmo.tempParams.yy=screenY.y;
    CABLES.Gizmo.tempParams.zx=screenZ.x;
    CABLES.Gizmo.tempParams.zy=screenZ.y;
    
    CABLES.Gizmo.tempParams.coord=trans;
    CABLES.Gizmo.tempParams.coordX=transX;
    CABLES.Gizmo.tempParams.coordY=transY;
    CABLES.Gizmo.tempParams.coordZ=transZ;
    
    CABLES.Gizmo.tempParams.posX=params.posX;
    CABLES.Gizmo.tempParams.posY=params.posY;
    CABLES.Gizmo.tempParams.posZ=params.posZ;
    CABLES.Gizmo.tempParams.dist=w;

    this.setParams(CABLES.Gizmo.tempParams);

};




CABLES.Gizmo.prototype.setParams=function(params)
{
    this._params=params;

    if(!this._eleCenter)
    {
        var container = gui.scene().cgl.canvas.parentElement;

        this._eleCenter = document.createElement('div');
        this._eleCenter.id="gizmo";

        this._eleCenter.style.background="#fff";
        this._eleCenter.style.opacity="0.9";
        // this._eleCenter.style['border-radius']="1130px";
        // this._eleCenter.style.transform='scale(2)';
        this._eleCenter.classList.add('gizmo');
        container.appendChild(this._eleCenter);

        this._eleX = document.createElement('div');
        this._eleX.id="gizmo";
        this._eleX.style.background="#f00";
        this._eleX.classList.add('gizmo');
        container.appendChild(this._eleX);

        this._eleY = document.createElement('div');
        this._eleY.id="gizmo";
        this._eleY.style.background="#0f0";
        this._eleY.classList.add('gizmo');
        container.appendChild(this._eleY);

        this._eleZ = document.createElement('div');
        this._eleZ.id="gizmo";
        this._eleZ.style.background="#00f";
        this._eleZ.classList.add('gizmo');
        container.appendChild(this._eleZ);


        this.lineX=new CABLES.htmlLine(container,'#f00');
        this.lineY=new CABLES.htmlLine(container,'#0f0');
        this.lineZ=new CABLES.htmlLine(container,'#00f');


        this._eleX.addEventListener("mousedown",function()
        {
            if(!this._params)return;
            this._draggingPort=this._params.posX;
            this._origValue=this._params.posX.get();
            this._dragSum=0;
            this.dragger(this._eleCenter);

            this._dir=this.getDir(this._params.xx,this._params.xy);
        }.bind(this));

        this._eleY.addEventListener("mousedown",function()
        {
            if(!this._params)return;
            this._draggingPort=this._params.posY;
            this._origValue=this._params.posY.get();
            this._dragSum=0;
            this.dragger(this._eleCenter);

            this._dir=this.getDir(this._params.yx,this._params.yy);
        }.bind(this));

        this._eleZ.addEventListener("mousedown",function()
        {
            if(!this._params)return;
            this._draggingPort=this._params.posZ;
            this._origValue=this._params.posZ.get();
            this._dragSum=0;
            this.dragger(this._eleCenter);
            this._dir=this.getDir(this._params.zx,this._params.zy);
        }.bind(this));
    }

    if(!params)
    {
        var self=this;
        setTimeout(function()
        {
            self._eleCenter.style.display="none";
            self._eleX.style.display="none";
            self._eleZ.style.display="none";
            self._eleY.style.display="none";
            
            self.lineX.hide();
            self.lineZ.hide();
            self.lineY.hide();
        },1);
        return;
    }

    this.lineX.show();
    this.lineZ.show();
    this.lineY.show();

    this._eleCenter.style.display="block";
    this._eleCenter.style.left=params.x+"px";
    this._eleCenter.style.top=params.y+"px";

    this._eleX.style.display="block";
    this._eleX.style.left=params.xx+"px";
    this._eleX.style.top=params.xy+"px";

    this._eleY.style.display="block";
    this._eleY.style.left=params.yx+"px";
    this._eleY.style.top=params.yy+"px";

    this._eleZ.style.display="block";
    this._eleZ.style.left=params.zx+"px";
    this._eleZ.style.top=params.zy+"px";

    this.lineX.set(params.x,params.y,params.xx,params.xy);
    this.lineY.set(params.x,params.y,params.yx,params.yy);
    this.lineZ.set(params.x,params.y,params.zx,params.zy);
};


CABLES.Gizmo.prototype.dragger=function(el)
{
    var isDown=false;
    var self=this;
    var incMode=0;

    function keydown(e)
    {
    }

    function down(e)
    {
        gui.setStateUnsaved();
        isDown=true;
        document.addEventListener('pointerlockchange', lockChange, false);
        document.addEventListener('mozpointerlockchange', lockChange, false);
        document.addEventListener('webkitpointerlockchange', lockChange, false);
        document.addEventListener('keydown', keydown, false);
        el.requestPointerLock = el.requestPointerLock || el.mozRequestPointerLock || el.webkitRequestPointerLock;
        if(el.requestPointerLock) el.requestPointerLock();
    }

    function up(e)
    {
        gui.setStateUnsaved();
        isDown=false;
        document.removeEventListener('pointerlockchange', lockChange, false);
        document.removeEventListener('mozpointerlockchange', lockChange, false);
        document.removeEventListener('webkitpointerlockchange', lockChange, false);
        document.removeEventListener('keydown', keydown, false);

        if(document.exitPointerLock)document.exitPointerLock();

        $( document ).unbind( "mouseup", up );
        $( document ).unbind( "mousedown", down );

        document.removeEventListener("mousemove", move, false);

        gui.patch().showOpParams(self._draggingPort.parent);
    }

    function move(e)
    {
        gui.setStateUnsaved();
        var v=(e.movementY+e.movementX)*(self._dir*((self._multi||1)/100));
        if(e.shiftKey)v*=0.025;
        self._dragSum+=v;
        self._draggingPort.set(self._origValue+self._dragSum);
    }

    function lockChange(e)
    {
        if (document.pointerLockElement === el || document.mozPointerLockElement === el || document.webkitPointerLockElement === el)
        {
            document.addEventListener("mousemove", move, false);
        }
        else
        {
            // escape clicked...
            self._draggingPort.set(self._origValue);
            up();
        }
    }

    $( document ).bind( "mouseup", up );
    $( document ).bind( "mousedown", down );
};
