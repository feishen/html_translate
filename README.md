# 离线多语言翻译应用

支持中文、英文、日语、韩语、法语、荷兰语、德语之间相互翻译的离线 PWA 应用。

## 功能特性

- 多语言互译（7种语言）
- 语音输入识别
- 翻译结果朗读（TTS）
- 完全离线运行
- PWA 支持，可安装到手机主屏幕
- 基于 AI 模型（Qwen3-0.6B）

## 使用步骤

### 1. 生成图标

1. 在浏览器中打开 `generate-icons.html`
2. 点击按钮下载 `icon-192.png` 和 `icon-512.png`
3. 将两个图标文件保存到项目根目录

### 2. 启动应用

由于浏览器安全限制，需要通过 HTTP 服务器访问（不能直接打开 HTML 文件）：

**方法 1: 使用 Python（推荐）**
```bash
# Python 3
python3 -m http.server 8000

# 或 Python 2
python -m SimpleHTTPServer 8000
```

**方法 2: 使用 Node.js**
```bash
npx http-server -p 8000
```

**方法 3: 使用 VS Code**
- 安装 "Live Server" 扩展
- 右键 index.html -> "Open with Live Server"

### 3. 访问应用

1. 打开浏览器访问 `http://localhost:8000`
2. 首次访问会注册 Service Worker
3. **选择下载源**（中国大陆用户推荐选择 "HF-Mirror"）
4. 点击"加载模型"按钮（需要网络连接，约 300-500MB）
5. 模型加载完成后即可离线使用

### 4. 安装到手机

**Android (Chrome):**
1. 访问应用网址
2. 点击浏览器菜单 -> "添加到主屏幕"
3. 确认安装

**iOS (Safari):**
1. 访问应用网址
2. 点击"分享"按钮
3. 选择"添加到主屏幕"

## 离线使用

首次完成以下步骤后，即可完全离线使用：

1. ✓ 访问过应用（Service Worker 已注册）
2. ✓ 加载过 AI 模型（已缓存到浏览器）
3. ✓ 所有资源已被 Service Worker 缓存

之后即使断网，也能正常打开和使用应用。

## 技术架构

- **前端**: 纯静态 HTML/CSS/JavaScript
- **AI 模型**: WebLLM (Qwen3-0.6B-q0f16-MLC)
- **语音识别**: Web Speech API
- **语音合成**: SpeechSynthesis API
- **离线支持**: Service Worker + Cache API
- **PWA**: Web App Manifest

## 浏览器要求

- Chrome/Edge 90+
- Safari 15.4+
- Firefox 90+（部分功能可能受限）

推荐使用 Chrome 或 Edge 以获得最佳体验。

## 常见问题

**Q: 为什么不能直接打开 HTML 文件？**
A: Service Worker 和 ES 模块需要在 HTTP(S) 协议下运行，不支持 file:// 协议。

**Q: 中国大陆无法下载 Hugging Face 模型怎么办？**
A: 应用内置了多个镜像源选择，推荐中国大陆用户选择 "HF-Mirror (推荐国内用户)" 或 "GitHub Proxy"。详见 `镜像配置说明.md`。

**Q: 模型下载很慢怎么办？**
A:
1. 尝试切换不同的下载源（在"下载源"下拉菜单中选择）
2. 如果一个镜像失败，可以尝试其他镜像
3. 首次下载需要时间，请保持网络连接。下载完成后会永久缓存。

**Q: 如何删除已下载的模型？**
A: 点击"删除模型"按钮，或者清除浏览器缓存和数据。

**Q: 语音识别不工作？**
A: 确保浏览器支持 Web Speech API，并允许麦克风权限。

**Q: 翻译质量如何提升？**
A: 可以尝试使用更大的模型，但会增加下载大小和运行时内存需求。

## 文件说明

- `index.html` - 主应用文件
- `manifest.json` - PWA 配置
- `sw.js` - Service Worker（缓存管理）
- `generate-icons.html` - 图标生成工具
- `icon.svg` - 矢量图标
- `icon-192.png` - 192x192 应用图标
- `icon-512.png` - 512x512 应用图标

## 许可证

MIT License
