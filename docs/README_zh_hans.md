<h1 align="center">Zeal 8-bit Computer emulator</h1>
<p align=center>
    <a href="https://opensource.org/licenses/Apache-2.0">
        <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="Licence" />
    </a>
    <a href="https://space.bilibili.com/1042658991?spm_id_from=333.337.0.0">
        <img alt="bilibili" src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapi.swo.moe%2Fstats%2Fbilibili%2F1042658991&query=count&color=282c34&label=bilibili&labelColor=FE7398&logo=bilibili&logoColor=white&logoSvg=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB2aWV3Qm94PSIwIDAgNTIgNTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI%2BPHBhdGggZD0iTTEuMzczNTIgMTcuMzUzMjJIOC4xMzUzMjNMMTcuMzUzMjIgMTYuNzUzMjF6IE0yLjEzNTMyIDMuMDAwMDJMMi4xMzUzMjIgMy4wMDAwMnoiLz48L3N2Zz4%3D)"/>
    </a>
</p>

<p align="center">
    <a href="../README.md">English</a> | 简体中文
</p>

**👏中文介绍———Zeal 8位计算机软件模拟器创建和使用指南👏**
- **[点击此处访问在线模拟器](https://zeal8bit.github.io/Zeal-WebEmulator/)**
- [Zeal 8位计算机](https://zeal8bit.com/)是一台自制的8位计算机，基于Z80 CPU。
- Zeal 8位计算机的[B站频道](https://space.bilibili.com/1042658991)
- [购买 Zeal 8位计算机](https://www.tindie.com/products/zeal8bit/zeal-8-bit-computer-developer-edition-z80-based/)
- 中国购买请联系`contact@zeal8bit.com`
  
## 在浏览器中运行调试器

Zeal-NativeEmulator 通过 WebAssembly 模拟硬件，由 SDL 渲染画面。本项目提供 HTML 调试界面。使用 Chrome 访问通过 HTTPS 或本地服务器提供的页面。

```sh
npm install
npm run dev
```

可以选择预构建的 Zeal 8 位操作系统镜像，也可以在 **Advanced** 中加载本地 ROM，以及可选的 EEPROM 镜像和符号映射文件。使用 `npm run get-prebuilt` 下载镜像后，可通过 `?local=1&r=latest` 加载本地镜像。对镜像的更改仅在当前会话中保留。

在桌面版 Chrome 中，可通过 **Settings → Mount HostFS** 将本地文件夹共享给支持 HostFS 的 ROM。访客系统可以读写所选文件夹。在运行期间挂载或卸载会重新启动模拟器。

## 调试功能

- 暂停、继续、重置、单步执行和单步跳过调用。断点支持十六进制地址和映射文件中的符号。
- CPU 暂停时查看寄存器、标志位、T 状态和反汇编。
- 查看和编辑逻辑内存，按当前 MMU 映射显示物理地址。
- 查看调色板、字体、图块、精灵和图块地图层，并在垂直消隐时暂停。

桌面版调试器请使用 [Zeal-NativeEmulator](https://github.com/Zeal8bit/Zeal-NativeEmulator)。浏览器运行时的版本和构建方法见 [WASM 运行时说明](../wasm/README.md)。

## 👬为项目做出贡献

欢迎大家对该项目积极贡献！任何人都可以为这个项目做出贡献。

您可以按照您的意愿修复任何错误，也可以提出调试器改进建议。

贡献流程：

* 分叉项目
* 创建您的功能分支（*可选*）
* 提交您的更改。请制作清晰简洁的提交消息 （*）
* 推送到分支
* 打开拉取请求

(*) 下面是一个正确的提交示例：
    译者注：提交，议题及拉取请求消息请用英文

```plain
Module: add/fix/remove a from b

Explanation on what/how/why
```

例如：

```plain
Video chip: implement 320x240 text-mode

It is now possible to switch to 320x240 text-mode and display text.
```

## 📝许可证

本项目采用 [Apache 2.0 许可证](../LICENSE)。随 Native WASM 一起分发的 SDL 采用 [SDL 许可证](../wasm/SDL3-LICENSE.txt)。

## 📪联系方式

如有任何建议或要求，您可以通过 `contact [at] zeal8bit [dot] com`与我联系

对于功能请求，还可以打开议题或拉取请求。
