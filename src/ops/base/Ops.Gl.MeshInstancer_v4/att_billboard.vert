
#ifdef BILLBOARDING

    modelViewMatrix[0][0] = 1.0;
    modelViewMatrix[0][1] = 0.0;
    modelViewMatrix[0][2] = 0.0;

    #ifndef BILLBOARDING_CYLINDRIC
        modelViewMatrix[1][0] = 0.0;
        modelViewMatrix[1][1] = 1.0;
        modelViewMatrix[1][2] = 0.0;
    #endif

    modelViewMatrix[2][0] = 0.0;
    modelViewMatrix[2][1] = 0.0;
    modelViewMatrix[2][2] = 1.0;

#endif