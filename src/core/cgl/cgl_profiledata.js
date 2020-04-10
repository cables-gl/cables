const ProfileData = function ()
{
    this.profileUniformCount = 0;
    this.profileShaderBinds = 0;
    this.profileUniformCount = 0;
    this.profileShaderCompiles = 0;
    this.profileVideosPlaying = 0;
    this.profileMVPMatrixCount = 0;
    this.profileEffectBuffercreate = 0;
    this.profileShaderGetUniform=0;
    this.profileFrameBuffercreate=0;
    this.profileMeshSetGeom=0;
    this.profileTextureNew=0;
    this.profileGenMipMap=0;
    this.profileOnAnimFrameOps=0;

    this.profileMainloopMs=0;
    this.profileMeshDraw=0;
    this.profileTextureEffect=0;
    

};

export const profileData = new ProfileData();
