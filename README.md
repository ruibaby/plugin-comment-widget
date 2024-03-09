# plugin-comment-widget

Halo 2.0 的通用评论组件插件，为前台提供完整的评论解决方案。

## 使用方式

1. 下载，目前提供以下两个下载方式：
    - GitHub Releases：访问 [Releases](https://github.com/halo-dev/plugin-comment-widget/releases) 下载 Assets 中的 JAR 文件。
    - Halo 应用市场：<https://halo.run/store/apps/app-YXyaD>。
2. 安装，插件安装和更新方式可参考：<https://docs.halo.run/user-guide/plugins>。

> 需要注意的是，此插件需要主题进行适配，不会主动在内容页加载评论组件。

## 开发环境

```bash
git clone git@github.com:halo-dev/plugin-comment-widget.git

# 或者当你 fork 之后

git clone git@github.com:{your_github_id}/plugin-comment-widget.git
```

```bash
cd path/to/plugin-comment-widget
```

```bash
./gradlew pnpmInstall

# 启动一个 Docker 容器作为开发环境并自动加载此插件
./gradlew haloServer
```

Halo 插件的详细开发文档可查阅 [插件开发](https://docs.halo.run/category/%E6%8F%92%E4%BB%B6%E5%BC%80%E5%8F%91)。

## 主题适配

### 接入

接入文档可参考 [自定义标签](https://docs.halo.run/developer-guide/theme/template-tag#halocomment)。

### 自定义样式

虽然目前不能直接为评论组件编写额外的样式，但可以通过一系列的 CSS 变量来自定义部分样式，开发者可以根据需求自行在主题中添加这些 CSS 变量，让评论组件和主题更好地融合。

目前已提供的 CSS 变量：

| 变量名                                                                  | 描述                     |
|-------------------------------------------------------------------------|------------------------|
| `--halo-comment-widget-base-color`                                      | 基础文字颜色             |
| `--halo-comment-widget-base-info-color`                                 | 非重要突出文字           |
| `--halo-comment-widget-base-border-radius`                              | 基础元素的圆角           |
| `--halo-comment-widget-base-font-size`                                  | 基础字体大小             |
| `--halo-comment-widget-base-line-height`                                | 基础行高                 |
| `--halo-comment-widget-base-font-family`                                | 基础字体族               |
| `--halo-comment-widget-component-avatar-rounded`                        | 头像的圆角大小           |
| `--halo-comment-widget-component-avatar-size`                           | 头像大小                 |
| `--halo-comment-widget-component-form-input-bg-color`                   | 表单输入背景颜色         |
| `--halo-comment-widget-component-form-input-color`                      | 表单输入文字颜色         |
| `--halo-comment-widget-component-form-input-border-color`               | 表单输入边框颜色         |
| `--halo-comment-widget-component-form-input-border-color-focus`         | 表单输入焦点时边框颜色   |
| `--halo-comment-widget-component-form-input-box-shadow-focus`           | 表单输入焦点时的阴影     |
| `--halo-comment-widget-component-form-button-login-bg-color`            | 登录按钮背景颜色         |
| `--halo-comment-widget-component-form-button-login-bg-color-hover`      | 登录按钮悬停背景颜色     |
| `--halo-comment-widget-component-form-button-login-border-color`        | 登录按钮边框颜色         |
| `--halo-comment-widget-component-form-button-submit-bg-color`           | 提交按钮背景颜色         |
| `--halo-comment-widget-component-form-button-submit-color`              | 提交按钮文字颜色         |
| `--halo-comment-widget-component-form-button-submit-border-color`       | 提交按钮边框颜色         |
| `--halo-comment-widget-component-form-button-submit-border-color-hover` | 提交按钮悬停边框颜色     |
| `--halo-comment-widget-component-form-button-emoji-color`               | 表情按钮颜色             |
| `--halo-comment-widget-component-comment-item-action-bg-color-hover`    | 评论项操作悬停背景颜色   |
| `--halo-comment-widget-component-comment-item-action-color-hover`       | 评论项操作悬停颜色       |
| `--halo-comment-widget-component-pagination-button-bg-color-hover`      | 分页按钮悬停背景颜色     |
| `--halo-comment-widget-component-pagination-button-bg-color-active`     | 分页按钮活动状态背景颜色 |
| `--halo-comment-widget-component-pagination-button-border-color-active` | 分页按钮活动状态边框颜色 |
| `--halo-comment-widget-component-emoji-picker-rgb-color`                | 表情选择器颜色           |
| `--halo-comment-widget-component-emoji-picker-rgb-accent`               | 表情选择器强调颜色       |
| `--halo-comment-widget-component-emoji-picker-rgb-background`           | 表情选择器背景颜色       |
| `--halo-comment-widget-component-emoji-picker-rgb-input`                | 表情选择器输入颜色       |
| `--halo-comment-widget-component-emoji-picker-color-border`             | 表情选择器边框颜色       |
| `--halo-comment-widget-component-emoji-picker-color-border-over`        | 表情选择器悬停边框颜色   |

<details>
<summary>点击查看 CSS 代码模板</summary>

```css
:root {

  --halo-comment-widget-base-color: ;
  --halo-comment-widget-base-info-color: ;
  --halo-comment-widget-base-border-radius: ;
  --halo-comment-widget-base-font-size: ;
  --halo-comment-widget-base-line-height: ;
  --halo-comment-widget-base-font-family: ;
  --halo-comment-widget-component-avatar-rounded: ;
  --halo-comment-widget-component-avatar-size: ;
  --halo-comment-widget-component-form-input-bg-color: ;
  --halo-comment-widget-component-form-input-color: ;
  --halo-comment-widget-component-form-input-border-color: ;
  --halo-comment-widget-component-form-input-border-color-focus: ;
  --halo-comment-widget-component-form-input-box-shadow-focus: ;
  --halo-comment-widget-component-form-button-login-bg-color: ;
  --halo-comment-widget-component-form-button-login-bg-color-hover: ;
  --halo-comment-widget-component-form-button-login-border-color: ;
  --halo-comment-widget-component-form-button-submit-bg-color: ;
  --halo-comment-widget-component-form-button-submit-color: ;
  --halo-comment-widget-component-form-button-submit-border-color: ;
  --halo-comment-widget-component-form-button-submit-border-color-hover: ;
  --halo-comment-widget-component-form-button-emoji-color: ;
  --halo-comment-widget-component-comment-item-action-bg-color-hover: ;
  --halo-comment-widget-component-comment-item-action-color-hover: ;
  --halo-comment-widget-component-pagination-button-bg-color-hover: ;
  --halo-comment-widget-component-pagination-button-bg-color-active: ;
  --halo-comment-widget-component-pagination-button-border-color-active: ;
  --halo-comment-widget-component-emoji-picker-rgb-color: ;
  --halo-comment-widget-component-emoji-picker-rgb-accent: ;
  --halo-comment-widget-component-emoji-picker-rgb-background: ;
  --halo-comment-widget-component-emoji-picker-rgb-input: ;
  --halo-comment-widget-component-emoji-picker-color-border: ;
  --halo-comment-widget-component-emoji-picker-color-border-over: ;
}
```

</details>

### 配色切换方案

根据上面提供的 CSS 变量，也可以通过定义 CSS 变量的方式为评论组件提供动态切换配色的功能。

以下是实现示例，你可以根据需求自行修改选择器或者媒体查询。

```css
@media (prefers-color-scheme: dark) {
  .color-scheme-auto,
  [data-color-scheme='auto'] {
    color-scheme: dark;
    
    --halo-comment-widget-base-color: #ffffff;
    --halo-comment-widget-base-info-color: #64748b;
    --halo-comment-widget-component-form-input-bg-color: #475569;
    --halo-comment-widget-component-form-input-color: #ffffff;
    --halo-comment-widget-component-form-input-border-color: #495056;
    --halo-comment-widget-component-form-input-border-color-focus: #65a3ff;
    --halo-comment-widget-component-form-input-box-shadow-focus: 0 0 0 0.15em #1c3966;
    --halo-comment-widget-component-form-button-login-bg-color: #334155;
    --halo-comment-widget-component-form-button-login-bg-color-hover: #475569;
    --halo-comment-widget-component-form-button-login-border-color: #475569;
    --halo-comment-widget-component-form-button-submit-border-color: #475569;
    --halo-comment-widget-component-form-button-submit-border-color-hover: #64748b;
    --halo-comment-widget-component-form-button-emoji-color: #cbd5e1;

    --halo-comment-widget-component-comment-item-action-bg-color-hover: #475569;
    --halo-comment-widget-component-comment-item-action-color-hover: #94a3b8;

    --halo-comment-widget-component-pagination-button-bg-color-hover: #475569;
    --halo-comment-widget-component-pagination-button-bg-color-active: #475569;
    --halo-comment-widget-component-pagination-button-border-color-active: #475569;

    --halo-comment-widget-component-emoji-picker-rgb-color: 222, 222, 221;
    --halo-comment-widget-component-emoji-picker-rgb-accent: 58, 130, 247;
    --halo-comment-widget-component-emoji-picker-rgb-background: 21, 22, 23;
    --halo-comment-widget-component-emoji-picker-rgb-input: 0, 0, 0;
    --halo-comment-widget-component-emoji-picker-color-border: rgba(255, 255, 255, 0.1);
    --halo-comment-widget-component-emoji-picker-color-border-over: rgba(255, 255, 255, 0.2);
  }
}

.color-scheme-dark,
.dark,
[data-color-scheme='dark'] {
  color-scheme: dark;

  --halo-comment-widget-base-color: #ffffff;
  --halo-comment-widget-base-info-color: #64748b;
  --halo-comment-widget-component-form-input-bg-color: #475569;
  --halo-comment-widget-component-form-input-color: #ffffff;
  --halo-comment-widget-component-form-input-border-color: #495056;
  --halo-comment-widget-component-form-input-border-color-focus: #65a3ff;
  --halo-comment-widget-component-form-input-box-shadow-focus: 0 0 0 0.15em #1c3966;
  --halo-comment-widget-component-form-button-login-bg-color: #334155;
  --halo-comment-widget-component-form-button-login-bg-color-hover: #475569;
  --halo-comment-widget-component-form-button-login-border-color: #475569;
  --halo-comment-widget-component-form-button-submit-border-color: #475569;
  --halo-comment-widget-component-form-button-submit-border-color-hover: #64748b;
  --halo-comment-widget-component-form-button-emoji-color: #cbd5e1;

  --halo-comment-widget-component-comment-item-action-bg-color-hover: #475569;
  --halo-comment-widget-component-comment-item-action-color-hover: #94a3b8;

  --halo-comment-widget-component-pagination-button-bg-color-hover: #475569;
  --halo-comment-widget-component-pagination-button-bg-color-active: #475569;
  --halo-comment-widget-component-pagination-button-border-color-active: #475569;

  --halo-comment-widget-component-emoji-picker-rgb-color: 222, 222, 221;
  --halo-comment-widget-component-emoji-picker-rgb-accent: 58, 130, 247;
  --halo-comment-widget-component-emoji-picker-rgb-background: 21, 22, 23;
  --halo-comment-widget-component-emoji-picker-rgb-input: 0, 0, 0;
  --halo-comment-widget-component-emoji-picker-color-border: rgba(255, 255, 255, 0.1);
  --halo-comment-widget-component-emoji-picker-color-border-over: rgba(255, 255, 255, 0.2);
}
```

此外，为了让主题可以更加方便的适配暗黑模式，此插件也提供了一套暗黑模式的配色方案，主题可以直接使用此方案，而不需要自己去适配暗黑模式，适配方式如下：

1. 在 html 或者 body 标签添加 class：
   1. `color-scheme-auto`：自动模式，根据系统的暗黑模式自动切换。
   2. `color-scheme-dark` / `dark`：强制暗黑模式。
   3. `color-scheme-light` / `light`：强制明亮模式。
2. 在 html 或者 body 标签添加 `data-color-scheme` 属性：
   1. `auto`：自动模式，根据系统的暗黑模式自动切换。
   2. `dark`：强制暗黑模式。
   3. `light`：强制明亮模式。

## 作为组件使用

此插件的 UI 部分采用 [Lit Element](https://lit.dev/) 编写，并最终编译为 Web Component，所以理论上可以在任何 JS 框架中使用。这非常适用于将 Halo 作为 Headless CMS 使用的场景。例如使用 Vue、React 等框架编写网站，并调用 Halo 的 API 来渲染网页，这个时候文章评论的解决方案就可以直接使用此组件。

安装：

```bash
pnpm install @halo-dev/comment-widget
```

### Vue

在 Vue 组件中使用时，需要在 Vue 的编译选项中设置将此组件标记为非 Vue 组件，以下是 Vite 的配置示例：

```js
import vue from '@vitejs/plugin-vue'

export default {
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'comment-widget'
        }
      }
    })
  ]
}
```

然后在 SFC 中使用即可：

```vue
<script setup>
import '@halo-dev/comment-widget'
import '@halo-dev/comment-widget/var.css';
</script>

<template>
  <comment-widget
    baseUrl="https://demo.halo.run"
    group="content.halo.run"
    kind="Post"
    version="v1alpha1"
    name="e0507f6f-88bb-4d3c-a90a-a88aba222035"
  ></comment-widget>
</template>
```

## React

```ts
import "@halo-dev/comment-widget";
import "@halo-dev/comment-widget/var.css";

function App() {
  return (
    <>
      <comment-widget
        baseUrl="https://demo.halo.run"
        group="content.halo.run"
        kind="Post"
        version="v1alpha1"
        name="e0507f6f-88bb-4d3c-a90a-a88aba222035"
      ></comment-widget>
    </>
  );
}

export default App;
```
