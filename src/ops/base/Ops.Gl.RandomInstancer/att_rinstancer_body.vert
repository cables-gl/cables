

    pos.x*=osci( mod( {{mod}}_time+instMat[0].x*instMat[0].x ,1.0))*0.8+0.23;
    pos.y*=osci( mod( {{mod}}_time+instMat[0].x*instMat[0].x ,1.0))*0.8+0.23;
    pos.z*=osci( mod( {{mod}}_time+instMat[0].x*instMat[0].x ,1.0))*0.8+0.23;
    mMatrix*=instMat;
