#ifdef GL_ES
precision mediump float;
#endif

//	Classic Perlin 2D Noise 
//	by Stefan Gustavson
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * 
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}
// Perlin 2D Noise - End

// PARAMS
uniform vec2 u_resolution;

// FILTER PARAMS
uniform float radius;
uniform float exp;

// NOISE PARAMS
uniform int octaves;
uniform float freq;
uniform float persistence;
uniform vec2 offset;

// COLORS 
vec3 space = vec3(0.0039, 0.0863, 0.1216);
vec3 ocean = vec3(0.,0.553,0.769);
vec3 shore = vec3(0.,0.663,0.8);
vec3 sand = vec3(0.933,0.804,0.639);
vec3 grass = vec3(0.494,0.784,0.314);
vec3 stone = vec3(0.4745, 0.4196, 0.3725);
vec3 snow = vec3(1.,0.98,0.98);

const int MAX_OCTAVES = 10;
vec2 center = u_resolution * 0.5;

float noise(int octaves, float persistence, float freq, vec2 coords, vec2 offset) {

  float amp= 1.; 
  float maxamp = 0.;
  float sum = 0.;


  for (int i=0; i < MAX_OCTAVES; ++i) {
    if(i == octaves) break;
    sum += amp * cnoise(offset + coords*freq); 
    freq *= 2.1;
    maxamp += amp;
    amp *= persistence;
  }
  
  return sum / maxamp;
}

vec3 getColor(vec2 position) {

  float distance = length(position) / radius;

  if(distance >= 1.0)  {
    return space;
  }

  float filter = pow((1.0 - distance), exp);
  float h =  filter * ( 1.0 + noise(octaves, persistence, freq, position, offset)) - 1.0;

  if (h < -0.1) {
    return ocean;
  } else if (h < -0.05) {
    return shore;
  } else if (h < 0.) {
    return sand;
  } else if (h < 0.20) {
    return grass;
  } else if (h < 0.35) {
    return stone;
  } else {
    return snow;
  }
}

void main(){
  vec2 position = gl_FragCoord.xy  - center;

  gl_FragColor = vec4(getColor(position),1);
}