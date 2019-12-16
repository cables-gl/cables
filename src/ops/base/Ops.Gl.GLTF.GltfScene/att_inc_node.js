
var gltfNode=class
{
    constructor(node,gltf)
    {
        this.isChild=node.isChild||false;
        this.name=node.name;
        this.hidden=false;
        this.mat=mat4.create();
        this._animMat=mat4.create();
        this._tempMat=mat4.create();
        this._tempQuat=quat.create();
        this.mesh=null;
        this.children=[];
        this._node=node;

        if(node.translation) mat4.translate(this.mat,this.mat,node.translation);

        if(node.rotation)
        {
            var rotmat=mat4.create();
            this._rot=node.rotation;

            mat4.fromQuat(rotmat,node.rotation);
            mat4.mul(this.mat,this.mat,rotmat);
        }

        if(node.scale)
        {
            this._scale=node.scale;
            mat4.scale(this.mat,this.mat,this._scale);
        }

        if(node.hasOwnProperty("mesh"))
        {
            this.mesh=gltf.meshes[node.mesh];
        }

        if(node.children)
        {
            for(var i=0;i<node.children.length;i++)
            {
                gltf.json.nodes[i].isChild=true;
                if(gltf.nodes[node.children[i]]) gltf.nodes[node.children[i]].isChild=true;
                this.children.push(node.children[i]);
            }
        }
    }

    calcBounds(gltf,mat,bounds)
    {
        mat=mat||mat4.create();

        if(this.mat)
            mat4.mul(mat,mat,this.mat);

        if(this.mesh)
        {
            var bb=this.mesh.bounds.copy();
            bb.mulMat4(mat);
            bounds.apply(bb);
        }

        for(var i=0;i<this.children.length;i++)
        {
            if(gltf.nodes[this.children[i]] && gltf.nodes[this.children[i]].calcBounds)
                bounds.apply(gltf.nodes[this.children[i]].calcBounds(gltf,mat,bounds));
        }

        if(bounds.changed)return bounds;
        else return null;
    }

    setAnim(path,anims)
    {
        if(path=="translation")this._animTrans=anims;
        else if(path=="rotation")this._animRot=anims;
        else if(path=="scale")this._animScale=anims;
        else console.warn("unknown anim path",path,anims);
    }

    transform(cgl,_time)
    {
        if(!this._animTrans)
        {
            mat4.mul(cgl.mMatrix,cgl.mMatrix,this.mat);
        }
        else
        {
            mat4.identity(this._animMat);
            if(this._animTrans)
            {
                mat4.translate(this._animMat,this._animMat,[
                    this._animTrans[0].getValue(time),
                    this._animTrans[1].getValue(time),
                    this._animTrans[2].getValue(time)]);
            }
            else if(node.translation) mat4.translate(this._animMat,this._animMat,node.translation);

            if(this._animRot)
            {
                CABLES.TL.Anim.slerpQuaternion(time,this._tempQuat,this._animRot[0],this._animRot[1],this._animRot[2],this._animRot[3]);

                mat4.fromQuat(this._tempMat,this._tempQuat);
                mat4.mul(this._animMat,this._animMat,this._tempMat);
            }
            else if(this._rot)
            {
                var rotmat=mat4.create();
                mat4.fromQuat(rotmat,this._rot);
                mat4.mul(this._animMat,this._animMat,rotmat);
            }

            if(this._animScale)
            {
                mat4.scale(this._animMat,this._animMat,[
                    this._animScale[0].getValue(time),
                    this._animScale[1].getValue(time),
                    this._animScale[2].getValue(time)]);
            } else if(this._scale) mat4.scale(this._animMat,this._animMat,this._scale);

            mat4.mul(cgl.mMatrix,cgl.mMatrix,this._animMat);
        }
    }

    render(cgl,ignoreTransform,ignoreMaterial,_time)
    {
        if(this.hidden)return;
        cgl.pushModelMatrix();

        if(!ignoreTransform) this.transform(cgl,_time||time);

        if(this.mesh) this.mesh.render(cgl,ignoreMaterial);

        for(var i=0;i<this.children.length;i++) gltf.nodes[this.children[i]].render(cgl,ignoreTransform,ignoreMaterial,_time);

        cgl.popModelMatrix();
    }

};