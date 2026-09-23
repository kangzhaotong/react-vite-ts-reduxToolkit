import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

export interface MapLabelOptions {
  /** 区域全名，用于和悬停/选中的区域匹配 */
  name: string;
  /** 展示文案，默认用 name */
  label?: string;
  /** 数值文案，如 "6.5万亿"；不传则只显示名称 */
  value?: string;
  /** 避让优先级，越大越优先显示 */
  priority: number;
}

export interface LabelEntry {
  object: CSS2DObject;
  element: HTMLElement;
  name: string;
  priority: number;
  width: number;
  height: number;
}

interface ScreenRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const createLabelElement = ({
  name,
  label,
  value
}: Omit<MapLabelOptions, 'priority'>) => {
  const element = document.createElement('div');
  element.className = value ? 'map-label map-label-data' : 'map-label';

  const nameNode = document.createElement('span');
  nameNode.className = 'map-label-name';
  nameNode.textContent = label || name;
  element.appendChild(nameNode);

  if (value) {
    const valueNode = document.createElement('span');
    valueNode.className = 'map-label-value';
    valueNode.textContent = value;
    element.appendChild(valueNode);
  }

  return element;
};

/**
 * 创建挂在三维锚点上方的 CSS2D 标签（底部中心对齐锚点）
 */
export const createLabelObject = (
  options: MapLabelOptions,
  position: { x: number; y: number; z: number }
): LabelEntry => {
  const element = createLabelElement(options);
  const object = new CSS2DObject(element);
  object.position.set(position.x, position.y, position.z);
  object.center.set(0.5, 1);

  return {
    object,
    element,
    name: options.name,
    priority: options.priority,
    width: 0,
    height: 0
  };
};

const FALLBACK_LABEL_WIDTH = 96;
const FALLBACK_LABEL_HEIGHT = 28;
const LABEL_GAP = 3;

/**
 * 屏幕空间标签避让：每帧按优先级贪心放置，与已放置标签重叠的隐藏；
 * focusName（悬停区域）对应的标签始终优先显示并高亮。
 */
export class LabelCollisionResolver {
  private entries: LabelEntry[] = [];

  private readonly vector = new THREE.Vector3();

  public setEntries(entries: LabelEntry[]) {
    this.entries = [...entries].sort((a, b) => b.priority - a.priority);
  }

  public clear() {
    this.entries = [];
  }

  public update(
    camera: THREE.Camera,
    width: number,
    height: number,
    focusName = ''
  ) {
    if (!this.entries.length) {
      return;
    }

    const ordered = focusName
      ? [
          ...this.entries.filter((entry) => entry.name === focusName),
          ...this.entries.filter((entry) => entry.name !== focusName)
        ]
      : this.entries;
    const placed: ScreenRect[] = [];

    for (const entry of ordered) {
      // 元素首次可见后才能量到真实尺寸，之前用估算值
      if (!entry.width && entry.element.offsetWidth) {
        entry.width = entry.element.offsetWidth;
        entry.height = entry.element.offsetHeight;
      }
      const labelWidth = entry.width || FALLBACK_LABEL_WIDTH;
      const labelHeight = entry.height || FALLBACK_LABEL_HEIGHT;

      this.vector.setFromMatrixPosition(entry.object.matrixWorld).project(camera);
      const x = ((this.vector.x + 1) / 2) * width;
      const y = ((1 - this.vector.y) / 2) * height;
      const rect: ScreenRect = {
        left: x - labelWidth / 2 - LABEL_GAP,
        right: x + labelWidth / 2 + LABEL_GAP,
        top: y - labelHeight - LABEL_GAP,
        bottom: y + LABEL_GAP
      };

      const offscreen =
        this.vector.z > 1 ||
        rect.right < 0 ||
        rect.left > width ||
        rect.bottom < 0 ||
        rect.top > height;
      const collides =
        !offscreen &&
        placed.some(
          (other) =>
            rect.left < other.right &&
            rect.right > other.left &&
            rect.top < other.bottom &&
            rect.bottom > other.top
        );
      const hidden = offscreen || collides;

      entry.element.classList.toggle('is-hidden', hidden);
      entry.element.classList.toggle('is-active', entry.name === focusName);
      if (!hidden) {
        placed.push(rect);
      }
    }
  }
}
