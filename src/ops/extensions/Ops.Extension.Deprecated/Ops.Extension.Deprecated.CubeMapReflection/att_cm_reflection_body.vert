
mat4 modelview= viewMatrix * modelMatrix;
v_eyeCoords = (modelview * pos).xyz;
v_normal = normalize(attrVertNormal);
v_pos= vPosition;
