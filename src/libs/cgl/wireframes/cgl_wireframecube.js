export { WireframeCube };

class WireframeCube
{
    constructor(_cgl)
    {
        this.cgl = _cgl;
        this.geom = new CGL.Geometry("marker");
        this.geom.setPointVertices(
            [
                // frontal
                -1, -1, 1,
                1, -1, 1,

                1, 1, 1,
                -1, 1, 1,

                -1, -1, -1,
                1, -1, -1,

                -1, 1, -1,
                1, 1, -1,

                // vertical lines
                1, -1, -1,
                1, 1, -1,

                -1, 1, -1,
                -1, -1, -1,

                1, 1, 1,
                1, -1, 1,

                -1, 1, 1,
                -1, -1, 1,

                // horizontal lines
                1, 1, -1,
                1, 1, 1,

                -1, 1, -1,
                -1, 1, 1,

                1, -1, 1,
                1, -1, -1,

                -1, -1, 1,
                -1, -1, -1,
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

        if (_scaleX == undefined) _scaleX = 1.0;
        if (_scaleY == undefined) _scaleY = _scaleX;
        if (_scaleZ == undefined) _scaleZ = _scaleX;


        // vec3.set(this._vScale, _scaleX || 1, _scaleY || _scaleX || 1, _scaleZ || _scaleX || 1);
        vec3.set(this._vScale, _scaleX, _scaleY, _scaleZ);
        mat4.scale(this.cgl.mvMatrix, this.cgl.mvMatrix, this._vScale);

        this.mesh.render(this.cgl.getShader());

        this.cgl.popDepthTest();
        this.cgl.popShader();
        this.cgl.popModelMatrix();
    }
}
