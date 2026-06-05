const mat3 ADOBE_TO_XYZ_MATRIX = mat3(
    vec3(0.5767309, 0.2973769, 0.0270343),
    vec3(0.1855540, 0.6273491, 0.0706872),
    vec3(0.1881854, 0.0752741, 0.9911085)
);

const mat3 XYZ_TO_ADOBE_MATRIX = mat3(
    vec3(2.0413690, -0.9692660, 0.0134470),
    vec3(-0.5649464, 1.8760108, -0.1183897),
    vec3(-0.3446944, 0.0415560, 1.0154096)
);

vec3 adobergb_to_xyz(vec3 rgb) {
    vec3 rgbLin = adobeRgbToLinear(rgb);
    return ADOBE_TO_XYZ_MATRIX * rgbLin;
}

vec3 xyz_to_adobergb(vec3 xyz) {
    vec3 rgbLin = XYZ_TO_ADOBE_MATRIX * xyz;
    return linearToAdobeRgb(rgbLin);
}