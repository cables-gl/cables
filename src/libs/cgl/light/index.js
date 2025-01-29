import {
    getShadowPassVertexShader,
    getShadowPassFragmentShader,
    getBlurPassVertexShader,
    getBlurPassFragmentShader
} from "./createshaders.js";

/**
 *
 * @param cgl
 * @param {Object} config config for light
 */
// function Light(cgl, config)
class Light
{
    constructor(cgl, config)
    {
    // * common settings for each light
        this.type = config.type || "point";
        this.color = config.color || [1, 1, 1];
        this.specular = config.specular || [0, 0, 0];
        this.position = config.position || null;
        this.intensity = config.intensity || 1;
        this.radius = config.radius || 1;
        this.falloff = config.falloff || 1;

        // * spot light specific config
        this.spotExponent = config.spotExponent || 1;
        this.cosConeAngleInner = config.cosConeAngleInner || 0; // spot light
        this.cosConeAngle = config.cosConeAngle || 0;
        this.conePointAt = config.conePointAt || [0, 0, 0];

        // * shadow specific config
        this.castShadow = config.castShadow || false;
        this.nearFar = config.nearFar || [0, 0];
        this.normalOffset = config.normalOffset || 0;
        this.shadowBias = config.shadowBias || 0;
        this.shadowStrength = config.shadowStrength || 0;
        this.lightMatrix = null;

        this.shadowMap = null;
        this.shadowMapDepth = null;
        this.shadowCubeMap = null;

        // * internal config
        this._cgl = cgl;
        this.state = {
            "isUpdating": false
        };
        this._framebuffer = null;
        this._shaderShadowMap = {
            "shader": null,
            "uniforms": {
                "lightPosition": null,
                "nearFar": null,
            },
            "matrices": {
                "modelMatrix": mat4.create(),
                "viewMatrix": mat4.create(),
                "projMatrix": mat4.create(),
                "biasMatrix": mat4.fromValues(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0),
            },
            "vectors": {
                "lookAt": vec3.create(),
                "camPos": vec3.create(),
                "up": vec3.fromValues(0, 1, 0),
            },
        };
        this._effectBlur = null;
        this._shaderBlur = {
            "shader": null,
            "uniforms": {
                "XY": null,
            },
        };
        this._cubemap = null;

    }

    getModifiableParameters()
    {
        return [
            "color",
            "specular",
            "position",
            "intensity",
            "radius",
            "falloff",

            // * spot light specific config
            "spotExponent",
            "cosConeAngleInner",
            "cosConeAngle",
            "conePointAt",
        ];
    }

    createProjectionMatrix(lrBottomTop, near, far, angle)
    {
        this.updateProjectionMatrix(lrBottomTop, near, far, angle);
    }

    updateProjectionMatrix(lrBottomTop, near, far, angle)
    {
        if (this.type === "spot")
        {
            mat4.perspective(this._shaderShadowMap.matrices.projMatrix, -2 * CGL.DEG2RAD * angle, 1, near, far); // * angle in degrees
        }
        else if (this.type === "directional")
        {
            mat4.ortho(this._shaderShadowMap.matrices.projMatrix, -1 * lrBottomTop, lrBottomTop, -1 * lrBottomTop, lrBottomTop, near, far);
        }
        else if (this.type === "point")
        {
            mat4.perspective(this._shaderShadowMap.matrices.projMatrix, CGL.DEG2RAD * 90, 1, near, far);
            this.nearFar = [near, far];
        }
    }

    hasFramebuffer()
    {
        return !!this._framebuffer;
    }

    hasShadowMapShader()
    {
        return !!this._shaderShadowMap.shader;
    }

    hasBlurShader()
    {
        return !!this._shaderBlur.shader;
    }

    hasBlurEffect()
    {
        return !!this._effectBlur;
    }

    getShadowMap()
    {
        if (this.type === "point") return null; // TODO: replace
        return this._framebuffer.getTextureColor();
    }

    getShadowMapDepth()
    {
        if (this.type === "point") return null;
        return this._framebuffer.getTextureDepth();
    }

    createFramebuffer(width, height, options)
    {
        this.state.isUpdating = true;

        const fbWidth = width || 512;
        const fbHeight = height || 512;

        if (this.type === "point")
        {
            if (!this.hasCubemap())
            {
                this._cubemap = new CGL.CubemapFramebuffer(this._cgl, fbWidth, fbHeight, {
                    "name": "point light shadowmap"
                });
            }
            else
            {
                this._cubemap.setSize(fbWidth, fbHeight);
            }

            this._cubemap.setCamPos(this.position);
            this._cubemap.setMatrices(
                this._shaderShadowMap.matrices.modelMatrix,
                this._shaderShadowMap.matrices.viewMatrix,
                this._shaderShadowMap.matrices.projMatrix
            );

            this.state.isUpdating = false;
            return;
        }

        if (this.hasFramebuffer()) this._framebuffer.delete();

        if (options)
        {
            if (options.filter)
            {
            // * set FP to false if mipmap filtering is selected
                options.isFloatingPointTexture = options.filter !== CGL.Texture.FILTER_MIPMAP;
            }
        }

        if (this._cgl.glVersion == 1)
        {
            this._framebuffer = new CGL.Framebuffer(
                this._cgl,
                fbWidth,
                fbHeight,
                ({
                    "isFloatingPointTexture": true,
                    "filter": CGL.Texture.FILTER_LINEAR,
                    "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE,
                    ...options,
                }),
            );
        }
        else
        {
            this._framebuffer = new CGL.Framebuffer2(
                this._cgl,
                fbWidth,
                fbHeight,
                ({
                    "isFloatingPointTexture": true,
                    "filter": CGL.Texture.FILTER_LINEAR,
                    "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE,
                    ...options,
                }),
            );
        }

        this.state.isUpdating = false;
    }

    hasCubemap()
    {
        return !!this._cubemap;
    }

    setFramebufferSize(size)
    {
        if (this.hasFramebuffer()) this._framebuffer.setSize(size, size);
    }

    createShadowMapShader(vertexShader, fragmentShader)
    {
        if (this.hasShadowMapShader()) return;

        this.state.isUpdating = true;

        this._shaderShadowMap.shader = new CGL.Shader(this._cgl, "shadowPass" + this.type.charAt(0).toUpperCase() + this.type.slice(1));
        this._shaderShadowMap.shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);

        const vShader = vertexShader || this.getShadowPassVertexShader();
        const fShader = fragmentShader || this.getShadowPassFragmentShader();

        this._shaderShadowMap.shader.setSource(vShader, fShader);
        this._shaderShadowMap.shader.offScreenPass = true;

        if (this.type === "point")
        {
            this._shaderShadowMap.uniforms.lightPosition = new CGL.Uniform(this._shaderShadowMap.shader, "3f", "inLightPosition", vec3.create());

            this._shaderShadowMap.uniforms.nearFar = new CGL.Uniform(this._shaderShadowMap.shader, "2f", "inNearFar", vec2.create());
        }

        if (this._cgl.glVersion == 1)
        {
            this._cgl.enableExtension("OES_texture_float");
            this._cgl.enableExtension("OES_texture_float_linear");
            this._cgl.enableExtension("OES_texture_half_float");
            this._cgl.enableExtension("OES_texture_half_float_linear");

            this._shaderShadowMap.shader.enableExtension("GL_OES_standard_derivatives");
            this._shaderShadowMap.shader.enableExtension("GL_OES_texture_float");
            this._shaderShadowMap.shader.enableExtension("GL_OES_texture_float_linear");
            this._shaderShadowMap.shader.enableExtension("GL_OES_texture_half_float");
            this._shaderShadowMap.shader.enableExtension("GL_OES_texture_half_float_linear");
        }

        this.state.isUpdating = false;
    }

    createBlurEffect(options)
    {
        if (this.type === "point") return;
        this.state.isUpdating = true;
        if (this.hasBlurEffect()) this._effectBlur.delete();

        this._effectBlur = new CGL.TextureEffect(
            this._cgl,
            ({
                "isFloatingPointTexture": true,
                "filter": CGL.Texture.FILTER_LINEAR,
                "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE,
                ...options,
            }),
        );
        this.state.isUpdating = false;
    }

    createBlurShader(vertexShader, fragmentShader)
    {
        if (this.hasBlurShader())
        {
            return;
        }
        if (this.type === "point") return; // TODO: add cubemap convolution

        this.state.isUpdating = true;

        const vShader = vertexShader || this.getBlurPassVertexShader();
        const fShader = fragmentShader || this.getBlurPassFragmentShader();

        this._shaderBlur.shader = new CGL.Shader(this._cgl, "blurPass" + this.type.charAt(0).toUpperCase() + this.type.slice(1));
        this._shaderBlur.shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
        this._shaderBlur.shader.setSource(vShader, fShader);

        this._shaderBlur.uniforms.XY = new CGL.Uniform(this._shaderBlur.shader, "2f", "inXY", vec2.create());
        this._shaderBlur.shader.offScreenPass = true;
        this.state.isUpdating = false;
    }

    renderPasses(polygonOffset, blurAmount, renderFunction)
    {
        if (this.state.isUpdating) return;
        if (this._cgl.tempData.shadowPass) return;

        this._cgl.pushCullFace(true);
        this._cgl.pushCullFaceFacing(this._cgl.gl.FRONT);
        this._cgl.gl.enable(this._cgl.gl.POLYGON_OFFSET_FILL);
        this._cgl.gl.polygonOffset(polygonOffset, polygonOffset);

        this._cgl.tempData.renderOffscreen = true;
        this._cgl.tempData.shadowPass = true;

        this._cgl.pushBlend(false);
        this._cgl.gl.colorMask(true, true, this.type === "point", this.type === "point"); // * for now just 2 channels, with MSM we need 4

        this.renderShadowPass(renderFunction);

        this._cgl.gl.cullFace(this._cgl.gl.BACK);
        this._cgl.gl.disable(this._cgl.gl.CULL_FACE);
        this._cgl.gl.disable(this._cgl.gl.POLYGON_OFFSET_FILL);

        if (this.type !== "point") this.renderBlurPass(blurAmount);

        this._cgl.gl.colorMask(true, true, true, true);

        this._cgl.popBlend();
        this._cgl.popCullFaceFacing();
        this._cgl.popCullFace();

        this._cgl.tempData.shadowPass = false;
        this._cgl.tempData.renderOffscreen = false;

        if (this.type !== "point")
        {
            this.shadowMap = this._framebuffer.getTextureColor();
            this.shadowMapDepth = this._framebuffer.getTextureDepth();
        }
        else
        {
            this.shadowMap = null;
            this.shadowMapDepth = null;
        }
    }

    renderShadowPass(renderFunction)
    {
        if (this.state.isUpdating) return;
        if (this.type === "point")
        {
            this._shaderShadowMap.uniforms.nearFar.setValue(this.nearFar);
            this._shaderShadowMap.uniforms.lightPosition.setValue(this.position);

            this._cubemap.setCamPos(this.position);
            this._cubemap.setMatrices(this._shaderShadowMap.matrices.modelMatrix, this._shaderShadowMap.matrices.viewMatrix, this._shaderShadowMap.matrices.projMatrix);

            this._cgl.pushShader(this._shaderShadowMap.shader);

            // this._cubemap.renderCubemap(renderFunction);

            this._cubemap.renderStart();

            for (let i = 0; i < 6; i += 1)
            {
                this._cubemap.renderStartCubemapFace(i);
                if (renderFunction) renderFunction();
                this._cubemap.renderEndCubemapFace();
            }

            this._cubemap.renderEnd();

            this._cgl.popShader();
            this.shadowCubeMap = this._cubemap.getTextureColor(); // getCubemap();
            return;
        }

        this._cgl.pushShader(this._shaderShadowMap.shader);

        this._cgl.pushModelMatrix();
        this._cgl.pushViewMatrix();
        this._cgl.pushPMatrix();

        this._framebuffer.renderStart(this._cgl);

        // * create MVP matrices
        mat4.copy(this._cgl.mMatrix, this._shaderShadowMap.matrices.modelMatrix);

        vec3.set(this._shaderShadowMap.vectors.camPos, this.position[0], this.position[1], this.position[2]);

        if (this.type === "spot") vec3.set(this._shaderShadowMap.vectors.lookAt, this.conePointAt[0], this.conePointAt[1], this.conePointAt[2]);

        mat4.lookAt(this._cgl.vMatrix, this._shaderShadowMap.vectors.camPos, this._shaderShadowMap.vectors.lookAt, this._shaderShadowMap.vectors.up);

        mat4.copy(this._cgl.pMatrix, this._shaderShadowMap.matrices.projMatrix);

        if (!this.lightMatrix) this.lightMatrix = mat4.create();

        // * create light mvp bias matrix
        mat4.mul(this.lightMatrix, this._cgl.pMatrix, this._cgl.vMatrix);
        mat4.mul(this.lightMatrix, this._cgl.mMatrix, this.lightMatrix);
        mat4.mul(this.lightMatrix, this._shaderShadowMap.matrices.biasMatrix, this.lightMatrix);

        this._cgl.gl.clearColor(1, 1, 1, 1);
        this._cgl.gl.clear(this._cgl.gl.DEPTH_BUFFER_BIT | this._cgl.gl.COLOR_BUFFER_BIT);

        if (renderFunction) renderFunction(); // * e.g. op.trigger();
        this._framebuffer.renderEnd(this._cgl);
        this._cgl.popPMatrix();
        this._cgl.popModelMatrix();
        this._cgl.popViewMatrix();

        this._cgl.popShader();
    }

    renderBlurPass(blurAmount)
    {
        if (this.state.isUpdating) return;
        this._cgl.pushShader(this._shaderBlur.shader);

        this._effectBlur.setSourceTexture(this._framebuffer.getTextureColor()); // take shadow map as source
        this._effectBlur.startEffect();

        this._effectBlur.bind();

        this._cgl.setTexture(0, this._effectBlur.getCurrentSourceTexture().tex);
        this._shaderBlur.uniforms.XY.setValue([blurAmount, 0]);
        this._effectBlur.finish();

        this._effectBlur.bind();
        this._cgl.setTexture(0, this._effectBlur.getCurrentSourceTexture().tex);
        this._shaderBlur.uniforms.XY.setValue([0, blurAmount]);

        this._effectBlur.finish();

        this._effectBlur.endEffect();

        this._cgl.popShader();
    }
}
Light.prototype.getShadowPassVertexShader = getShadowPassVertexShader;
Light.prototype.getShadowPassFragmentShader = getShadowPassFragmentShader;
Light.prototype.getBlurPassVertexShader = getBlurPassVertexShader;
Light.prototype.getBlurPassFragmentShader = getBlurPassFragmentShader;

CGL.Light = Light;
