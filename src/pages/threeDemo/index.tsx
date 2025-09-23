import React, { useState, useEffect, useRef, MutableRefObject } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PathPointList } from './PathPointList';
import { PathGeometry } from './PathGeometry';
import TWEEN from '@tweenjs/tween.js';
import { pointArr } from './data';
import MyArr from '@/assets/images/arrow.png';
// import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
// import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

import styles from './index.module.less';

const ThreeDemo = () => {
  const divRef = useRef<HTMLDivElement | null>(null); // 定义初始化容器
  const scene = useRef<THREE.Scene | any>(null); // 定义场景
  const mixer = useRef<THREE.AnimationMixer | null>(null); // 定义运动轨迹动画
  const camera = useRef<THREE.PerspectiveCamera | any>(null); // 定义相机
  const controls = useRef<OrbitControls | any>(null); // 定义控制器
  const renderer = useRef<THREE.WebGLRenderer | any>(null); // 定义渲染器
  const clock: THREE.Clock = new THREE.Clock(); // 定义时钟
  const [renderFuncs, setRenderFuncs] = useState<any>({});
  const pathCurve = useRef<any>(null);
  // 初始化函数
  const initThree = () => {
    let width: string | number = 0;
    let height: string | number = 0;
    scene.current = new THREE.Scene();
    // 声明一个组对象，用来添加加载成功的三维场景
    if (divRef.current) {
      width = divRef.current.clientWidth;
      height = divRef.current.clientHeight;
    }
    //  添加glb模型
    const loader = new GLTFLoader();
    loader.load('./dddd.glb', (gltf) => {
      scene?.current?.add(gltf.scene);
    });
    // 辅助观察的坐标系
    const axesHelper = new THREE.AxesHelper(100);
    // 将坐标系添加到场景中
    scene.current.add(axesHelper);
    // 添加光源 直线光源
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    // 添加光源位置
    directionalLight.position.set(10, 10, 10);
    // 设置光源方向
    scene.current.add(directionalLight);
    // 添加环境光
    const ambient = new THREE.AmbientLight(0xffffff);
    // 将光线添加到场景中
    scene.current.add(ambient);

    // 渲染器和相机
    // THREE.PerspectiveCamera(摄像机视锥体垂直视野角度, 摄像机视锥体长宽比, 摄像机视锥体近端面, 摄像机视锥体远端面)
    camera.current = new THREE.PerspectiveCamera(35, width / height, 1, 2000);
    // 设置相机位置
    camera.current.position.set(8, 8, 8);
    // 设置相机方向(指向的场景对象)
    camera.current.lookAt(0, 0, 0);
    renderer.current = new THREE.WebGLRenderer({
      antialias: true, // 消除锯齿
      logarithmicDepthBuffer: true // 对数深度缓冲区
    });
    renderer.current.setSize(width, height);
    if (divRef.current) {
      divRef.current.appendChild(renderer.current.domElement);
    }
    // createCube();
    // 设置相机控件轨道控制器OrbitControls
    // 创建控制器
    controls.current = new OrbitControls(
      camera.current,
      renderer.current.domElement
    );
    renders();
  };
  // 测试创建立方体、创建轨迹运动路线
  // const createCube = () => {
  //   // 通过类CatmullRomCurve3创建一个3D样条曲线
  //   let curve = new THREE.CatmullRomCurve3([
  //     new THREE.Vector3(0, 0, 0),
  //     new THREE.Vector3(1, 0, 0),
  //     new THREE.Vector3(0.8, 5, 5),
  //     new THREE.Vector3(-0.5, 0, 10)
  //   ]);
  //   // 样条曲线均匀分割100分，返回51个顶点坐标
  //   let points = curve.getPoints(100);
  //   let geometry = new THREE.BufferGeometry().setFromPoints(points);
  //   let material = new THREE.LineBasicMaterial({
  //     color: 0x4488ff
  //   });
  //   let line = new THREE.Line(geometry, material);
  //   scene.current?.add(line);

  //   let arr = [];
  //   for (let i = 0; i < 101; i++) {
  //     arr.push(i);
  //   }
  //   // 生成一个时间序列
  //   let times = new Float32Array(arr);
  //   let posArr: any = [];
  //   points.forEach((elem) => {
  //     posArr.push(elem.x, elem.y, elem.z);
  //   });
  //   // 创建一个立方体
  //   let box = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  //   // 材质对象
  //   let material3 = new THREE.MeshLambertMaterial({
  //     color: 0x0000ff
  //   });
  //   // Mesh函数是将几何体和材质结合生成网格，几何体和材质结合成网格才能渲染到屏幕上
  //   let mesh = new THREE.Mesh(box, material3);
  //   // 将几何体和材质对象添加到场景中
  //   scene.current.add(mesh);
  //   mesh.position.set(-10, -50, -50);
  //   // 创建一个和时间序列相对应的位置坐标系列
  //   let values = new Float32Array(posArr);
  //   mixer.current = new THREE.AnimationMixer(mesh);
  //   // 创建一个帧动画的关键帧数据，曲线上的位置序列对应一个时间序列
  //   let posTrack = new THREE.KeyframeTrack('.position', times, values);
  //   let duration = 101;
  //   let clip = new THREE.AnimationClip('default', duration, [posTrack]);
  //   let AnimationAction = mixer.current.clipAction(clip);
  //   AnimationAction.timeScale = 20;
  //   AnimationAction.play();
  // };
  // 初始化运动轨迹
  const initPathPoints = async () => {
    const points: any[] = [];
    // 每3个元素组成一个坐标
    for (let i = 0; i < pointArr.length; i += 3) {
      // 将数组中的三个元素，分别作为坐标的x, y, z
      points.push(
        new THREE.Vector3(pointArr[i], pointArr[i + 1], pointArr[i + 2])
      );
    }
    // 生成一条不闭合曲线
    pathCurve.current = new THREE.CatmullRomCurve3(
      points,
      false,
      'catmullrom',
      0
    );
  };
  // 渲染路径
  const renderPath = async () => {
    // 金色箭头的png作为材质
    const arrow = await new THREE.TextureLoader().loadAsync(MyArr);

    // 贴图在水平方向上允许重复
    arrow.wrapS = THREE.RepeatWrapping;
    // 向异性
    arrow.anisotropy = renderer.current.capabilities.getMaxAnisotropy();

    // 创建一个合适的材质
    const material = new THREE.MeshPhongMaterial({
      map: arrow,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    // 确定一个向上的向量
    const up: THREE.Vector3 | any = new THREE.Vector3(0, 1, 0);

    // 创建路径点的集合
    const pathPoints = new PathPointList();

    // 设置集合属性
    pathPoints.set(pathCurve.current.getPoints(1000), 0.5, 2, up, false);

    // 创建路径几何体
    const geometry = new PathGeometry();

    // 更新几何体的属性
    geometry.update(pathPoints, {
      width: 15,
      arrow: false
    });

    // 创建路径的网格模型
    let pathToShow: THREE.Mesh | any = new THREE.Mesh(geometry, material);

    // 添加到场景
    scene.current.add(pathToShow);

    // 在每一帧渲染的时候，更新贴图沿x轴的偏移量，形成uv动画效果
    registerRenderFunc('walk-way', () => {
      arrow.offset.x -= 0.02;
    });
  };
  const registerRenderFunc = (key: string, func: () => void) => {
    setRenderFuncs((prev: any) => {
      return {
        ...prev,
        [key]: func
      };
    });
  };

  /**
   * 开始漫游
   */
  const startWalking = () => {
    // 处理一下坐标点
    initPathPoints();

    // 渲染路径
    renderPath();
  };
  // 渲染函数
  const renders = () => {
    renderer.current.render(scene?.current, camera.current);
    startWalking();
    requestAnimationFrame(renders);
    TWEEN.update();
    // mixer?.current?.update(clock.getDelta());
    // // 更新控制器
    // controls.current.update();
  };
  const animate = () => {
    // 动画更新
    requestAnimationFrame(animate);
    // 获取时间差
    const delta = clock.getDelta();
    // 更新补间动画
    // if (TWEEN && cameraTween) TWEEN.update();
    const funcNames = Object.keys(renderFuncs);
    if (funcNames && funcNames.length > 0) {
      funcNames.forEach((funcName) => {
        try {
          // 不太放心，try-catch一下，保证出现意外也能继续执行后面的内容
          renderFuncs[funcName](delta);
        } catch (e) {
          console.error(
            'render func error, func name: ',
            funcName,
            ', error message:'
          );
        }
      });
    }
  };
  useEffect(() => {
    initThree();
    // 初始化点
  }, []);

  return <div id={styles.iviewBg} ref={divRef} />;
};

export default ThreeDemo;
