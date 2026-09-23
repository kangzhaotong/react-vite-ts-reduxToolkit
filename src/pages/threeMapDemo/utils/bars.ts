import * as THREE from 'three';

/** 柱状图色阶：低 → 中 → 高（与 index.module.less 中图例渐变保持一致） */
export const BAR_COLOR_STOPS = ['#38d4ff', '#ffd166', '#ff6b6b'];

const barColorStops = BAR_COLOR_STOPS.map((hex) => new THREE.Color(hex));

export const getBarColor = (ratio: number) => {
  const scaled =
    THREE.MathUtils.clamp(ratio, 0, 1) * (barColorStops.length - 1);
  const index = Math.min(Math.floor(scaled), barColorStops.length - 2);

  return new THREE.Color().lerpColors(
    barColorStops[index],
    barColorStops[index + 1],
    scaled - index
  );
};

/** 柱底光晕贴图：白色径向渐变，通过材质 color 着色 */
export const haloTexture = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.32)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
})();

const barVertexShader = `
  uniform float uHeight;
  varying float vT;
  varying vec3 vNormal;
  void main() {
    vT = clamp(position.z / uHeight, 0.0, 1.0);
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// 自底向上由暗到亮、由透明到实的渐变光柱，法线做一点假光照避免看起来是平面贴纸
const barFragmentShader = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vT;
  varying vec3 vNormal;
  void main() {
    vec3 top = mix(uColor, vec3(1.0), 0.18);
    vec3 bottom = uColor * 0.45;
    vec3 color = mix(bottom, top, smoothstep(0.0, 1.0, vT));
    float light = 0.72 + 0.28 * max(dot(normalize(vNormal), normalize(vec3(0.35, 0.55, 0.75))), 0.0);
    float alpha = mix(0.3, 0.97, pow(vT, 0.8));
    gl_FragColor = vec4(color * light, alpha * uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export interface DataBarOptions {
  x: number;
  y: number;
  /** 柱底所在高度（地形表面） */
  baseZ: number;
  height: number;
  color: THREE.Color;
  radius?: number;
}

/**
 * 数据光柱：渐变柱体 + 亮色顶盖 + 底部光晕，组的原点在柱底中心
 */
export const createDataBar = ({
  x,
  y,
  baseZ,
  height,
  color,
  radius = 5.5
}: DataBarOptions) => {
  const group = new THREE.Group();
  group.position.set(x, y, baseZ);

  const bodyGeometry = new THREE.CylinderGeometry(
    radius,
    radius * 0.9,
    height,
    28,
    1,
    true
  );
  // CylinderGeometry 沿 Y 轴生成，转到 Z 轴并把柱底放到原点
  bodyGeometry.rotateX(Math.PI / 2);
  bodyGeometry.translate(0, 0, height / 2);
  const bodyMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: color },
      uHeight: { value: height },
      uOpacity: { value: 1 }
    },
    vertexShader: barVertexShader,
    fragmentShader: barFragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.renderOrder = 3;

  const capGeometry = new THREE.CircleGeometry(radius, 28);
  const capMaterial = new THREE.MeshBasicMaterial({
    color: color.clone().lerp(new THREE.Color('#ffffff'), 0.3),
    transparent: true,
    opacity: 0.96,
    side: THREE.DoubleSide
  });
  const cap = new THREE.Mesh(capGeometry, capMaterial);
  cap.position.z = height + 0.1;
  cap.renderOrder = 4;

  group.add(body, cap);

  if (haloTexture) {
    const haloGeometry = new THREE.PlaneGeometry(radius * 7, radius * 7);
    const haloMaterial = new THREE.MeshBasicMaterial({
      map: haloTexture,
      color,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.position.z = 0.8;
    halo.renderOrder = 2;
    group.add(halo);
  }

  return group;
};
