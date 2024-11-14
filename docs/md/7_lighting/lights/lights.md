# Lights

In this section of the documentation, we will explore how the system works and how to use it efficiently. We will also look into common problems that can occur with adding shadows to a scene. Please keep in mind that the operators are subject to change in the future. We will try to keep the documentation as up to date as possible but if you find outdated parts or explanations that don't hold true anymore, do not hesitate to [contact us on Discord](https://discord.gg/cablesgl).

## Introduction

The following ops are able to cast lights:

- [Point Light](https://cables.gl/op/Ops.Gl.Phong.PointLight_v5)
- [Directional Light](https://cables.gl/op/Ops.Gl.Phong.DirectionalLight_v5)
- [Spot Light](https://cables.gl/op/Ops.Gl.Phong.SpotLight_v5)
- [Ambient Light](https://cables.gl/op/Ops.Gl.Phong.AmbientLight_v4)

The following materials are able to receive light:

- [Lambert Material](https://cables.gl/op/Ops.Gl.Phong.LambertMaterial_v2)
- [Phong Material](https://cables.gl/op/Ops.Gl.Phong.PhongMaterial_v6)

## Basic Setup

![basiclightsetup](img/01_minimal_setup.png)

In the screenshot above you see the minimum amount of operators needed to get shadows on the screen. [The patch for the screenshot is availible here](https://cables.gl/p/5f2285864ce3652062e817b5). In this example, a Directional Light is used. You can use any of the above mentioned operators to add lighting to a scene.

## Multiple Lights

To use multiple lights, simply add them to your patch BEFORE your material(s).

[Check out this patch](https://cables.gl/p/5f32869808f9b264210842db) to see a simple multi-light setup in action.

## Light settings

The most important parameters for lights are `Color`, `Position` and `Intensity`.

With these 3 parameters, you can already generate an infinite amount of looks.

If you are using the [Phong Material](https://cables.gl/op/Ops.Gl.Phong.PhongMaterial_v6), another interesting parameter is the `Specular Color`.
The Phong Material features specular reflections, whose color you can control by changing the specular color of the lights. Please note that the Ambient Light doesn't feature a `Specular Color` parameter. Please refer to the documentation of the ops for a more detailed overview.

## A note on Ambient Lighting

The color of the ambient light gets added on top of all the other colors, there are no lighting calculations involved. Subtle amounts do wonders.
