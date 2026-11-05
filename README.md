# React Tetris (Modernized)

使用现代前端技术（Vite + Preact + Hooks + Zustand + Web Audio API）完全重构的高性能复古掌机俄罗斯方块。

🎮 **在线体验**：[https://heyhuyu.com/tetris/](https://heyhuyu.com/tetris/)

---

## ✨ 项目特色与优化亮点

1. **100% 像素级复古质感还原**：
   * 忠实保留经典黄色掌机外观、物理凹陷触感、LCD 墨绿像素方块与阴影。
   * 完整保留空闲态的像素小恐龙眨眼与跑步动画、LED 点阵记分牌与实时时钟。
   * 采用 Web Audio API 高度还原经典 8-bit 复古按键与消除音效。

2. **现代化技术栈 & 极速体验**：
   * **工程体系**：采用 **Vite 8**，支持现代 ES 规范与毫秒级 HMR 开发调试。
   * **体积瘦身 87%**：彻底剥离旧版 Immutable.js 与 Redux 3，JS 产物体积从原本的 **355 KB ⬇️ 锐减到 47 KB**（Gzip 后仅 17 KB）。
   * **零外部域名依赖**：液晶屏状态雪碧图内联优化，音频与全部静态资源本地同源托管，不依赖任何第三方 CDN 或外部域名。

3. **游戏循环与手感优化**：
   * **满帧游戏时钟**：基于浏览器的 `requestAnimationFrame` + Delta Time 驱动，告别传统 `setTimeout` 的掉帧与时钟漂移。
   * **精准跟手**：长按连续平移（DAS / Delayed Auto Shift）控制与旋转判定更加敏捷。

4. **现代设备与音频兼容**：
   * 内置 iOS / Safari / 现代 Chrome 的 Web Audio 自动播放策略唤醒机制，杜绝移动端无声问题。
   * 适配全面屏与刘海屏安全区（`viewport-fit=cover`），防止移动端下拉橡皮筋滚动与长按误选文本。

---

## 🕹️ 操作说明

| 键盘按键 | 掌机对应按钮 | 功能说明 |
| :--- | :--- | :--- |
| **↑ / W** | 旋转（蓝） | 方块逆时针旋转 / 未开始时调整起始行 |
| **↓ / S** | 下移（蓝） | 方块加速下落 / 未开始时调整起始行 |
| **← / A** | 左移（蓝） | 方块左移 / 未开始时调整初始速度 |
| **→ / D** | 右移（蓝） | 方块右移 / 未开始时调整初始速度 |
| **Space** | 掉落（大蓝） | 瞬间瞬降置底（Hard Drop） / 开始新游戏 |
| **P** | 暂停（绿） | 暂停 / 继续游戏 / 开始新游戏 |
| **M** | 音效（绿） | 开启 / 关闭音效 |
| **R** | 重玩（红） | 重置当前局并触发幕布结算动画 |

---

## 🛠️ 本地开发与构建

```bash
# 1. 安装依赖
npm install

# 2. 启动本地开发服务
npm run dev

# 3. 运行自动化测试
npm test

# 4. 生产构建（Vite 原生 10 位哈希产物）
npm run build

# 5. 预览生产产物
npm run preview
```

---

## 📄 致谢与开源协议

* 核心玩法与视觉灵感源自经典开源项目 [chvin/react-tetris](https://github.com/chvin/react-tetris)。
* 本项目采用 [Apache-2.0 License](LICENSE) 开源。
