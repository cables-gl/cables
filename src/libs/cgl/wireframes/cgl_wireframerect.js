export { WireframeRect };

class WireframeRect
{
    constructor(_cgl)
    {
        this.cgl = _cgl;
        this.geom = new CGL.Geometry("marker");

        const fr = -1.0;
        const to = 1.0;

        this.geom.setPointVertices(
            [
                fr, fr, 0,
                to, fr, 0,

                to, fr, 0,
                to, to, 0,

                to, to, 0,
                fr, to, 0,

                fr, to, 0,
                fr, fr, 0,
            ]
        );

        this.mesh = new CGL.Mesh(this.cgl, this.geom, this.cgl.gl.LINES);
        this.mesh.setGeom(this.geom);

        this.colorShader = new CGL.UniColorShader(this.cgl);
        this.colorShader.setColor([0, 1, 1, 1]);

        this._vScale = vec3.create();
    }

    render(_scaleX, _scaleY, _scaleZ)
    {
        this.cgl.pushModelMatrix();
        this.cgl.pushShader(this.colorShader.shader);
        this.cgl.pushDepthTest(false);

        vec3.set(this._vScale, _scaleX || 1, _scaleY || _scaleX || 1, _scaleZ || _scaleX || 1);
        mat4.scale(this.cgl.mvMatrix, this.cgl.mvMatrix, this._vScale);

        this.mesh.render(this.cgl.getShader());

        this.cgl.popDepthTest();
        this.cgl.popShader();
        this.cgl.popModelMatrix();
    }
}
