
IN vec3 vCoords;
IN vec3 v_normal;
IN vec3 v_eyeCoords;
IN vec3 v_pos;

UNI samplerCube cubeMap;
UNI mat4 inverseViewMatrix;
UNI mat4 modelMatrix;
UNI float MOD_amount;