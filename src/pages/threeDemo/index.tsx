import React, { useState, useEffect, useRef, MutableRefObject } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import TWEEN from '@tweenjs/tween.js';
// import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
// import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

import styles from './index.module.less';

const ThreeDemo = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const scene: MutableRefObject<THREE.Scene> | any = useRef<THREE.Scene>(null);
  const mixer: MutableRefObject<THREE.AnimationMixer> | any =
    useRef<THREE.AnimationMixer>(null);
  const initThree = () => {
    let width: string | number = 0;
    let height: string | number = 0;
    scene.current = new THREE.Scene();
    // 声明一个组对象，用来添加加载成功的三维场景
    const model = new THREE.Group();
    if (divRef.current) {
      width = divRef.current.clientWidth;
      height = divRef.current.clientHeight;
    }
    //  添加glb模型
    const loader = new GLTFLoader();
    loader.load('./dddd.glb', (gltf) => {
      scene.current.add(gltf.scene);
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
    const camera = new THREE.PerspectiveCamera(30, width / height, 1, 1000);
    // 设置相机位置
    camera.position.set(8, 8, 8);
    // 设置相机方向(指向的场景对象)
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    if (divRef.current) {
      divRef.current.appendChild(renderer.domElement);
    }
    createCube();
    // 设置相机控件轨道控制器OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    // 解决加载gltf格式模型颜色偏差问题
    let clock = new THREE.Clock();
    const renders = () => {
      // 动画更新
      TWEEN.update();
      renderer.render(scene.current, camera);
      requestAnimationFrame(renders);
      mixer.current.update(clock.getDelta());
    };
    renders();
  };
  const createCube = () => {
    // 通过类CatmullRomCurve3创建一个3D样条曲线
    let curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0.8, 5, 5),
      new THREE.Vector3(-0.5, 0, 10)
    ]);
    // 样条曲线均匀分割100分，返回51个顶点坐标
    let points = curve.getPoints(100);
    let geometry = new THREE.BufferGeometry().setFromPoints(points);
    let material = new THREE.LineBasicMaterial({
      color: 0x4488ff
    });
    let line = new THREE.Line(geometry, material);
    scene.current?.add(line);

    let arr = [];
    for (let i = 0; i < 101; i++) {
      arr.push(i);
    }
    // 生成一个时间序列
    let times = new Float32Array(arr);
    let posArr: any = [];
    points.forEach((elem) => {
      posArr.push(elem.x, elem.y, elem.z);
    });
    // 创建一个立方体
    let box = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    // 材质对象
    let material3 = new THREE.MeshLambertMaterial({
      color: 0x0000ff
    });
    // Mesh函数是将几何体和材质结合生成网格，几何体和材质结合成网格才能渲染到屏幕上
    let mesh = new THREE.Mesh(box, material3);
    // 将几何体和材质对象添加到场景中
    scene.current.add(mesh);
    mesh.position.set(-10, -50, -50);
    // 创建一个和时间序列相对应的位置坐标系列
    let values = new Float32Array(posArr);
    mixer.current = new THREE.AnimationMixer(mesh);
    // 创建一个帧动画的关键帧数据，曲线上的位置序列对应一个时间序列
    let posTrack = new THREE.KeyframeTrack('.position', times, values);
    let duration = 101;
    let clip = new THREE.AnimationClip('default', duration, [posTrack]);
    let AnimationAction = mixer.current.clipAction(clip);
    AnimationAction.timeScale = 20;
    AnimationAction.play();
  };
  useEffect(() => {
    initThree();
  }, []);

  return <div id={styles.iviewBg} ref={divRef} />;
};

export default ThreeDemo;
