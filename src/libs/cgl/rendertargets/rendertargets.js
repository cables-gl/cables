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
        this._slots = ["Default", "Normal"];
        this._name = "rendertargets" + CABLES.uuid();
        this.mod = new CGL.ShaderModifier(cgl, this._name);
        // this.updateModules();

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
            "0", "1"];
    }

    setNumBuffers(n)
    {
        this._numBuffers = n;
    }

    getSrcString(type, i)
    {
        let outcolor = "outColor";
        if (i === "")outcolor = "col";
        if (type == "Normal") return "    " + outcolor + i + " = vec4(norm,1.);".endl();
        else if (type == "Default" || type == "Color") return "    " + outcolor + i + " = col;".endl();
        else if (type == "1") return "    " + outcolor + i + " = vec4(1.,1.,1.,1.);".endl();
        else if (type == "0") return "    " + outcolor + i + " = vec4(0.,0.,0.,0.);".endl();
        else if (type == "Black") return "    " + outcolor + i + " = vec4(0.,0.,0.,1.);".endl();
        else if (type == "TexCoord") return "    " + outcolor + i + " = vec4(texCoord,0.,1.);".endl();
        else if (type == "Position Local") return "    " + outcolor + i + " = vec4(MOD_pos_local,1.);".endl();
        else if (type == "Position World") return "    " + outcolor + i + " = vec4(MOD_pos_world,1.);".endl();
        else if (type == "Position Object") return "    " + outcolor + i + " = vec4(MOD_pos_object,1.);".endl();
        else if (type == "Normal * ModelView") return "    " + outcolor + i + " = vec4(MOD_normal_mv,1.);".endl();
        else if (type == "Material Id") return "    " + outcolor + i + " = vec4(materialId,instIdx,0.,1.);".endl();
        else if (type == "FragCoord.z") return "    " + outcolor + i + " = vec4(vec3(gl_FragCoord.z),1.);".endl();
        // else return "    outColor" + i + " = vec4(1.,0.,0.,1.);".endl();
    }

    getSrcFrag()
    {
        let src = slots_frag;


        if (this._slots.length == 1)
        {
            console.log(this._slots[0], this.getSrcString(this._slots[0], ""));
            src += this.getSrcString(this._slots[0], "");
        }
        else
            for (let i = 0; i < this._numBuffers; i++)
            {
                src += this.getSrcString(this._slots[i], i);
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
        // this.updateModules();

        this.mod.toggleDefine("MOD_SLOT_POS_WORLD", hasPosWorld);
        this.mod.toggleDefine("MOD_SLOT_POS_LOCAL", hasPosLocal);
        this.mod.toggleDefine("MOD_SLOT_POS_OBJECT", hasPosObject);
        this.mod.toggleDefine("MOD_SLOT_POS_NORMAL_MV", hasNormalModelView);
    }
}

export { RenderTargets };