# Lighting

In this chapter, we are going to examine how lighting works in Cables.

Currently, the lighting ecosystem consists of the following ops:

## Light casters

- [Point Light](https://cables.gl/op/Ops.Gl.Phong.PointLight_v5)
- [Directional Light](https://cables.gl/op/Ops.Gl.Phong.DirectionalLight_v5)
- [Spot Light](https://cables.gl/op/Ops.Gl.Phong.SpotLight_v5)
- [Ambient Light](https://cables.gl/op/Ops.Gl.Phong.AmbientLight_v4)

## Light Receivers

- [Lambert Material](https://cables.gl/op/Ops.Gl.Phong.LambertMaterial_v2)
- [Phong Material](https://cables.gl/op/Ops.Gl.Phong.PhongMaterial_v5)

## Shadow Receivers

- [Shadow](https://cables.gl/op/Ops.Gl.ShaderEffects.Shadow_v2)

For more information about shadow casting and receiving, please refer to the shadow chapter.

## Lighting in Postprocessing

Currently, the following ops allow you to add lighting via postprocessing:

- [SSAO2](https://cables.gl/op/Ops.Gl.TextureEffects.SSAO2)

__TOC__
