import slots_frag from "./slots.frag";
import slots_vert from "./slots.vert";
import slots_head_frag from "./slots_head.frag";
import slots_head_vert from "./slots_head.vert";


class RenderTargets
{
    constructor(cgl)
    {
        this._numBuffers = 4;
        this.asString = "";
        this._slots = [];
        this._name = "rendertargets";
        this.mod = new CGL.ShaderModifier(cgl, this._name);
        this.updateModules();

        this.mod.onBind = (currentShader) =>
        {
            // console.log(currentShader);
            // currentShader.setDrawBuffers([true, true, true, true]);
        };
    }


    updateModules()
    {
        this.mod.removeModule(this._name + "_frag");
        this.mod.addModule(
            {
                "priority": 2,
                "title": this._name + "_frag",
                "name": "MODULE_COLOR",
                "srcHeadFrag": slots_head_frag,
                "srcBodyFrag": this.getSrcFrag(),
            });

        this.mod.removeModule(this._name + "_vert");
        this.mod.addModule(
            {
                "priority": 2,
                "title": this._name + "_vert",
                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": slots_head_vert,
                "srcBodyVert": slots_vert
            });
    }

    getTypes()
    {
        return ["Default",
            "Material Id",
            "Position World",
            "Position Local",
            "Position Object",
            "Normal",
            "Normal * ModelView",
            "FragCoord.z",
            "TexCoord",
            "Black",
            "Alpha 0",
            "0", "1"];
    }

    setNumBuffers(n)
    {
        this._numBuffers = n;
    }

    getSrcFrag()
    {
        let src = slots_frag;

        for (let i = 0; i < this._numBuffers; i++)
        {
            if (this._slots[i] == "Normal") src += "outColor" + i + " = vec4(norm,1.);".endl();
            else if (this._slots[i] == "Default" || this._slots[i] == "Color") src += "outColor" + i + " = col;".endl();
            else if (this._slots[i] == "1") src += "outColor" + i + " = vec4(1.,1.,1.,1.);".endl();
            else if (this._slots[i] == "0") src += "outColor" + i + " = vec4(0.,0.,0.,0.);".endl();
            else if (this._slots[i] == "Black") src += "outColor" + i + " = vec4(0.,0.,0.,1.);".endl();
            else if (this._slots[i] == "TexCoord") src += "outColor" + i + " = vec4(texCoord,0.,1.);".endl();
            else if (this._slots[i] == "Position Local") src += "outColor" + i + " = vec4(MOD_pos_local,1.);".endl();
            else if (this._slots[i] == "Position World") src += "outColor" + i + " = vec4(MOD_pos_world,1.);".endl();
            else if (this._slots[i] == "Position Object") src += "outColor" + i + " = vec4(MOD_pos_object,1.);".endl();
            else if (this._slots[i] == "Normal * ModelView") src += "outColor" + i + " = vec4(MOD_normal_mv,1.);".endl();
            else if (this._slots[i] == "Material Id") src += "outColor" + i + " = vec4(materialId,instIdx,0.,1.);".endl();
            else if (this._slots[i] == "FragCoord.z") src += "outColor" + i + " = vec4(vec3(gl_FragCoord.z),1.);".endl();
        }

        // console.log(src);
        return src;
    }

    update(slots)
    {
        this._slots = slots;
        this.asString = "";
        let hasPosWorld = false;
        let hasPosLocal = false;
        let hasPosObject = false;
        let hasNormalModelView = false;
        this._numBuffers = slots.length;

        for (let i = 0; i < this._numBuffers; i++)
        {
            hasPosWorld = (slots[i] == "Position World") || hasPosWorld;
            hasNormalModelView = (slots[i] == "Normal * ModelView") || hasNormalModelView;
            hasPosLocal = (slots[i] == "Position Local") || hasPosLocal;
            hasPosObject = (slots[i] == "Position Object") || hasPosObject;

            this.asString += slots[i];
            if (i != this._numBuffers - 1) this.asString += " | ";
        }

        this.updateModules();

        this.mod.toggleDefine("MOD_SLOT_POS_WORLD", hasPosWorld);
        this.mod.toggleDefine("MOD_SLOT_POS_LOCAL", hasPosLocal);
        this.mod.toggleDefine("MOD_SLOT_POS_OBJECT", hasPosObject);
        this.mod.toggleDefine("MOD_SLOT_POS_NORMAL_MV", hasNormalModelView);
    }
}

export { RenderTargets };
