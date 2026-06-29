/*
 * @Author: M78.Kangzhaotong
 * @Date: 2024-01-25 13:58:56
 * @Last Modified by: M78.Kangzhaotong
 * @Last Modified time: 2024-04-28 14:42:10
 */
import React, { useRef, useEffect, useState, MutableRefObject } from 'react';
import { Select, Button } from 'antd';
import * as THREE from 'three';
import * as d3 from 'd3';
import {
  CSS2DObject,
  CSS2DRenderer
} from 'three/examples/jsm/renderers/CSS2DRenderer';
import { OrbitControls as MapControls } from 'three/examples/jsm/controls/OrbitControls';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
// import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import TWEEN from '@tweenjs/tween.js';
import geoJson100000_Full from './json/100000_full.json';
import geoJson450000_Full from './json/450000_full.json';
import geoJson450100_Full from './json/450100_full.json';
// import geoJson450100 from './json/450100.json';
// import geoJson from './json/450100_full.json';
import circle1 from '@/assets/images/map-circle-1.png';
import circle2 from '@/assets/images/map-circle-2.png';
import circle3 from '@/assets/images/map-circle-3.png';
import { pxfix } from './config';
import { useDebounce } from '@/utils/utils';
import styles from './index.module.less';

const Option = Select.Option;

let width = 0;
let height = 0;

let projection: any;

const lookAt = {
  x: 35,
  y: -10,
  z: 0
};
const cameraPostion = {
  x: 0,
  y: -950,
  z: 950
};

const clock: THREE.Clock = new THREE.Clock();
const textureLoader: THREE.TextureLoader = new THREE.TextureLoader();
const glowTexture = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(184, 242, 255, 0.58)');
  gradient.addColorStop(0.4, 'rgba(88, 206, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(7, 22, 37, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
})();
// 地图配色
const mapPalette = {
  // 场景背景
  sceneBackground: 0x0c2032,
  // 场景雾化
  sceneFog: 0x1e4b68,
  // 地图基础颜色
  baseFill: 0x46a4ea,
  // 地图基础发光
  baseEmissive: 0x1d4f74,
  // 地图悬停颜色
  hoverFill: 0x9bebff,
  // 地图悬停发光
  hoverEmissive: 0x2a6f89,
  // 地图激活颜色
  activeFill: 0xffd487,
  // 地图激活发光
  activeEmissive: 0x9c6325,
  // 地图底层颜色
  underlayStart: 0x1d4670,
  // 地图底层颜色
  underlayEnd: 0x7ee8ff,
  // 地图外边框颜色
  outerLine: 0x9feaff,
  // 地图内边框颜色
  innerLine: 0xe2fbff,
  // 柱状图起始颜色
  barStart: 0x71dbff,
  // 柱状图结束颜色
  barEnd: 0xe6fbff,
  // 柱状图发光
  barEmissive: 0x20557a,
  // 标记点颜色
  markerFill: 0xffdc95,
  // 标记点发光
  markerEmissive: 0xa16525,
  // 扩散效果颜色
  diffusion: '#b6f3ff',
  // 标签文字颜色
  labelText: '#f7feff',
  // 标签值颜色
  labelValue: '#b9efff'
};
// 地图材质
const geoMaterial = new THREE.MeshPhongMaterial({
  color: mapPalette.baseFill,
  emissive: mapPalette.baseEmissive,
  specular: 0xe6fbff,
  shininess: 128,
  transparent: true,
  opacity: 0.92
});
// 地图悬停材质
const geoHoverMaterial = new THREE.MeshPhongMaterial({
  color: mapPalette.hoverFill,
  emissive: mapPalette.hoverEmissive,
  specular: 0xf6feff,
  shininess: 165,
  transparent: true,
  opacity: 0.98
});
// 地图激活材质
const geoActiveMaterial = new THREE.MeshPhongMaterial({
  color: mapPalette.activeFill,
  emissive: mapPalette.activeEmissive,
  specular: 0xfff4d1,
  shininess: 170,
  transparent: true,
  opacity: 0.99
});

// 柱状图材质
const barMaterial = new THREE.MeshPhongMaterial({
  color: mapPalette.barStart,
  emissive: mapPalette.barEmissive,
  specular: 0xf0fdff,
  shininess: 145,
  transparent: true,
  opacity: 0.94
});
const raycaster = new THREE.Raycaster();
// 射线
const mouse = new THREE.Vector2();
const ROOT_ADCODE = '100000';
// DataV v2 的 full 数据是真实下级边界；v3 部分省份会出现属性是市、几何仍是整省的问题。
const REMOTE_GEO_JSON_HOST = 'https://geo.datav.aliyun.com/areas_v2/bound';
const DYNAMIC_MAP_EXTENT_RATIO = {
  horizontal: 0.55,
  vertical: 0.58
};

type MapRegionConfig = {
  name: string;
  parentAdcode: string | null;
  json: any;
  projection?: {
    center: [number, number];
    scale: number;
  };
};

const mapDataRegistry: Record<string, MapRegionConfig> = {
  [ROOT_ADCODE]: {
    name: '全国',
    parentAdcode: null,
    json: geoJson100000_Full,
    projection: {
      center: [108.778074408, 30.0572355018],
      scale: 1500
    }
  },
  '450000': {
    name: '广西壮族自治区',
    parentAdcode: '100000',
    json: geoJson450000_Full,
    projection: {
      center: [108.7944, 23.8334],
      scale: 8000
    }
  },
  '450100': {
    name: '南宁市',
    parentAdcode: '450000',
    json: geoJson450100_Full,
    projection: {
      center: [108.467546, 23.055985],
      scale: 36000
    }
  }
};

const getRemoteGeoJsonUrl = (adcode: string) =>
  `${REMOTE_GEO_JSON_HOST}/${adcode}_full.json`;

const isSelfBoundaryOnly = (json: any, adcode: string) => {
  const firstFeature = json?.features?.[0];

  return (
    json?.features?.length === 1 &&
    String(firstFeature?.properties?.adcode) === adcode
  );
};

const createRemoteRegionConfig = (
  adcode: string,
  json: any,
  parentAdcode: string,
  fallbackName = ''
): MapRegionConfig => ({
  name: fallbackName || json.features[0]?.properties?.parent?.name || adcode,
  parentAdcode,
  json
});

let mapIndex = 0;
let mapTimer: any;
let deptIndex = 0;
let deptTimer: any;
let animationLoop: any;
const _dataAccess: any = {};
const ThreeMapDemo = () => {
  const [currentRegion, setCurrentRegion] = useState(
    mapDataRegistry[ROOT_ADCODE]
  );
  const renderer: any = useRef<THREE.WebGLRenderer | null>();
  const renderer2: any = useRef();
  const camera: MutableRefObject<THREE.PerspectiveCamera> | any = useRef();
  const scene: MutableRefObject<THREE.Scene> | any = useRef();
  const scene2: MutableRefObject<THREE.Scene> | any = useRef();
  const controls: MutableRefObject<MapControls> | any = useRef();
  const css3DRenderer: any = useRef<CSS2DRenderer>();
  const cylinder: MutableRefObject<THREE.Mesh> | any = useRef(); // 锥体
  const diffusion: MutableRefObject<THREE.Mesh> | any = useRef(); // 扩散

  const underlayGroup = useRef(new THREE.Group());
  const mapGroup = useRef(new THREE.Group());
  const barGeoGroup = useRef(new THREE.Group());
  const markerGroup: MutableRefObject<THREE.Group[]> = useRef([]);
  const labelGroup: any = useRef([]);
  const currentGeoJsonRef = useRef(mapDataRegistry[ROOT_ADCODE].json);
  const currentAdcodeRef = useRef(ROOT_ADCODE);
  const loadingAdcodeRef = useRef('');
  const underlayMaterialRef = useRef<THREE.MeshPhongMaterial | null>(null);
  const underlayLineMaterialRef = useRef<THREE.LineBasicMaterial | null>(null);
  const overlayLineMaterialRef = useRef<THREE.LineBasicMaterial | null>(null);

  const divRef = useRef<HTMLDivElement | null>(null);
  const nameRef: any = useRef(null);
  // 初始化Three容器
  const initThree = () => {
    if (divRef.current) {
      width = divRef.current.clientWidth;
      height = divRef.current.clientHeight;
    }

    renderer.current = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    // renderer.current.sortObjects = false;
    renderer.current.setSize(width, height, true);
    renderer.current.setClearColor(0xeeeeee, 0.0);

    if (divRef.current) {
      divRef.current.appendChild(renderer.current.domElement);
    }

    css3DRenderer.current = new CSS2DRenderer();
    css3DRenderer.current.setSize(width, height);
    css3DRenderer.current.domElement.style.position = 'absolute';
    css3DRenderer.current.domElement.style.top = '0px';
    css3DRenderer.current.domElement.style.outline = 'none';
    css3DRenderer.current.domElement.style.zIndex = '2';

    if (divRef.current) {
      divRef.current.appendChild(css3DRenderer.current.domElement);
    }

    renderer2.current = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    // renderer.sortObjects = false;
    renderer2.current.setSize(width, height, true);
    // 设置底色
    renderer2.current.setClearColor(0xffffff, 0);
    renderer2.current.domElement.className = 'canvas2';
    if (divRef.current) {
      divRef.current.appendChild(renderer2.current.domElement);
    }
  };

  // 定义场景
  const initScene = () => {
    scene.current = new THREE.Scene();
    scene2.current = new THREE.Scene();
    underlayGroup.current = new THREE.Group();
    mapGroup.current = new THREE.Group();
    barGeoGroup.current = new THREE.Group();
    scene.background = new THREE.Color(mapPalette.sceneBackground);
    // 雾化场景
    scene.fog = new THREE.Fog(mapPalette.sceneFog, 900, 3200);
  };
  // 初始化相机视角
  const initCamera = () => {
    camera.current = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      100000
    );
    camera.current.up.x = 0;
    camera.current.up.y = 0;
    camera.current.up.z = 1;
    // camera.current.position.set(0, -800, 2000);
    // camera.current.position.set(0, -1250, 950);
    // camera.current.position.set(0, -1250, 950);
    camera.current.position.set(
      cameraPostion.x,
      cameraPostion.y,
      cameraPostion.z
    );
    camera.current.lookAt(lookAt.x, lookAt.y, lookAt.z);

    // camera.rotateX(-Math.PI * 0.5);
  };
  // 初始化光线粒子
  const initLight = () => {
    // // 环境光
    const ambientLight = new THREE.AmbientLight(0xbfe4ff, 0.9);
    const ambientLight2 = new THREE.AmbientLight(0xdff1ff, 1.05);
    // ambientLight.layers.enable(0);
    // ambientLight.layers.enable(1);
    scene?.current?.add(ambientLight);
    scene2?.current?.add(ambientLight2);

    // 环境光、更加贴近自然的户外光照效果。
    const hemiLight = new THREE.HemisphereLight(0x8fdcff, 0x041021, 1.1);
    hemiLight.position.set(0, 20, 0);
    scene2.current.add(hemiLight);

    // 平行光
    const directionalLight = new THREE.DirectionalLight(0xa4e6ff, 1.2);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.15);
    directionalLight.position.set(0, -1500, 400);
    directionalLight2.position.set(0, -1500, 400);
    scene?.current?.add(directionalLight);
    scene2?.current?.add(directionalLight2);
    // scene.add(new THREE.DirectionalLightHelper(directionalLight));
  };
  const initControl = () => {
    // 控制
    controls.current = new MapControls(
      camera?.current,
      renderer2?.current?.domElement
    );
    // controls = new OrbitControls(camera, css3DRenderer.domElement);
    controls.current.target.set(lookAt.x, lookAt.y, lookAt.z);

    // 平移
    // controls.enablePan = false;

    // 设置为true则启用阻尼(惯性)
    controls.current.enableDamping = true;
    // 水平旋转范围
    // controls.maxAzimuthAngle = Math.PI / 2; // 往左
    // controls.minAzimuthAngle = -Math.PI / 2; // 往右
    // 垂直旋转范围
    controls.current.maxPolarAngle = Math.PI / 2.2; // 往上
    controls.current.minPolarAngle = 0; //  往下

    controls.current.maxDistance = 3500;
    controls.current.minDistance = 200;
    // 是否可以缩放
    // controls.enableZoom = true;
    // 禁止鼠标交互,此处设置为false之后，不能移动位置，不能旋转物体
    // controls.enableRotate = false;

    // 自动旋转
    // controls.autoRotate = true
  };
  const initName = () => {
    const canvas = nameRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;

    const ctx: CanvasRenderingContext2D | any = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // // 新建一个离屏canvas
    // const offCanvas = document.createElement('canvas');
    // offCanvas.width = width;
    // offCanvas.height = height;

    // const ctxOffCanvas = canvas.getContext('2d');
    // 设置canvas字体样式
    // ctxOffCanvas.font = '16.5px Arial';
    // ctxOffCanvas.strokeStyle = '#FFFFFF';
    // ctxOffCanvas.fillStyle = '#000000';

    // ctx.font = '20px Aria';
    ctx.font = `${pxfix(3840, 20)}px Aria`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (cylinder.current?.visible) {
      ctx.font = `${pxfix(3840, 26)}px Aria`;
      // const [x, y] = projection(mapActive.position);
      // const x1 = x - (width / 2);
      // const y1 = -(y - (height / 2));

      const vector = new THREE.Vector3(
        cylinder.current.position.x,
        cylinder.current.position.y,
        cylinder.current.position.z + 30
      );
      // const position = vector.project(camera);
      // 经纬度转屏幕坐标
      vector.project(camera.current);
      const left = ((vector.x + 1) / 2) * width;
      const top = -((vector.y - 1) / 2) * height;
      // console.log(left, top);
      ctx.fillText(cylinder.current.name, left, top);
      ctx.fillText(
        _dataAccess?.catalogTotal || '',
        left,
        top + pxfix(3840, 30)
      );
    }
  };
  // 初始化地图旋转动画
  const animation = () => {
    initName();
    TWEEN.update();
    if (controls.current) {
      controls.current.update();
      // console.log(camera.current);
      // console.log(scene.current);
    }
    if (cylinder.current) {
      // updateObj(cylinder.current, 1500);
      cylinder.current.rotation.y += 0.05;
    }
    // renderer.autoClear = false;
    renderer.current?.clear();
    renderer.current?.render(scene.current, camera.current);
    css3DRenderer.current?.render(scene.current, camera.current);
    // renderer2.autoClear = false;
    renderer2.current?.clear();
    renderer2.current?.render(scene2.current, camera.current);
    // composer.animation();
    animationLoop = requestAnimationFrame(animation);
  };
  const initMesh = () => {
    // 添加底部圆形装饰
    const texture1 = textureLoader.load(circle1);
    const texture2 = textureLoader.load(circle2);
    const texture3 = textureLoader.load(circle3);
    if (glowTexture) {
      const glowPlane = new THREE.PlaneGeometry(1700, 1700);
      const glowMaterial = new THREE.MeshBasicMaterial({
        map: glowTexture,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const glowMesh = new THREE.Mesh(glowPlane, glowMaterial);
      glowMesh.name = '地图底部辉光';
      glowMesh.position.z = -6;
      scene.current.add(glowMesh);

      const glowAnim = new TWEEN.Tween(glowMesh.scale)
        .to({ x: 1.06, y: 1.06, z: 1 }, 2800)
        .yoyo(true)
        .repeat(Infinity)
        .start();
      glowAnim;
    }
    const planes = [
      { radius: 1400, map: texture1, rotate: Math.PI * 2, dur: 24000, opacity: 0.68, color: 0xa8ecff },
      { radius: 1260, map: texture2, rotate: Math.PI * 2, dur: 16000, opacity: 0.82, color: 0x73d9ff },
      { radius: 1160, map: texture3, rotate: Math.PI * 2, dur: 8000, opacity: 0.86, color: 0xe7fcff }
    ];

    planes.forEach((item) => {
      const plane = new THREE.PlaneGeometry(item.radius, item.radius);
      const planeMaterial = new THREE.MeshBasicMaterial({
        map: item.map,
        transparent: true,
        depthWrite: false,
        opacity: item.opacity,
        color: item.color,
        blending: THREE.AdditiveBlending
      });

      const mesh = new THREE.Mesh(plane, planeMaterial);
      mesh.name = '圆圈';
      // mesh.rotateX(Math.PI * 1.5);
      // mesh.position.y = -1 + i;
      const meshAnim = new TWEEN.Tween(mesh.rotation).to(
        { x: 0, y: 0, z: item.rotate },
        item.dur
      );
      // sceneAnim.delay(0).easing(TWEEN.Easing.Quadratic.Out).start();
      meshAnim.delay(0).repeat(Infinity).start();

      scene.current.add(mesh);
    });

    // const shape = new THREE.Shape();
    // console.log(shape.getLength());
    const colors = [
      new THREE.Color(mapPalette.underlayStart),
      new THREE.Color(mapPalette.underlayEnd)
    ];
    // 地图材质
    const mapMaterial = new THREE.MeshPhongMaterial({
      vertexColors: true,
      color: new THREE.Color().lerpColors(colors[0], colors[1], 0.5),
      emissive: 0x12314e,
      specular: 0xc4f2ff,
      shininess: 110,
      depthWrite: false,
      transparent: true,
      opacity: 0.56
    });
    const lineMaterial = new THREE.LineBasicMaterial({
      color: mapPalette.outerLine,
      transparent: true,
      opacity: 0.86,
      linewidth: 1,
      linecap: 'round', // ignored by WebGLRenderer
      linejoin: 'round' // ignored by WebGLRenderer
      // opacity: 0.1
    });
    underlayMaterialRef.current = mapMaterial;
    underlayLineMaterialRef.current = lineMaterial;
    const option = {
      mapMaterial,
      lineMaterial,
      altitude: 30,
      highlight: false
    };
    scene.current.add(underlayGroup.current);
    scene.current.add(mapGroup.current);

    const lineMaterial2 = new THREE.LineBasicMaterial({
      color: mapPalette.innerLine,
      transparent: true,
      opacity: 0.6
    });
    overlayLineMaterialRef.current = lineMaterial2;
    // 南宁市
    const option2 = {
      mapMaterial: geoMaterial,
      lineMaterial: lineMaterial2,
      altitude: 1,
      highlight: true
    };
    renderMap(currentGeoJsonRef.current, option, option2);
  };
  const getDynamicMapExtent = (
    json: any
  ): [[number, number], [number, number]] => {
    // 远程省份没有手工 scale，使用统一舞台范围保持与广西本地视图接近的视觉比例。
    const { horizontal, vertical } = DYNAMIC_MAP_EXTENT_RATIO;

    return [
      [-width * horizontal, -height * vertical],
      [width * horizontal, height * vertical]
    ];
  };
  const updateProjection = (json: any) => {
    const currentConfig = mapDataRegistry[currentAdcodeRef.current];
    if (currentConfig.projection) {
      // 本地维护的区域使用固定投影，避免每次适配造成地图比例跳动。
      projection = d3
        .geoMercator()
        .center(currentConfig.projection.center)
        .scale(currentConfig.projection.scale)
        .translate([0, 0]);
      return;
    }

    // 动态远程区域使用 fitExtent，但范围按大屏舞台比例控制，不铺满整个画布。
    projection = d3.geoMercator().fitExtent(getDynamicMapExtent(json), json);
  };
  const clearObjectGroup = (group: THREE.Group) => {
    const children = [...group.children];
    children.forEach((child) => {
      dispose(group, child);
    });
  };
  const renderMap = (json: any, underlayOption: any, overlayOption: any) => {
    currentGeoJsonRef.current = json;
    clearObjectGroup(underlayGroup.current);
    clearObjectGroup(mapGroup.current);
    clearObjectGroup(barGeoGroup.current);
    if (labelGroup.current.length) {
      labelGroup.current.forEach((item: any) => {
        scene.current.remove(item);
      });
      labelGroup.current = [];
    }

    updateProjection(json);
    createMap({ ...underlayOption, json });
    createMap({ ...overlayOption, json });
    initBar(json);
    initLabel(json);
    changeMapStyle('', 'click');
  };
  const createMap = (option: any) => {
    const { json, mapMaterial, lineMaterial, altitude, highlight, isBorder } =
      option;
    // const len = json.features.length;
    for (const feature of json.features) {
      // for (let i = 0; i < len; i += 1) {
      // const feature = json.features[i];
      const { geometry, properties } = feature;
      // 创建地区容器
      const county: THREE.Object3D | any = new THREE.Object3D();
      county.name = properties.name;
      county.userData = {
        ...properties
      };
      // const cLen = geometry.coordinates.length;
      for (const multiPolygon of geometry.coordinates) {
        // for (let j = 0; j < geometry.coordinates.length; j += 1) {
        // const multiPolygon = geometry.coordinates[j];
        // console.log(multiPolygon);
        if (geometry.type === 'MultiPolygon') {
          // const mLen = multiPolygon.length;
          // for (let o = 0; o < mLen; o += 1) {
          // const polygon = multiPolygon[o];
          // console.log(polygon, properties);
          for (const polygon of multiPolygon) {
            const { shape, linGeometry, positions } = createShape(
              polygon,
              altitude
            );
            // console.log(shape, linGeometry, positions);
            // 非边框线
            if (!isBorder) {
              // 拉伸造型
              const extrudeGeometry = new THREE.ExtrudeGeometry(
                shape, // 二维轮廓
                {
                  depth: altitude,
                  // amount: 30, // 拉伸长度
                  bevelEnabled: false // 无倒角
                }
              );

              // const length = shape.getLength();
              // if (length) {
              const mesh: THREE.Mesh | any = new THREE.Mesh(
                extrudeGeometry,
                mapMaterial
              );
              const line = new THREE.Line(linGeometry, lineMaterial);
              // eslint-disable-next-line max-depth
              if (properties.centroid) {
                const [x, y] = projection(properties.centroid);
                mesh.name = properties.name;
                mesh._centroid = [x, -y];
                mesh.userData = {
                  ...properties
                };
                county._centroid = [x, -y];
              }

              // eslint-disable-next-line max-depth
              if (!highlight) {
                county.position.z = -altitude;
                county.position.z = -altitude;
              }
              county.add(mesh);
              county.add(line);
              // }
            } else {
              const geometry = new LineGeometry();
              geometry.setPositions(positions);
              const line = new Line2(geometry, lineMaterial);
              line.name = properties.name;
              line.scale.set(1, 1, 1);
              county.add(line);
            }
          }
        }
      }

      // county.rotateX(Math.PI * 1.5);
      // county.position.x = -width / 2;
      // county.position.z = -height / 2;
      if (!highlight) {
        underlayGroup.current.add(county);
      } else {
        mapGroup.current.add(county);
      }
    }
  };
  const createShape = (points: any, z: number) => {
    const shape = new THREE.Shape();
    const linGeometry = new THREE.BufferGeometry();
    const positions = [];
    // const len = points.length;
    // for (let i = 0; i < len; i += 1) {
    const entries = points.entries();
    for (const [i, p] of entries) {
      // const p = points[i];
      const [x, y] = projection(p);
      if (i === 0) {
        shape.moveTo(x, -y);
      } else {
        shape.lineTo(x, -y);
      }
      positions.push(x, -y, z);
      const vertices = new Float32Array([
        x,
        -y,
        z // 第一个顶点的坐标 (x1, y1, z1)
        // 添加更多的顶点坐标...
      ]);
      linGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(vertices, 3)
      );
    }

    return {
      shape,
      linGeometry,
      positions
    };
  };
  const initMarker = () => {
    if (markerGroup.current.length) {
      markerGroup.current.forEach((item) => {
        scene.current.remove(item);
      });
      markerGroup.current = [];
    }

    // for (const marker of _deptData) {
    //   if (marker.position.length) {
    //     const [x, y] = projection(marker.position);

    //     const point = document.createElement("div");
    //     point.className = "point";
    //     const pointChild = document.createElement("div");
    //     pointChild.className = "child";
    //     pointChild.textContent = marker.name;

    //     point.appendChild(pointChild);

    //     const css2dObj: CSS2DObject | any = new CSS2DObject(point);
    //     css2dObj.visible = false;
    //     css2dObj.name = marker.name;
    //     css2dObj._district = marker.district;
    //     css2dObj.position.x = x;
    //     css2dObj.position.y = -y;
    //     css2dObj.position.z = 51;
    //     // console.log(css2dObj)

    //     markerGroup.current.push(css2dObj);
    //     scene.current.add(css2dObj);
    //   }
    // }
    // console.log(markerGroup);
  };
  const initCylinder = () => {
    const cylinderGeometry = new THREE.CylinderGeometry(1, 15, 20, 4, 20);
    const cylinderMaterial = new THREE.MeshPhongMaterial({
      color: mapPalette.markerFill,
      emissive: mapPalette.markerEmissive,
      specular: 0xfff7d8,
      shininess: 170
    });

    cylinder.current = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    console.log(cylinder.current, 'cylinder.currentcylinder.current');
    cylinder.current.visible = false;
    cylinder.current.rotateX(-Math.PI * 0.5);
    cylinder.current.position.z = 70;
    scene2.current.add(cylinder.current);
  };
  const initDiffusion = () => {
    const width = 20;
    const color = mapPalette.diffusion;
    // 创建box
    // const geometry = new THREE.PlaneBufferGeometry(width, width, 1, 1);
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -width,
      -width,
      0,
      width,
      -width,
      0,
      width,
      width,
      0,
      -width,
      width,
      0
    ]);
    // 定义平面的顶点索引
    const indices = new Uint32Array([0, 1, 2, 0, 2, 3]);
    // 设置顶点位置属性
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    // 设置顶点索引属性
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`;
    const fragmentShader = `
    varying vec2 vUv;
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uSpeed;
    uniform float uSge;
    uniform float time;
    float PI = 3.14159265;
    float drawCircle(float index, float range) {
        float opacity = 1.0;
        if (index >= 1.0 - range) {
            opacity = 1.0 - (index - (1.0 - range)) / range;
        } else if(index <= range) {
            opacity = index / range;
        }
        return opacity;
    }
    float distanceTo(vec2 src, vec2 dst) {
        float dx = src.x - dst.x;
        float dy = src.y - dst.y;
        float dv = dx * dx + dy * dy;
        return sqrt(dv);
    }
    void main() {
        float iTime = -time * uSpeed;
        float opacity = 0.0;
        float len = distanceTo(vec2(0.5, 0.5), vec2(vUv.x, vUv.y));

        float size = 1.0 / uSge;
        vec2 range = vec2(0.65, 0.75);
        float index = mod(iTime + len, size);
        // 中心圆
        vec2 cRadius = vec2(0.06, 0.12);

        if (index < size && len <= 0.5) {
            float i = sin(index / size * PI);

            // 处理边缘锯齿
            if (i >= range.x && i <= range.y){
                // 归一
                float t = (i - range.x) / (range.y - range.x);
                // 边缘锯齿范围
                float r = 0.3;
                opacity = drawCircle(t, r);

            }
            // 渐变
            opacity *=  1.0 - len / 0.5;
        };

        gl_FragColor = vec4(uColor, uOpacity * opacity);
    }`;
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: 1 },
        uSpeed: { value: 0.09 },
        uSge: { value: 3 },
        uRadius: { value: width / 2 },
        time: { value: 0 }
      },
      transparent: true,
      depthWrite: false,
      vertexShader,
      fragmentShader
    });
    diffusion.current = new THREE.Mesh(geometry, material);
    diffusion.current.visible = false;

    diffusion.current.position.x = 0;
    diffusion.current.position.y = 0;
    diffusion.current.position.z = 51;

    diffusion.current.scale.set(5, 5, 5);

    function render2() {
      const delta = clock.getDelta();
      material.uniforms.time.value += delta;
      requestAnimationFrame(render2);
    }
    render2();

    scene.current.add(diffusion.current);
  };
  const onWindowResize = () => {
    if (divRef.current) {
      width = divRef.current.clientWidth;
      height = divRef.current.clientHeight;
    }
    camera.current.aspect = width / height;
    camera.current.updateProjectionMatrix();
    renderer.current?.setSize(width, height, true);
    renderer2.current?.setSize(width, height, true);
    css3DRenderer.current?.setSize(width, height);
    renderCurrentRegion();
  };
  const onMouseEnter = (event: any) => {
    const getBoundingClientRect: any = divRef.current?.getBoundingClientRect();
    mouse.x = ((event.clientX - getBoundingClientRect?.left) / width) * 2 - 1;
    mouse.y =
      -(((event.clientY - getBoundingClientRect?.top) / height) * 2) + 1;

    raycaster.setFromCamera(mouse, camera.current);

    // 地区划入
    const intersects = raycaster.intersectObjects(
      mapGroup.current.children,
      true
    );

    if (intersects.length > 0) {
      // if (markerGroup.visible) return;
      const { object } = intersects[0];
      changeMapStyle(object.name, 'hover');
    } else {
      changeMapStyle('', 'hover');
    }
  };
  const isMapRenderReady = () => {
    return (
      Boolean(underlayMaterialRef.current) &&
      Boolean(underlayLineMaterialRef.current) &&
      Boolean(overlayLineMaterialRef.current)
    );
  };
  const getCurrentRenderOptions = () => {
    return {
      underlay: {
        mapMaterial: underlayMaterialRef.current,
        lineMaterial: underlayLineMaterialRef.current,
        altitude: 30,
        highlight: false
      },
      overlay: {
        mapMaterial: geoMaterial,
        lineMaterial: overlayLineMaterialRef.current,
        altitude: 1,
        highlight: true
      }
    };
  };
  const renderCurrentRegion = () => {
    if (
      !isMapRenderReady()
    ) {
      return;
    }

    const { underlay, overlay } = getCurrentRenderOptions();
    renderMap(currentGeoJsonRef.current, underlay, overlay);
  };
  const fetchRegionJson = async (adcode: string) => {
    const url = getRemoteGeoJsonUrl(adcode);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        return null;
      }

      const json = await res.json();

      return isSelfBoundaryOnly(json, adcode) ? null : json;
    } catch (error) {
      console.warn('地图数据加载失败', url, error);
    }

    return null;
  };
  const getRegionConfig = async (
    adcode: string,
    fallbackName = ''
  ): Promise<MapRegionConfig | null> => {
    if (mapDataRegistry[adcode]) {
      return mapDataRegistry[adcode];
    }

    if (loadingAdcodeRef.current === adcode) {
      return null;
    }

    loadingAdcodeRef.current = adcode;
    const json = await fetchRegionJson(adcode);
    loadingAdcodeRef.current = '';

    if (!json?.features?.length) {
      return null;
    }

    const regionConfig = createRemoteRegionConfig(
      adcode,
      json,
      currentAdcodeRef.current,
      fallbackName
    );
    mapDataRegistry[adcode] = regionConfig;

    return regionConfig;
  };
  const canDrillToRegion = (adcode: string) => {
    // 全国可动态进入任意省；省内只允许进入已有本地配置，避免继续请求不可控层级。
    return (
      currentAdcodeRef.current === ROOT_ADCODE || Boolean(mapDataRegistry[adcode])
    );
  };
  const restoreCamera = (duration = 1200) => {
    const cameraAnim = new TWEEN.Tween(camera.current.position).to(
      {
        x: cameraPostion.x,
        y: cameraPostion.y,
        z: cameraPostion.z
      },
      duration
    );
    cameraAnim.easing(TWEEN.Easing.Quartic.Out).start();

    const targetAnim = new TWEEN.Tween(controls.current.target).to(
      { x: lookAt.x, y: lookAt.y, z: lookAt.z },
      duration
    );
    targetAnim.easing(TWEEN.Easing.Quartic.Out).start();
  };
  const drillToRegion = async (adcode: string, name = '') => {
    const nextRegion = await getRegionConfig(adcode, name);
    if (!nextRegion) {
      return;
    }
    currentAdcodeRef.current = adcode;
    setCurrentRegion(nextRegion);
    currentGeoJsonRef.current = nextRegion.json;
    renderCurrentRegion();
    restoreCamera();
  };
  const restoreMap = () => {
    currentAdcodeRef.current = ROOT_ADCODE;
    setCurrentRegion(mapDataRegistry[ROOT_ADCODE]);
    currentGeoJsonRef.current = mapDataRegistry[ROOT_ADCODE].json;
    renderCurrentRegion();
    changeMapStyle('', 'click');
    restoreCamera();
  };
  const onMapClick = (event: MouseEvent) => {
    const getBoundingClientRect: any = divRef.current?.getBoundingClientRect();
    mouse.x = ((event.clientX - getBoundingClientRect?.left) / width) * 2 - 1;
    mouse.y =
      -(((event.clientY - getBoundingClientRect?.top) / height) * 2) + 1;

    raycaster.setFromCamera(mouse, camera.current);
    const intersects = raycaster.intersectObjects(mapGroup.current.children, true);
    if (!intersects.length) {
      changeMapStyle('', 'click');
      return;
    }

    const { object } = intersects[0] as any;
    const adcode = String(object?.userData?.adcode || '');
    const name = object?.name || '';
    changeMapStyle(name, 'click');
    if (
      adcode &&
      adcode !== currentAdcodeRef.current &&
      canDrillToRegion(adcode)
    ) {
      drillToRegion(adcode, name);
    }
  };
  // 切换地区选中 材质
  const changeMapStyle = (name: string, type: string) => {
    mapGroup.current.traverse((child: any) => {
      if (child.isMesh) {
        // 过滤掉外面线框
        if (type === 'click') {
          child.isSelect = false;
          child.material = geoMaterial;
          if (child.name === name) {
            child.isSelect = true;
            child.material = geoActiveMaterial;
          }
        } else if (type === 'hover') {
          if (!child.isSelect) {
            child.material = geoMaterial;
            if (child.name === name) {
              child.material = geoHoverMaterial;
            }
          }
        }
      }
    });
  };
  const initAnim = () => {
    // 场景旋转
    scene.current.rotation.z = Math.PI;
    const sceneAnim2 = new TWEEN.Tween(scene.current.rotation).to(
      { z: 0 },
      3000
    );
    // // sceneAnim.delay(2000).easing(TWEEN.Easing.Cubic.Out).start();
    sceneAnim2.delay(500).easing(TWEEN.Easing.Quartic.Out).start();

    // 相机位置
    const cameraAnim = new TWEEN.Tween(camera.current.position).to(
      { x: 0, y: -950, z: 950 },
      3000
    );
    // sceneAnim.delay(2000).easing(TWEEN.Easing.Cubic.Out).start();
    cameraAnim.delay(500).easing(TWEEN.Easing.Quartic.Out).start();

    // 地图高度
    mapGroup.current.scale.z = 0.1;
    const mapAnim = new TWEEN.Tween(mapGroup.current.scale).to({ z: 1 }, 1500);
    mapAnim.delay(2500).easing(TWEEN.Easing.Quartic.Out).start();

    // 地图文字
    const nameOption = {
      opacity: 0
    };
    nameRef.current.style.opacity = 0;
    css3DRenderer.current.domElement.style.opacity = 0;
    const nameAnim = new TWEEN.Tween(nameOption)
      .to({ opacity: 1 }, 1500)
      .onUpdate(() => {
        if (nameRef.current) {
          nameRef.current.style.opacity = nameOption.opacity;
          css3DRenderer.current.domElement.style.opacity = nameOption.opacity;
        }
      });
    nameAnim.delay(3000).start();

    // 柱状图
    barGeoGroup.current.scale.z = 0;
    barGeoGroup.current.visible = false;
    const barAnim = new TWEEN.Tween(barGeoGroup.current.scale)
      .to({ z: 1 }, 1500)
      .onUpdate(() => {
        if (!barGeoGroup.current.visible) {
          barGeoGroup.current.visible = true;
        }
      });
    barAnim.delay(3000).easing(TWEEN.Easing.Quartic.Out).start();
  };
  useEffect(() => {
    initThree();
    initScene();
    initCamera();
    initLight();
    initControl();
    // initDat();
    // initGrid();
    animation();
    initMesh();
    initMarker();
    initCylinder();
    initDiffusion();

    window.addEventListener('resize', onWindowResize, false);
    renderer2?.current?.domElement?.addEventListener(
      'mousemove',
      onMouseEnter,
      false
    );
    renderer2?.current?.domElement?.addEventListener('click', onMapClick, false);

    initAnim();
    // cityLoop();
    // _onChange(cityData.find((d) => d.name === '全市') || {}, 2);
    return () => {
      window.removeEventListener('resize', onWindowResize, false);
      renderer2.current?.domElement.removeEventListener(
        'mousemove',
        onMouseEnter,
        false
      );
      renderer2.current?.domElement.removeEventListener('click', onMapClick, false);
      clearAll();
    };
  }, []);
  const initLabel = (json: any) => {
    for (const feature of json.features) {
      const { properties } = feature;
      const target: any = {};
      // _cityData.find((item) => item.name === properties.name) || {};
      const [x, y] = projection(properties?.centroid);
      const label = document.createElement('div');
      label.className = 'label';

      const labelChild = document.createElement('div');
      labelChild.className = 'label-con';
      labelChild.textContent = properties.name;

      const valueChild = document.createElement('span');
      valueChild.className = 'value';
      valueChild.textContent = target?.catalogNum || 'aa';

      labelChild.appendChild(valueChild);
      label.appendChild(labelChild);

      const css2dObj: any = new CSS2DObject(label);
      // css2dObj.visible = false;
      css2dObj.name = properties.name;
      css2dObj.position.x = x;
      css2dObj.position.y = -y;
      css2dObj.position.z = 51;

      labelGroup.current.push(css2dObj);
      scene.current.add(css2dObj);
    }
  };
  const initDat = () => {
    const datGui = new GUI();
    const guiOption = {
      x: camera.current.position.x || 0,
      y: camera.current.position.y || 0,
      z: camera.current.position.z || 0
    };
    datGui.add(guiOption, 'x', -2000, 2000, 1).onChange((value) => {
      camera.current.position.x = value;
    });
    datGui.add(guiOption, 'y', -2000, 2000, 1).onChange((value) => {
      camera.current.position.y = value;
    });
    datGui.add(guiOption, 'z', -2000, 2000, 1).onChange((value) => {
      camera.current.position.z = value;
    });
  };
  const clearAll = () => {
    if (mapTimer) {
      mapIndex = 0;
      clearInterval(mapTimer);
    }
    if (deptTimer) {
      deptIndex = 0;
      clearInterval(deptTimer);
    }

    geoMaterial.dispose();
    geoHoverMaterial.dispose();
    geoActiveMaterial.dispose();
    barMaterial.dispose();
    underlayMaterialRef.current?.dispose();
    underlayLineMaterialRef.current?.dispose();
    overlayLineMaterialRef.current?.dispose();

    const arr = scene.current.children.filter((x: any) => x);
    arr.forEach((a: any) => {
      dispose(scene.current, a);
    });

    const arr2 = scene2.current.children.filter((x: any) => x);
    arr2.forEach((a: any) => {
      dispose(scene2.current, a);
    });

    // console.log(renderer2.current.info); // 查看memery字段即可

    scene.current.clear();
    scene2.current.clear();
    scene.current.remove();
    scene2.current.remove();
    renderer.current?.dispose();
    renderer.current?.forceContextLoss();
    renderer.current.content = null;
    renderer.current.domElement = null;

    renderer2.current?.dispose();
    renderer2.current?.forceContextLoss();
    renderer2.current.content = null;
    renderer2.current.domElement = null;

    // css3DRenderer.dispose();
    // css3DRenderer.forceContextLoss();
    // markerGroup.children = [];
    // map.children = [];
    css3DRenderer.current.content = null;
    css3DRenderer.current.domElement = null;

    cancelAnimationFrame(animationLoop);
    THREE.Cache.clear();
  };
  const dispose = (parent: THREE.Object3D, child: THREE.Object3D | any) => {
    if (child.children.length) {
      const arr = child.children.filter((x: any) => x);
      arr.forEach((a: any) => {
        dispose(child, a);
      });
    }
    if (
      child instanceof THREE.Mesh ||
      child instanceof THREE.Line ||
      child instanceof Line2
    ) {
      if (child.material.map) child.material.map.dispose();
      if (
        child.material !== geoMaterial &&
        child.material !== geoHoverMaterial &&
        child.material !== geoActiveMaterial &&
        child.material !== underlayMaterialRef.current &&
        child.material !== underlayLineMaterialRef.current &&
        child.material !== overlayLineMaterialRef.current
      ) {
        child.material.dispose();
      }
      child.geometry.dispose();
    } else if (
      child.material &&
      child.material !== geoMaterial &&
      child.material !== geoHoverMaterial &&
      child.material !== geoActiveMaterial &&
      child.material !== underlayMaterialRef.current &&
      child.material !== underlayLineMaterialRef.current &&
      child.material !== overlayLineMaterialRef.current
    ) {
      child.material.dispose();
    }
    child.remove();
    parent.remove(child);
  };
  function initBar(json: any) {
    const featureCount = json.features.length;
    const startColor = new THREE.Color(mapPalette.barStart);
    const endColor = new THREE.Color(mapPalette.barEnd);

    for (const [featureIndex, feature] of json.features.entries()) {
      // const len = geoJson.features.length;
      // for (let i = 0; i < len; i += 1) {
      // const feature = geoJson.features[i];
      const { properties } = feature;
      const target: any = {};
      // _cityData.find((item) => item.name === properties.name) || {};
      const max = 0;
      // Math.max(..._cityData.map((d) => d.catalogNum || 0));
      const [x, y] = projection(properties.centroid);
      // const x1 = x - (width / 2);
      // const y1 = -(y - (height / 2));
      const h = target.catalogNum ? Math.round(100 / (max / 100)) : 0;

      const boxGeo = new THREE.BoxGeometry(15, 15, h);
      const boxMaterial = barMaterial.clone();
      const barColor = new THREE.Color().lerpColors(
        startColor,
        endColor,
        featureCount <= 1 ? 0.5 : featureIndex / (featureCount - 1)
      );
      boxMaterial.color.copy(barColor);
      boxMaterial.emissive.copy(barColor).multiplyScalar(0.28);

      const boxMesh = new THREE.Mesh(boxGeo, boxMaterial);
      boxMesh.position.x = x;
      boxMesh.position.y = -y + 30;
      boxMesh.position.z = h / 2 + 50;

      barGeoGroup.current.add(boxMesh);
    }
    if (!scene.current.children.includes(barGeoGroup.current)) {
      scene.current.add(barGeoGroup.current);
    }
  }
  return (
    <div className={styles.mapWrap}>
      <div className={`${styles.tabs} ${styles.tabsBottom}`}>
        {currentRegion.parentAdcode ? (
          <Button
            onClick={() => {
              drillToRegion(currentRegion.parentAdcode as string);
            }}
          >
            返回上级
          </Button>
        ) : null}
        <Button
          onClick={() => {
            restoreMap();
          }}
        >
          恢复地图
        </Button>
        <Button
          onClick={() => {
            restoreCamera(2000);
          }}
        >
          恢复视角
        </Button>
      </div>
      <div ref={divRef} className={styles.map} />
      <canvas ref={nameRef} className={styles.name} />
    </div>
  );
};

export default ThreeMapDemo;
