import * as THREE from 'three';

const oceanVertexShader = `
  varying vec2 vPosition;
  void main() {
    vPosition = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// 近岸浅、远处深的径向渐变 + 两层缓慢流动的分形噪声做波纹，边缘羽化到透明和页面背景融合
const oceanFragmentShader = `
  uniform float uTime;
  uniform float uRadius;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uHighlight;
  varying vec2 vPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p = p * 2.1 + 17.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    float dist = length(vPosition) / uRadius;
    vec2 p = vPosition * 0.0055;
    float waves =
      fbm(p + vec2(uTime * 0.05, -uTime * 0.035)) * 0.6 +
      fbm(p * 2.2 - vec2(uTime * 0.04, uTime * 0.06)) * 0.4;

    vec3 color = mix(uShallow, uDeep, smoothstep(0.06, 0.92, dist));
    color *= 0.9 + waves * 0.16;

    float glint = pow(fbm(p * 3.0 + vec2(uTime * 0.08, uTime * 0.045)), 7.0);
    color += uHighlight * glint * 0.28;

    float alpha = (1.0 - smoothstep(0.78, 1.0, dist)) * 0.95;
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export interface OceanColors {
  deep: string;
  shallow: string;
  highlight: string;
}

export const createOcean = (radius: number, colors: OceanColors) => {
  const geometry = new THREE.CircleGeometry(radius, 128);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uRadius: { value: radius },
      uDeep: { value: new THREE.Color(colors.deep) },
      uShallow: { value: new THREE.Color(colors.shallow) },
      uHighlight: { value: new THREE.Color(colors.highlight) }
    },
    vertexShader: oceanVertexShader,
    fragmentShader: oceanFragmentShader,
    transparent: true,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = '海面';
  mesh.renderOrder = -3;

  return {
    mesh,
    update(elapsed: number) {
      material.uniforms.uTime.value = elapsed;
    }
  };
};
