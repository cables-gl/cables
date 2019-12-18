import { Texture } from "./cgl_texture";
import { Framebuffer } from "./cgl_framebuffer";
import { Framebuffer2 } from "./cgl_framebuffer2";
import { shortId } from "../utils";
/**
 * @class
 * @external CGL
 * @namespace ShadowStore
 * @hideconstructor
 * @example
 * var shader=new CGL.Shader(cgl,'MinimalMaterial');
 * shader.setSource(attachments.shader_vert,attachments.shader_frag);
 */
class ShadowStore
{
    constructor()
    {
        this.lightStack = [];
        this.shadowMaps = {};
        this.shadowPass = false;
        // this.MAX_UNIFORM_FRAGMENTS = cgl.gl.getParameter(cgl.gl.MAX_FRAGMENT_UNIFORM_VECTORS);
        // this.MAX_SHADOWMAPS = this.MAX_UNIFORM_FRAGMENTS === 64 ? 2 : 4;
        this.sceneBounds = {
            positiveX: 0,
            negativeX: 0,
            positiveY: 0,
            negativeY: 0,
            positiveZ: 0,
            negativeZ: 0,
        };
        /* eslint-disable */
        /* prettier-disable */
        this.biasMatrix = mat4.fromValues(
            0.5,
            0.0,
            0.0,
            0.0,
            0.0,
            0.5,
            0.0,
            0.0,
            0.0,
            0.0,
            0.5,
            0.0,
            0.5,
            0.5,
            0.5,
            1.0,
        );
        this.lookAt = vec3.fromValues(0, 0, 0);
        this.up = vec3.fromValues(0, 1, 0);
        /* eslint-enable */
        /* prettier-enable */
    }

    initializeShadowMap(cgl, name, light, _size)
    {
        if (!cgl) throw Error("No CGL Context passed!");
        if (!light) throw Error("No light!");
        const size = _size || 1024;
        const texture = new Texture(cgl, {
            name,
            isFloatingPointTexture: true,
            filter: Texture.FILTER_LINEAR,
            width: size,
            height: size,
        });

        let framebuffer = null;
        if (cgl.glVersion === 1) framebuffer = new Framebuffer(cgl, size, size);
        else
        {
            framebuffer = new Framebuffer2(cgl, size, size, {
                isFloatingPointTexture: true,
                filter: Texture.FILTER_LINEAR,
            });
        }

        const projectionMatrix = mat4.create();
        const viewMatrix = mat4.create();
        const lightMatrix = mat4.create();
        let eye = null;
        let lookAt = null;

        if (light.type === "spot")
        {
            // (static) perspective(out, fovy, aspect, near, far) → {mat4}
            mat4.perspective(projectionMatrix, Math.PI / 4, 1, 0.1, 50);
            eye = vec3.fromValues(light.position[0], light.position[1], light.position[2]);
            lookAt = vec3.fromValues(light.conePointAt[0], light.conePointAt[1], light.conePointAt[2]);
            // (static) lookAt(out, eye, center, up) → {mat4}
        }

        if (light.type === "directional")
        {
            // ortho(out, left, right, bottom, top, near, far)
            mat4.ortho(projectionMatrix, -8, 8, -8, 8, 0.1, 30);
            eye = vec3.fromValues(light.position[0], light.position[1], light.position[2]);
            lookAt = vec3.fromValues(0, 0, 0);
        }

        mat4.lookAt(viewMatrix, eye, lookAt, this.up);
        mat4.mul(lightMatrix, projectionMatrix, viewMatrix);
        mat4.mul(lightMatrix, this.biasMatrix, lightMatrix);

        const shadowMap = {
            id: light.id || shortId(),
            type: light.type,
            texture,
            framebuffer,
            texelSize: 1 / size,
            projectionMatrix,
            viewMatrix,
            lightMatrix,
        };

        this.shadowMaps[shadowMap.id] = shadowMap;
    }

    updateShadowMap(light)
    {
        if (!light) throw Error("No light passed!");

        const shadowMap = this.shadowMaps[light.id];

        if (!shadowMap) throw Error("No ShadowMap with ID" + light.id);

        let eye = null;
        let lookAt = null;
        const direction = vec3.create();

        if (light.type === "spot")
        {
            // (static) perspective(out, fovy, aspect, near, far) → {mat4}
            mat4.perspective(shadowMap.projectionMatrix, Math.PI / 4, 1, 0.1, 30);
            eye = vec3.fromValues(light.position[0], light.position[1], light.position[2]);
            lookAt = vec3.fromValues(light.conePointAt[0], light.conePointAt[1], light.conePointAt[2]);
            // light.position-light.conePointAt = spotLightDirection

            vec3.subtract(direction, eye, lookAt);
            vec3.scale(direction, direction, -1);
            vec3.subtract(lookAt, eye, direction);
            // (static) lookAt(out, eye, center, up) → {mat4}
        }

        if (light.type === "directional")
        {
            mat4.ortho(shadowMap.projectionMatrix, -8, 8, -8, 8, 0.1, 30);
            eye = vec3.fromValues(light.position[0], light.position[1], light.position[2]);
            lookAt = vec3.fromValues(0, 0, 0);
        }

        mat4.lookAt(shadowMap.viewMatrix, eye, lookAt, this.up);
        //mat4.mul(shadowMap.lightMatrix, shadowMap.projectionMatrix, shadowMap.viewMatrix);
        //mat4.mul(shadowMap.lightMatrix, this.biasMatrix, shadowMap.lightMatrix);
        this.shadowMaps[light.id] = shadowMap;
    }

    removeShadowMap(id)
    {
        for (let i = this.shadowMaps.length - 1; i >= 0; --i)
        {
            if (this.shadowMaps[i].id === id) this.shadowMaps.splice(i, 1);
        }
    }

    recalculateSceneBounds()
    {
        // TODO: add event listening for newly added meshes / geoms?
        return {};
    }
}

export { ShadowStore };
