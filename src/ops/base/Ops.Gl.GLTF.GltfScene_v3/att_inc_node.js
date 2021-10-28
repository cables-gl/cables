const gltfNode = class
{
    constructor(node, gltf)
    {
        this.isChild = node.isChild || false;
        this.name = node.name;
        if (node.hasOwnProperty("camera")) this.camera = node.camera;
        this.hidden = false;
        this.mat = mat4.create();
        this._animMat = mat4.create();
        this._tempMat = mat4.create();
        this._tempQuat = quat.create();
        this._tempRotmat = mat4.create();
        this.mesh = null;
        this.children = [];
        this._node = node;
        this._gltf = gltf;
        this.absMat = mat4.create();
        this.addTranslate = null;
        this.updateMatrix();
        this._animActions={};
    }

    get skin()
    {
        if (this._node.hasOwnProperty("skin")) return this._node.skin;
        else return -1;
    }

    hasSkin()
    {
        if (this._node.hasOwnProperty("skin")) return this._gltf.json.skins[this._node.skin].name || "unknown";
        return false;
    }

    updateMatrix()
    {
        mat4.identity(this.mat);
        if (this._node.translation) mat4.translate(this.mat, this.mat, this._node.translation);

        if (this._node.rotation)
        {
            const rotmat = mat4.create();
            this._rot = this._node.rotation;

            mat4.fromQuat(rotmat, this._node.rotation);
            mat4.mul(this.mat, this.mat, rotmat);
        }

        if (this._node.scale)
        {
            this._scale = this._node.scale;
            mat4.scale(this.mat, this.mat, this._scale);
        }

        if (this._node.hasOwnProperty("mesh"))
        {
            this.mesh = this._gltf.meshes[this._node.mesh];
        }

        if (this._node.children)
        {
            for (let i = 0; i < this._node.children.length; i++)
            {
                this._gltf.json.nodes[i].isChild = true;
                if (this._gltf.nodes[this._node.children[i]]) this._gltf.nodes[this._node.children[i]].isChild = true;
                this.children.push(this._node.children[i]);
            }
        }
    }

    unHide()
    {
        this.hidden = false;
        for (let i = 0; i < this.children.length; i++)
            if (this.children[i].unHide) this.children[i].unHide();
    }

    calcBounds(gltf, mat, bounds)
    {
        const localMat = mat4.create();

        if (mat) mat4.copy(localMat, mat);
        if (this.mat) mat4.mul(localMat, localMat, this.mat);

        if (this.mesh)
        {
            const bb = this.mesh.bounds.copy();
            bb.mulMat4(localMat);
            bounds.apply(bb);

            if (bounds.changed)
            {
                boundingPoints.push(bb._min[0] || 0, bb._min[1] || 0, bb._min[2] || 0);
                boundingPoints.push(bb._max[0] || 0, bb._max[1] || 0, bb._max[2] || 0);
            }
        }

        for (let i = 0; i < this.children.length; i++)
        {
            if (gltf.nodes[this.children[i]] && gltf.nodes[this.children[i]].calcBounds)
            {
                const b = gltf.nodes[this.children[i]].calcBounds(gltf, localMat, bounds);

                bounds.apply(b);
            }
        }

        if (bounds.changed) return bounds;
        else return null;
    }


    setAnimAction(name)
    {
        if(name && !this._animActions[name]) return console.log("no action found: ",name);

        for(let path in this._animActions[name])
        {
            if (path == "translation") this._animTrans =this._animActions[name][path];
            else if (path == "rotation") this._animRot =this._animActions[name][path];
            else if (path == "scale") this._animScale =this._animActions[name][path];
            else console.warn("unknown anim path", path,this._animActions[name][path]);
        }

    }

    setAnim(path,name, anims)
    {
        this._animActions[name]=this._animActions[name]||{};

        if(this._animActions[name][path])op.warn("animation action path already exists",name,path,this._animActions[name][path]);

        this._animActions[name][path]=anims;

        if (path == "translation") this._animTrans = anims;
        else if (path == "rotation") this._animRot = anims;
        else if (path == "scale") this._animScale = anims;
        else console.warn("unknown anim path", path, anims);
    }

    modelMatLocal()
    {
        return this._animMat||this.mat;
    }

    modelMatAbs()
    {
        return this.absMat;
    }

    transform(cgl, _time)
    {
        if (!_time)_time = time;

        if (!this._animTrans && !this._animRot && !this._animScale)
        {
            mat4.mul(cgl.mMatrix, cgl.mMatrix, this.mat);
        }
        else
        {
            mat4.identity(this._animMat);

            const playAnims = true;

            if (playAnims && this._animTrans)
            {
                mat4.translate(this._animMat, this._animMat, [
                    this._animTrans[0].getValue(_time),
                    this._animTrans[1].getValue(_time),
                    this._animTrans[2].getValue(_time)]);
            }
            else
            if (this.translation) mat4.translate(this._animMat, this._animMat, this.translation);

            if (playAnims && this._animRot)
            {
                CABLES.TL.Anim.slerpQuaternion(_time, this._tempQuat, this._animRot[0], this._animRot[1], this._animRot[2], this._animRot[3]);

                mat4.fromQuat(this._tempMat, this._tempQuat);
                mat4.mul(this._animMat, this._animMat, this._tempMat);
            }
            else if (this._rot)
            {
                mat4.fromQuat(this._tempRotmat, this._rot);
                mat4.mul(this._animMat, this._animMat, this._tempRotmat);
            }

            if (playAnims && this._animScale)
            {
                mat4.scale(this._animMat, this._animMat, [
                    this._animScale[0].getValue(_time),
                    this._animScale[1].getValue(_time),
                    this._animScale[2].getValue(_time)]);
            }
            else if (this._scale) mat4.scale(this._animMat, this._animMat, this._scale);

            mat4.mul(cgl.mMatrix, cgl.mMatrix, this._animMat);
        }

        if (this.addTranslate)mat4.translate(cgl.mMatrix, cgl.mMatrix, this.addTranslate);

        mat4.copy(this.absMat, cgl.mMatrix);
    }

    render(cgl, dontTransform, dontDrawMesh, ignoreMaterial, ignoreChilds, drawHidden, _time)
    {
        if (!dontTransform) cgl.pushModelMatrix();

        if(_time===undefined)_time=gltf.time;

        if (!dontTransform || this.skinRenderer) this.transform(cgl, _time );

        if (this.hidden && !drawHidden)
        {

        }
        else
        {
            if(this.skinRenderer)
            {
                this.skinRenderer.renderStart(cgl,_time);
                if(!dontDrawMesh) this.mesh.render(cgl, ignoreMaterial);
                this.skinRenderer.renderFinish(cgl);
            }
            else
            {
                if (this.mesh && !dontDrawMesh)
                {
                    this.mesh.render(cgl, ignoreMaterial);
                }
            }
        }

        if (!ignoreChilds && !this.hidden)
            for (let i = 0; i < this.children.length; i++)
                if (gltf.nodes[this.children[i]])
                {
                    gltf.nodes[this.children[i]].render(cgl, dontTransform, dontDrawMesh, ignoreMaterial, ignoreChilds, drawHidden, _time);
                }


        if (!dontTransform)cgl.popModelMatrix();
    }
};
