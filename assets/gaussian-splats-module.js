/**
 * Gaussian Splats 3D 模块
 * 为静态网站提供可配置的 3D 高斯泼溅点渲染功能
 * 支持 Liquid 模板变量配置，通过 data 属性传递
 */

console.log('[Gaussian Splats 3D 模块] 模块加载开始');

// 导入依赖
import * as THREE from 'three';
import { SplatMesh } from '@sparkjsdev/spark';

// 默认配置
const DEFAULT_CONFIG = {
  // 模型配置
  modelUrl: './assets/one.ply',
  modelPosition: '-3,0,0',          // x,y,z 位置
  modelQuaternion: '1,0,0,0',   // x,y,z,w 四元数

  // 相机配置
  cameraPosition: '0,0,5',
  fov: 60,                         // 视野角度
  near: 0.1,                       // 近裁剪面
  far: 1000,                       // 远裁剪面

  // 动画配置
  rotationSpeed: 0.01,             // Y轴旋转速度（保留配置，但不用于自动旋转）

  // 背景配置
  backgroundColor: '0xffffff',     // 十六进制颜色

  // 响应式配置
  desktopHeight: 600,              // 桌面端最小高度
  mobileHeight: 480,               // 移动端最小高度
  desktopBreakpoint: 768,          // 桌面端断点

  // 功能开关
  enableResize: true,              // 启用窗口大小调整监听
  enableAutoRotation: false,       // 启用自动旋转（默认禁用，改为交互控制）
  enableMouseControl: true,        // 启用鼠标控制
  enableTouchControl: true,        // 启用触摸控制
  rotationSensitivity: 0.005,      // 交互旋转灵敏度

  // 缩放配置
  enableZoom: true,                // 启用缩放功能
  enableMouseWheelZoom: true,      // 启用鼠标滚轮缩放
  enablePinchZoom: true,           // 启用双指捏合缩放
  zoomSensitivity: 0.001,          // 缩放灵敏度
  minZoomDistance: 1,              // 最小缩放距离（相机到模型）
  maxZoomDistance: 20,             // 最大缩放距离

  // 调试配置
  debug: false                     // 调试模式
};

/**
 * 解析配置字符串为数值
 * @param {string} str - 逗号分隔的字符串
 * @param {number} count - 期望的元素数量
 * @returns {number[]} 数值数组
 */
function parseFloatArray(str, count = 3) {
  if (!str) return new Array(count).fill(0);

  try {
    const parts = str.split(',').map(part => {
      const trimmed = part.trim();
      return trimmed === '' ? 0 : parseFloat(trimmed);
    });

    // 确保数组长度正确
    while (parts.length < count) parts.push(0);
    return parts.slice(0, count);
  } catch (error) {
    console.warn('[Gaussian Splats 3D] 解析浮点数数组失败:', str, error);
    return new Array(count).fill(0);
  }
}

/**
 * 解析十六进制颜色字符串
 * @param {string} hexStr - 十六进制颜色字符串 (如 '0xffffff' 或 '#ffffff')
 * @returns {number} THREE.js 颜色数值
 */
function parseHexColor(hexStr) {
  if (!hexStr) return 0xffffff;

  try {
    // 移除可能的前缀
    let cleanHex = hexStr.trim();
    if (cleanHex.startsWith('0x')) {
      cleanHex = cleanHex.substring(2);
    } else if (cleanHex.startsWith('#')) {
      cleanHex = cleanHex.substring(1);
    }

    // 确保长度正确
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }

    return parseInt(cleanHex, 16);
  } catch (error) {
    console.warn('[Gaussian Splats 3D] 解析颜色失败:', hexStr, error);
    return 0xffffff;
  }
}

/**
 * 从容器元素获取配置
 * @param {HTMLElement} container - 容器元素
 * @returns {Object} 合并后的配置对象
 */
function getConfigFromElement(container) {
  const config = { ...DEFAULT_CONFIG };

  // 尝试从 data-config 属性获取 JSON 配置
  const configJson = container.dataset.config;
  if (configJson) {
    try {
      const parsedConfig = JSON.parse(configJson);
      Object.assign(config, parsedConfig);
    } catch (error) {
      console.error('[Gaussian Splats 3D] 解析 JSON 配置失败:', error);
    }
  }

  // 从独立 data 属性获取配置（兼容性）
  if (container.dataset.modelUrl) config.modelUrl = container.dataset.modelUrl;
  if (container.dataset.modelPosition) config.modelPosition = container.dataset.modelPosition;
  if (container.dataset.modelQuaternion) config.modelQuaternion = container.dataset.modelQuaternion;
  if (container.dataset.cameraPosition) config.cameraPosition = container.dataset.cameraPosition;
  if (container.dataset.rotationSpeed) config.rotationSpeed = parseFloat(container.dataset.rotationSpeed);
  if (container.dataset.backgroundColor) config.backgroundColor = container.dataset.backgroundColor;
  if (container.dataset.desktopHeight) config.desktopHeight = parseInt(container.dataset.desktopHeight);
  if (container.dataset.mobileHeight) config.mobileHeight = parseInt(container.dataset.mobileHeight);
  if (container.dataset.fov) config.fov = parseFloat(container.dataset.fov);
  if (container.dataset.debug !== undefined) config.debug = container.dataset.debug === 'true';

  // 交互控制配置解析
  if (container.dataset.enableMouseControl !== undefined) config.enableMouseControl = container.dataset.enableMouseControl === 'true';
  if (container.dataset.enableTouchControl !== undefined) config.enableTouchControl = container.dataset.enableTouchControl === 'true';
  if (container.dataset.rotationSensitivity) config.rotationSensitivity = parseFloat(container.dataset.rotationSensitivity);

  // 缩放控制配置解析
  if (container.dataset.enableZoom !== undefined) config.enableZoom = container.dataset.enableZoom === 'true';
  if (container.dataset.enableMouseWheelZoom !== undefined) config.enableMouseWheelZoom = container.dataset.enableMouseWheelZoom === 'true';
  if (container.dataset.enablePinchZoom !== undefined) config.enablePinchZoom = container.dataset.enablePinchZoom === 'true';
  if (container.dataset.zoomSensitivity) config.zoomSensitivity = parseFloat(container.dataset.zoomSensitivity);
  if (container.dataset.minZoomDistance) config.minZoomDistance = parseFloat(container.dataset.minZoomDistance);
  if (container.dataset.maxZoomDistance) config.maxZoomDistance = parseFloat(container.dataset.maxZoomDistance);

  return config;
}

/**
 * 初始化单个 Gaussian Splats 3D 场景
 * @param {HTMLElement} container - 容器元素
 * @param {Object} customConfig - 自定义配置（可选）
 * @returns {Object|null} 场景对象，包含 scene, camera, renderer, splat
 */
export function initGaussianSplats(container, customConfig = {}) {
  console.log('[Gaussian Splats 3D] 初始化场景', container.id || container.className);

  try {
    // 合并配置
    const baseConfig = getConfigFromElement(container);
    const config = { ...baseConfig, ...customConfig };

    // 调试配置信息
    if (config.debug) {
      console.log('[Gaussian Splats 3D] 当前配置:', config);
      console.log('[Gaussian Splats 3D] 鼠标控制:', config.enableMouseControl, '触摸控制:', config.enableTouchControl, '灵敏度:', config.rotationSensitivity);
    }

    // 获取 canvas 元素
    const canvas = container.querySelector('canvas');
    if (!canvas) {
      console.error('[Gaussian Splats 3D] 未找到 canvas 元素');
      return null;
    }

    if (config.debug) {
      console.log('[Gaussian Splats 3D] Canvas 元素找到:', canvas);
      console.log('[Gaussian Splats 3D] Canvas 尺寸:', canvas.clientWidth, canvas.clientHeight);
      console.log('[Gaussian Splats 3D] Canvas 样式:', canvas.style.cssText);
    }

    // 检查容器是否可见
    const style = window.getComputedStyle(container);
    const isHidden = !container || (style && (style.display === 'none' || style.visibility === 'hidden'));
    if (isHidden) {
      console.warn('[Gaussian Splats 3D] 容器被隐藏，跳过3D场景初始化');
      return null;
    }

    // 计算容器尺寸
    let width = container.clientWidth || container.offsetWidth || canvas.clientWidth;
    let height = container.clientHeight || container.offsetHeight || canvas.clientHeight;

    // 响应式高度调整
    const isDesktop = window.innerWidth >= config.desktopBreakpoint;
    const minHeight = isDesktop ? config.desktopHeight : config.mobileHeight;
    height = Math.max(height, minHeight);

    // 如果尺寸仍然为零，使用回退值
    if (!width || !height) {
      console.warn('[Gaussian Splats 3D] 容器尺寸为零，使用回退尺寸');
      width = window.innerWidth || 1920;
      height = minHeight;
      container.style.width = width + 'px';
      container.style.height = height + 'px';
    }

    if (config.debug) {
      console.log('[Gaussian Splats 3D] 配置:', config);
      console.log('[Gaussian Splats 3D] 使用尺寸:', width, height);
    }

    // 创建 Three.js 场景
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(config.fov, width / height, config.near, config.far);

    // 设置相机位置
    const cameraPos = parseFloatArray(config.cameraPosition, 3);
    camera.position.set(cameraPos[0], cameraPos[1], cameraPos[2]);

    // 解析模型位置和旋转（用于相机看向点和模型设置）
    const modelPos = parseFloatArray(config.modelPosition, 3);
    const modelQuat = parseFloatArray(config.modelQuaternion, 4);

    // 设置相机朝向（始终看向模型位置）
    camera.lookAt(modelPos[0], modelPos[1], modelPos[2]);

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(width, height);

    console.log('[Gaussian Splats 3D] 场景、相机、渲染器创建完成');

    // 添加天空球背景
    const skyGeometry = new THREE.SphereGeometry(50, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: parseHexColor(config.backgroundColor),
      side: THREE.BackSide
    });
    const skySphere = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skySphere);
    console.log('[Gaussian Splats 3D] 天空球背景已添加');

    // 加载 SplatMesh
    console.log('[Gaussian Splats 3D] 开始加载 SplatMesh...', config.modelUrl);
    const splat = new SplatMesh({ url: config.modelUrl });

    // 设置模型位置和旋转（使用已解析的变量）
    splat.position.set(modelPos[0], modelPos[1], modelPos[2]);
    splat.quaternion.set(modelQuat[0], modelQuat[1], modelQuat[2], modelQuat[3]);

    scene.add(splat);
    console.log('[Gaussian Splats 3D] SplatMesh 加载完成，已添加到场景');

    // 交互控制状态变量
    let isDragging = false;
    let previousPosition = { x: 0, y: 0 };
    // 使用欧拉角存储旋转，采用 YXZ 顺序避免万向锁
    let currentEuler = new THREE.Euler(0, 0, 0, 'YXZ');

    // 缩放控制状态变量
    let currentZoomDistance = 5; // 初始缩放距离（相机到模型中心的距离）
    let isTouchZooming = false;
    let initialTouchDistance = 0;
    let initialZoomOnTouchStart = 0;

    // 设置模型的旋转顺序为 YXZ
    splat.rotation.order = 'YXZ';

    // 初始化当前旋转为模型的初始旋转（使用 YXZ 顺序）
    currentEuler.setFromQuaternion(splat.quaternion, 'YXZ');

    // 计算初始相机到模型中心的距离
    const modelCenter = new THREE.Vector3(modelPos[0], modelPos[1], modelPos[2]);
    const cameraPosVec = new THREE.Vector3(cameraPos[0], cameraPos[1], cameraPos[2]);
    currentZoomDistance = cameraPosVec.distanceTo(modelCenter);

    if (config.debug) {
      console.log('[Gaussian Splats 3D] 模型初始旋转:', splat.rotation.x, splat.rotation.y, splat.rotation.z);
      console.log('[Gaussian Splats 3D] 模型初始四元数:', splat.quaternion.x, splat.quaternion.y, splat.quaternion.z, splat.quaternion.w);
      console.log('[Gaussian Splats 3D] 模型位置:', modelPos[0], modelPos[1], modelPos[2]);
      console.log('[Gaussian Splats 3D] 相机位置:', cameraPos[0], cameraPos[1], cameraPos[2]);
      console.log('[Gaussian Splats 3D] 相机看向:', modelPos[0], modelPos[1], modelPos[2]);
      console.log('[Gaussian Splats 3D] 当前欧拉角初始化:', currentEuler.x, currentEuler.y, currentEuler.z);
    }

    // 鼠标事件处理函数
    const onMouseDown = (event) => {
      if (!config.enableMouseControl) return;
      isDragging = true;
      previousPosition = { x: event.clientX, y: event.clientY };
      if (config.debug) {
        console.log('[Gaussian Splats 3D] 鼠标按下事件触发', event.clientX, event.clientY);
        console.log('[Gaussian Splats 3D] 按下时当前旋转欧拉角:', currentEuler.x, currentEuler.y, currentEuler.z);
        console.log('[Gaussian Splats 3D] 按下时相机位置:', camera.position.x, camera.position.y, camera.position.z);
      }
      event.preventDefault();
    };

    const onMouseMove = (event) => {
      if (!isDragging || !config.enableMouseControl) return;

      const deltaX = event.clientX - previousPosition.x;
      const deltaY = event.clientY - previousPosition.y;

      // 更新欧拉角：水平移动绕 Y 轴，垂直移动绕 X 轴
      // YXZ 顺序：先绕 Y 轴（偏航），再绕 X 轴（俯仰），最后绕 Z 轴（翻滚）
      currentEuler.y += deltaX * config.rotationSensitivity;
      currentEuler.x += deltaY * config.rotationSensitivity;

      // 限制 X 轴旋转角度 (-85° 到 85°)，留出安全边际避免万向锁
      const maxAngle = 85 * Math.PI / 180;
      if (currentEuler.x > maxAngle) {
        currentEuler.x = maxAngle;
      } else if (currentEuler.x < -maxAngle) {
        currentEuler.x = -maxAngle;
      }

      if (config.debug) {
        console.log('[Gaussian Splats 3D] 鼠标移动事件', deltaX, deltaY);
        console.log('[Gaussian Splats 3D] 当前欧拉角:', currentEuler.x, currentEuler.y, currentEuler.z);
        console.log('[Gaussian Splats 3D] 移动后相机位置:', camera.position.x, camera.position.y, camera.position.z);
        console.log('[Gaussian Splats 3D] 移动后相机旋转:', camera.rotation.x, camera.rotation.y, camera.rotation.z);
      }

      previousPosition = { x: event.clientX, y: event.clientY };
      event.preventDefault();
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // 滚轮缩放事件处理函数
    const onWheel = (event) => {
      if (!config.enableZoom || !config.enableMouseWheelZoom) return;

      event.preventDefault();

      // 计算缩放增量（滚轮向下放大，向上缩小）
      // deltaY 正值表示向下滚动（放大），负值表示向上滚动（缩小）
      const zoomDelta = -event.deltaY * config.zoomSensitivity;

      // 更新缩放距离
      currentZoomDistance += zoomDelta;

      // 限制缩放范围
      if (currentZoomDistance < config.minZoomDistance) {
        currentZoomDistance = config.minZoomDistance;
      } else if (currentZoomDistance > config.maxZoomDistance) {
        currentZoomDistance = config.maxZoomDistance;
      }

      if (config.debug) {
        console.log('[Gaussian Splats 3D] 滚轮事件 deltaY:', event.deltaY, '缩放增量:', zoomDelta, '新距离:', currentZoomDistance);
      }
    };

    // 触摸事件处理函数
    const onTouchStart = (event) => {
      if (!config.enableTouchControl) return;

      if (event.touches.length === 1) {
        // 单指触摸：旋转
        isDragging = true;
        isTouchZooming = false;
        previousPosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        event.preventDefault();
      } else if (event.touches.length === 2 && config.enableZoom && config.enablePinchZoom) {
        // 双指触摸：缩放
        isDragging = false;
        isTouchZooming = true;

        // 计算初始两指距离
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        initialTouchDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        initialZoomOnTouchStart = currentZoomDistance;

        event.preventDefault();
      }
    };

    const onTouchMove = (event) => {
      if (!config.enableTouchControl) return;

      // 单指旋转模式
      if (isDragging && event.touches.length === 1) {
        const deltaX = event.touches[0].clientX - previousPosition.x;
        const deltaY = event.touches[0].clientY - previousPosition.y;

        // 更新欧拉角：水平移动绕 Y 轴，垂直移动绕 X 轴
        currentEuler.y += deltaX * config.rotationSensitivity;
        currentEuler.x += deltaY * config.rotationSensitivity;

        // 限制 X 轴旋转角度 (-85° 到 85°)，留出安全边际避免万向锁
        const maxAngle = 85 * Math.PI / 180;
        if (currentEuler.x > maxAngle) {
          currentEuler.x = maxAngle;
        } else if (currentEuler.x < -maxAngle) {
          currentEuler.x = -maxAngle;
        }

        previousPosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        event.preventDefault();
      }
      // 双指缩放模式
      else if (isTouchZooming && event.touches.length === 2 && config.enableZoom && config.enablePinchZoom) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];

        // 计算当前两指距离
        const currentTouchDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );

        // 计算缩放比例（距离变化率）
        const distanceRatio = currentTouchDistance / initialTouchDistance;

        // 更新缩放距离（初始距离 * 距离比例）
        currentZoomDistance = initialZoomOnTouchStart * distanceRatio;

        // 限制缩放范围
        if (currentZoomDistance < config.minZoomDistance) {
          currentZoomDistance = config.minZoomDistance;
        } else if (currentZoomDistance > config.maxZoomDistance) {
          currentZoomDistance = config.maxZoomDistance;
        }

        if (config.debug) {
          console.log('[Gaussian Splats 3D] 双指缩放 初始距离:', initialTouchDistance, '当前距离:', currentTouchDistance, '比例:', distanceRatio, '新缩放距离:', currentZoomDistance);
        }

        event.preventDefault();
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
      isTouchZooming = false;
    };

    // 窗口大小调整处理
    const onWindowResize = () => {
      let newWidth = container.clientWidth || container.offsetWidth || canvas.clientWidth;
      let newHeight = container.clientHeight || container.offsetHeight || canvas.clientHeight;

      // 响应式高度调整
      const newIsDesktop = window.innerWidth >= config.desktopBreakpoint;
      const newMinHeight = newIsDesktop ? config.desktopHeight : config.mobileHeight;
      newHeight = Math.max(newHeight, newMinHeight);

      if (!newWidth || !newHeight) {
        newWidth = window.innerWidth || 1920;
        newHeight = newMinHeight;
        container.style.width = newWidth + 'px';
        container.style.height = newHeight + 'px';
      }

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);

      if (config.debug) {
        console.log('[Gaussian Splats 3D] 窗口大小调整:', newWidth, newHeight);
      }
    };

    if (config.enableResize) {
      window.addEventListener('resize', onWindowResize);
    }

    // 交互事件监听器绑定
    if (config.enableMouseControl) {
      canvas.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      if (config.debug) {
        console.log('[Gaussian Splats 3D] 鼠标事件监听器已绑定到 canvas:', canvas);
      }
    }

    if (config.enableTouchControl) {
      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
      if (config.debug) {
        console.log('[Gaussian Splats 3D] 触摸事件监听器已绑定到 canvas:', canvas);
      }
    }

    // 滚轮缩放事件绑定
    if (config.enableZoom && config.enableMouseWheelZoom) {
      canvas.addEventListener('wheel', onWheel, { passive: false });
      if (config.debug) {
        console.log('[Gaussian Splats 3D] 滚轮事件监听器已绑定到 canvas:', canvas);
      }
    }

    // 动画循环
    const animate = () => {
      // 应用交互旋转欧拉角
      splat.rotation.copy(currentEuler);

      // 更新相机位置以应用缩放
      if (config.enableZoom) {
        // 计算从模型中心到相机的方向向量
        const modelCenter = new THREE.Vector3(modelPos[0], modelPos[1], modelPos[2]);
        const cameraToModel = new THREE.Vector3().subVectors(camera.position, modelCenter);

        if (cameraToModel.length() > 0) {
          // 归一化方向向量
          cameraToModel.normalize();

          // 设置新的相机位置（保持看向模型中心的方向，只改变距离）
          camera.position.copy(modelCenter).addScaledVector(cameraToModel, currentZoomDistance);
        }
      }

      // 确保相机始终看向模型位置
      camera.lookAt(modelPos[0], modelPos[1], modelPos[2]);

      if (config.debug && frameCount % 60 === 0) {
        console.log('[Gaussian Splats 3D] 动画帧:', frameCount);
        console.log('[Gaussian Splats 3D] 相机位置:', camera.position.x, camera.position.y, camera.position.z);
        console.log('[Gaussian Splats 3D] 相机看向:', modelPos[0], modelPos[1], modelPos[2]);
        console.log('[Gaussian Splats 3D] 当前旋转欧拉角:', currentEuler.x, currentEuler.y, currentEuler.z);
        console.log('[Gaussian Splats 3D] 当前缩放距离:', currentZoomDistance);
      }
      frameCount++;

      renderer.render(scene, camera);
    };

    let frameCount = 0;

    renderer.setAnimationLoop(animate);
    console.log('[Gaussian Splats 3D] 动画循环已启动，交互控制已启用');

    // 返回场景对象以便外部控制
    return {
      scene,
      camera,
      renderer,
      splat,
      config,
      container,
      destroy: () => {
        if (config.enableResize) {
          window.removeEventListener('resize', onWindowResize);
        }

        // 清理交互事件监听器
        if (config.enableMouseControl) {
          canvas.removeEventListener('mousedown', onMouseDown);
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        }

        if (config.enableTouchControl) {
          canvas.removeEventListener('touchstart', onTouchStart);
          window.removeEventListener('touchmove', onTouchMove);
          window.removeEventListener('touchend', onTouchEnd);
        }

        // 清理滚轮事件监听器
        if (config.enableZoom && config.enableMouseWheelZoom) {
          canvas.removeEventListener('wheel', onWheel);
        }

        renderer.setAnimationLoop(null);
        scene.remove(splat);
        // 可选：清理 Three.js 资源
      }
    };

  } catch (error) {
    console.error('[Gaussian Splats 3D] 初始化发生错误:', error);
    return null;
  }
}

/**
 * 自动初始化所有标记为 data-gaussian-splats 的元素
 * @param {string} selector - CSS 选择器，默认为 '[data-gaussian-splats]'
 * @returns {Object[]} 初始化后的场景对象数组
 */
export function initAllGaussianSplats(selector = '[data-gaussian-splats]') {
  console.log('[Gaussian Splats 3D] 自动初始化所有场景，选择器:', selector);

  const containers = document.querySelectorAll(selector);
  const scenes = [];

  containers.forEach((container, index) => {
    console.log(`[Gaussian Splats 3D] 初始化场景 ${index + 1}/${containers.length}`);
    const scene = initGaussianSplats(container);
    if (scene) {
      scenes.push(scene);
      // 可选：将场景对象存储到容器上以便访问
      container._gaussianSplatsScene = scene;
    }
  });

  console.log(`[Gaussian Splats 3D] 初始化完成，成功: ${scenes.length}/${containers.length}`);
  return scenes;
}

/**
 * 等待 Three.js 和 Spark.js 模块加载后自动初始化
 * 此函数需要在 importmap 加载后调用
 */
export async function autoInit() {
  console.log('[Gaussian Splats 3D] 等待模块加载...');

  try {
    // 检查 Three.js 是否已加载
    if (typeof THREE === 'undefined') {
      console.error('[Gaussian Splats 3D] Three.js 未加载');
      return;
    }

    // 检查 SplatMesh 是否可用
    if (typeof SplatMesh === 'undefined') {
      console.error('[Gaussian Splats 3D] SplatMesh 未加载');
      return;
    }

    console.log('[Gaussian Splats 3D] 模块已加载，开始自动初始化');
    initAllGaussianSplats();

  } catch (error) {
    console.error('[Gaussian Splats 3D] 自动初始化失败:', error);
  }
}

// 全局变量支持（可选）
if (typeof window !== 'undefined') {
  window.GaussianSplats3D = {
    init: initGaussianSplats,
    initAll: initAllGaussianSplats,
    autoInit,
    DEFAULT_CONFIG
  };
}

console.log('[Gaussian Splats 3D 模块] 模块加载完成');

// 自动初始化
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // 等待 DOM 加载完成
  function initWhenReady() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('[Gaussian Splats 3D] DOM 加载完成，开始自动初始化');
        initAllGaussianSplats();
      });
    } else {
      // DOM 已经加载完成
      console.log('[Gaussian Splats 3D] DOM 已就绪，开始自动初始化');
      initAllGaussianSplats();
    }
  }

  // 等待 Three.js 和 Spark.js 加载
  function waitForDependencies() {
    if (typeof THREE !== 'undefined' && typeof SplatMesh !== 'undefined') {
      console.log('[Gaussian Splats 3D] 依赖已加载');
      initWhenReady();
    } else {
      console.log('[Gaussian Splats 3D] 等待依赖加载...');
      setTimeout(waitForDependencies, 100);
    }
  }

  // 启动依赖检查
  waitForDependencies();
}