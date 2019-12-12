
export { BoundingBox };

class BoundingBox
{
    constructor(geom)
    {

        this._max=[-Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE];
        this._min=[Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE];
        this._center=[];
        this._size=[];
        this._first=true;
        this._wireMesh=null;

        if(geom)this.apply(geom);
    }

    get maxAxis() { return this._maxAxis; }
    get size() { return this._size; }

    get x() { return this._center[0]; }
    get y() { return this._center[1]; }
    get z() { return this._center[2]; }

    get minX() { return this._min[0]; }
    get minY() { return this._min[1]; }
    get minZ() { return this._min[2]; }
    get maxX() { return this._max[0]; }
    get maxY() { return this._max[1]; }
    get maxZ() { return this._max[2]; }

    apply(geom)
    {
        if(!geom)
        {
            console.warn("[boundingbox] no geom/vertices",geom);
            return;
        }

        if(geom instanceof BoundingBox)
        {
            const bb=geom;
           
            this.applyPos(bb.maxX,bb.maxY,bb.maxZ);
            this.applyPos(bb.minX,bb.minY,bb.minZ);
        }
        else
        {
            var i = 0;
    
            for (i = 0; i < geom.vertices.length; i += 3)
                if (geom.vertices[i + 0] == geom.vertices[i + 0])
                    this.applyPos(geom.vertices[i + 0],geom.vertices[i + 1],geom.vertices[i + 2]);
        }
        this.calcCenterSize();
    }

    copy()
    {
        return new BoundingBox(this);
        
    }

    get changed()
    {
        return !(this._max[0]==-Number.MAX_VALUE && this._max[1]==-Number.MAX_VALUE && this._max[2]==-Number.MAX_VALUE);
    }

    applyPos(x,y,z)
    {
        if(this._first)
        {
            this._max[0] = x;
            this._max[1] = y;
            this._max[2] = z;
    
            this._min[0] = x;
            this._min[1] = y;
            this._min[2] = z;
            this._first=false;
            return;
        }
        this._max[0] = Math.max(this._max[0], x);
        this._max[1] = Math.max(this._max[1], y);
        this._max[2] = Math.max(this._max[2], z);

        this._min[0] = Math.min(this._min[0], x);
        this._min[1] = Math.min(this._min[1], y);
        this._min[2] = Math.min(this._min[2], z);

    }

    calcCenterSize()
    {
        this._size[0]=Math.abs(this._min[0])+Math.abs(this._max[0]);
        this._size[1]=Math.abs(this._min[1])+Math.abs(this._max[1]);
        this._size[2]=Math.abs(this._min[2])+Math.abs(this._max[2]);

        this._center[0]=(this._min[0]+this._max[0])/2;
        this._center[1]=(this._min[1]+this._max[1])/2;
        this._center[2]=(this._min[2]+this._max[2])/2;
        
        this._maxAxis = Math.max(this._size[2], Math.max(this._size[0], this._size[1]));
    }

    mulMat4(m)
    {
        vec3.transformMat4(this._max,this._max,m);
        vec3.transformMat4(this._min,this._min,m);
        this.calcCenterSize();
    }

    render(cgl,shader)
    {
        if(!this._wireMesh) this._wireMesh=new CGL.WireCube(cgl);

        cgl.pushModelMatrix();
        mat4.translate(cgl.mMatrix,cgl.mMatrix, this._center);
        this._wireMesh.render(cgl,this._size[0]/2,this._size[1]/2,this._size[2]/2 );
        cgl.popModelMatrix();
    }
}