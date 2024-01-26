/*
 * @Author: M78.Kangzhaotong
 * @Date: 2024-01-25 13:58:56
 * @Last Modified by: M78.Kangzhaotong
 * @Last Modified time: 2024-01-25 15:03:01
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
// import geoJson450100 from './json/450100.json';
// import geoJson450000_Full from './json/450000_full.json';
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
const geoMaterial = new THREE.MeshPhongMaterial({
  color: 0x2461b4,
  // map: texture,
  transparent: true,
  opacity: 0.6
});
const geoHoverMaterial = new THREE.MeshPhongMaterial({
  color: 0xffa11f,
  // map: texture,
  transparent: true,
  opacity: 0.5
});
const geoActiveMaterial = new THREE.MeshPhongMaterial({
  color: 0xffa11f,
  // map: texture,
  transparent: true,
  opacity: 0.8
});

const barMaterial = new THREE.MeshPhongMaterial({
  color: 0x28d0ff,
  transparent: true,
  opacity: 0.8
});
const raycaster = new THREE.Raycaster();
// 射线
const mouse = new THREE.Vector2();

let mapIndex = 0;
let mapTimer: any;
let deptIndex = 0;
let deptTimer: any;
let animationLoop: any;

// const worldPosition = new THREE.Vector3();
// const camPosition = new THREE.Vector3();
const _dataAccess: any = {};
const ThreeMapDemo = () => {
  const renderer: any = useRef<THREE.WebGLRenderer | null>();
  const renderer2: any = useRef();
  const camera: MutableRefObject<THREE.PerspectiveCamera> | any = useRef();
  const scene: MutableRefObject<THREE.Scene> | any = useRef();
  const scene2: MutableRefObject<THREE.Scene> | any = useRef();
  const controls: MutableRefObject<MapControls> | any = useRef();
  const css3DRenderer: any = useRef<CSS2DRenderer>();
  const cylinder: MutableRefObject<THREE.Mesh> | any = useRef(); // 锥体
  const diffusion: MutableRefObject<THREE.Mesh> | any = useRef(); // 扩散

  const mapGroup = useRef(new THREE.Group());
  const barGeoGroup = useRef(new THREE.Group());
  const markerGroup: MutableRefObject<THREE.Group[]> = useRef([]);
  const labelGroup: any = useRef([]);

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
    scene.background = new THREE.Color(0x000000);
    // 雾化场景
    scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    const ambientLight2 = new THREE.AmbientLight(0xffffff, 1);
    // ambientLight.layers.enable(0);
    // ambientLight.layers.enable(1);
    scene?.current?.add(ambientLight);
    scene2?.current?.add(ambientLight2);

    // 环境光、更加贴近自然的户外光照效果。
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000);
    hemiLight.position.set(0, 20, 0);
    scene2.current.add(hemiLight);

    // 平行光
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff);
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

    if (cylinder.current && cylinder.current.visible) {
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
    const planes = [
      { radius: 1400, map: texture1, rotate: Math.PI * 2, dur: 24000 },
      { radius: 1260, map: texture2, rotate: Math.PI * 2, dur: 16000 },
      { radius: 1160, map: texture3, rotate: Math.PI * 2, dur: 8000 }
    ];

    planes.forEach((item) => {
      const plane = new THREE.PlaneGeometry(item.radius, item.radius);
      const planeMaterial = new THREE.MeshBasicMaterial({
        map: item.map,
        transparent: true,
        depthWrite: false
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
    let colors = [new THREE.Color(0xff0000), new THREE.Color(0x00ff00)];
    const mapMaterial = new THREE.MeshPhongMaterial({
      vertexColors: true,
      color: new THREE.Color().lerpColors(colors[0], colors[1], 0.5),
      depthWrite: false,
      transparent: true,
      opacity: 0.5
    });
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x28d0ff,
      transparent: true,
      linewidth: 1,
      linecap: 'round', // ignored by WebGLRenderer
      linejoin: 'round' // ignored by WebGLRenderer
      // opacity: 0.1
    });
    const option = {
      mapMaterial,
      lineMaterial,
      altitude: 30,
      highlight: false
    };
    // 全国;
    createMap({ ...option, json: geoJson100000_Full });
    // 广西省
    // createMap({ ...option, json: geoJson100000_Full });

    const lineMaterial2 = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5
    });
    // 南宁市
    const option2 = {
      json: geoJson100000_Full,
      mapMaterial: geoMaterial,
      lineMaterial: lineMaterial2,
      altitude: 1,
      highlight: true
    };
    createMap(option2);

    scene.current.add(mapGroup.current);
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
              if (properties.centroid) {
                const [x, y] = projection(properties.centroid);
                mesh.name = properties.name;
                mesh._centroid = [x, -y];
                county._centroid = [x, -y];
              }

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
        scene.current.add(county);
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
      color: 0xf0b931
    });

    cylinder.current = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.current.visible = false;
    cylinder.current.rotateX(-Math.PI * 0.5);
    cylinder.current.position.z = 70;
    scene2.current.add(cylinder.current);
  };
  const initDiffusion = () => {
    const width = 20;
    const color = '#ffff00';
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

    // console.log(intersects, '1');
    if (intersects.length > 0) {
      // if (markerGroup.visible) return;
      const { object } = intersects[0];
      // console.log(intersects);
      changeMapStyle(object.name, 'hover');
    } else {
      changeMapStyle('', 'hover');
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
    // 墨卡托投影转换
    // d3.v3
    projection = d3
      .geoMercator()
      .center([108.778074408, 30.0572355018])
      .scale(1500)
      .translate([0, 0]);

    // d3.v5
    // 自动计算宽高和大小
    //  fitExtent   两个数组参数分别：  []: 边界左边和上面, [] 边界右边和下边
    // projection = d3.geoMercator().fitExtent([[-width / 2, -height / 2], [width / 2, height / 2]], geoJson);
    // 注意 threejs 坐标0,0,0 是在画布的中间，所以要除以2处理
    // projection = d3.geoMercator().fitSize([width, height], geoJson);
    // fitSize 是 fitExtent 简写方式， 左上角为[0, 0]

    // 为了不同分辨率显示大小一致，使用固定大小方式。
    // 手动调整中心点和大小位移
    // projection = d3.geoMercator().center([108.467546, 23.055985]).scale(36000).translate([0, 0]);

    initScene();
    initCamera();
    initLight();
    initControl();
    // initDat();
    // initGrid();
    animation();
    initMesh();
    initBar();
    initLabel();
    initMarker();
    initCylinder();
    initDiffusion();

    window.addEventListener('resize', onWindowResize, false);
    renderer2?.current?.domElement?.addEventListener(
      'mousemove',
      onMouseEnter,
      false
    );

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
      clearAll();
    };
  }, []);
  const initLabel = () => {
    if (labelGroup.current.length) {
      labelGroup.current.forEach((item: any) => {
        scene.current.remove(item);
      });
      labelGroup.current = [];
    }

    for (const feature of geoJson100000_Full.features) {
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
      // console.log(css2dObj)

      labelGroup.current.push(css2dObj);
      scene.current.add(css2dObj);
    }
  };
  const initDat = () => {
    const datGui = new GUI();
    // console.log(camera);
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

    const arr = scene.current.children.filter((x: any) => x);
    arr.forEach((a: any) => {
      dispose(scene.current, a);
    });

    const arr2 = scene2.current.children.filter((x: any) => x);
    arr2.forEach((a: any) => {
      dispose(scene2.current, a);
    });

    // console.log(renderer.current.info); // 查看memery字段即可
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
      child.material.dispose();
      child.geometry.dispose();
    } else if (child.material) {
      child.material.dispose();
    }
    child.remove();
    parent.remove(child);
  };
  function initBar() {
    if (barGeoGroup.current) {
      scene.current.remove(barGeoGroup.current);
    }

    for (const feature of geoJson100000_Full.features) {
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
      // console.log(h, max, target);

      const boxGeo = new THREE.BoxGeometry(15, 15, h);

      const boxMesh = new THREE.Mesh(boxGeo, barMaterial);
      boxMesh.position.x = x;
      boxMesh.position.y = -y + 30;
      boxMesh.position.z = h / 2 + 50;

      barGeoGroup.current.add(boxMesh);
    }
    scene.current.add(barGeoGroup.current);
  }
  return (
    <div className={styles.mapWrap}>
      <div className={`${styles.tabs} ${styles.tabsBottom}`}>
        <Button
          onClick={() => {
            // 相机位置
            const cameraAnim = new TWEEN.Tween(camera.current.position).to(
              { x: 0, y: -1250, z: 950 },
              2000
            );
            cameraAnim.delay(500).easing(TWEEN.Easing.Quartic.Out).start();

            // 相机中心点
            const cameraAnim2 = new TWEEN.Tween(controls.current.target).to(
              { x: lookAt.x, y: lookAt.y, z: lookAt.z },
              2000
            );
            cameraAnim2.delay(500).easing(TWEEN.Easing.Quartic.Out).start();
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
