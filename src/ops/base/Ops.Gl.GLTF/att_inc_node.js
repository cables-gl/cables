
var gltfNode=class
{
    constructor(node,gltf)
    {
        this.isChild=node.isChild||false;
        this.name=node.name;
        this.mat=mat4.create();
        this.mesh=null;
        this.children=[];

        if(node.translation) mat4.translate(this.mat,this.mat,node.translation);

        if(node.rotation)
        {
            var rotmat=mat4.create();
            mat4.fromQuat(rotmat,node.rotation);
            mat4.mul(this.mat,this.mat,rotmat);
        }

        if(node.scale) mat4.scale(this.mat,this.mat,node.scale);

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

    render(cgl)
    {
        cgl.pushModelMatrix();
        mat4.multiply(cgl.mMatrix,cgl.mMatrix,this.mat);

        if(this.mesh) this.mesh.render(cgl);

        for(var i=0;i<this.children.length;i++)
        {
            gltf.nodes[this.children[i]].render(cgl);
        }

        cgl.popModelMatrix();
    }

};