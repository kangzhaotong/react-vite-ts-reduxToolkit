// 指针类型
class pointerPrototype {
  constructor() {
    this.id = -1;
    this.texcoordX = 0;
    this.texcoordY = 0;
    this.prevTexcoordX = 0;
    this.prevTexcoordY = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.down = false;
    this.moved = false;
    this.color = [30, 0, 300];
  }
  id: number;
  texcoordX: number;
  texcoordY: number;
  prevTexcoordX: number;
  prevTexcoordY: number;
  deltaX: number;
  deltaY: number;
  down: boolean;
  moved: boolean;
  color: number[];
}
// 初始配置
let config = {
  // 模拟分辨率
  SIM_RESOLUTION: 128,
  // 染色分辨率
  DYE_RESOLUTION: 1024,
  // 截图分辨率
  CAPTURE_RESOLUTION: 512,
  // 密度扩散
  DENSITY_DISSIPATION: 1,
  // 速度扩散
  VELOCITY_DISSIPATION: 0.2,
  // 压力
  PRESSURE: 0.8,
  // 压力迭代
  PRESSURE_ITERATIONS: 20,
  // 旋涡
  CURL: 30,
  // 溅起半径
  SPLAT_RADIUS: 0.25,
  // 溅起力量
  SPLAT_FORCE: 6000,
  // 是否着色
  SHADING: true,
  // 是否多彩
  COLORFUL: true,
  // 颜色更新速度
  COLOR_UPDATE_SPEED: 10,
  // 是否暂停
  PAUSED: false,
  // 背景色
  BACK_COLOR: { r: 0, g: 0, b: 0 },
  // 是否透明
  TRANSPARENT: false,
  // 是否发光
  BLOOM: true,
  // 发光迭代
  BLOOM_ITERATIONS: 8,
  // 发光分辨率
  BLOOM_RESOLUTION: 256,
  // 发光强度
  BLOOM_INTENSITY: 0.8,
  // 发光阈值
  BLOOM_THRESHOLD: 0.6,
  // 发光柔和 knee
  BLOOM_SOFT_KNEE: 0.7,
  // 是否阳光
  SUNRAYS: true,
  // 阳光分辨率
  SUNRAYS_RESOLUTION: 196,
  // 阳光权重
  SUNRAYS_WEIGHT: 1.0
};
export { pointerPrototype, config };
