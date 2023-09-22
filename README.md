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

./gradlew build
```

修改 Halo 配置文件：

```yaml
halo:
  plugin:
    runtime-mode: development
    classes-directories:
      - "build/classes"
      - "build/resources"
    lib-directories:
      - "libs"
    fixedPluginPath:
      - "/path/to/plugin-comment-widget"
```

## 主题适配

此插件是一个通用的评论组件插件，主题需要针对此类型插件做适配。Halo 为模板引擎提供了专门的标签（<halo:comment />），只需要在必要的位置添加此标签即可。

以下是代码示例：

```html
<!-- /templates/post.html -->
<halo:comment
  group="content.halo.run"
  kind="Post"
  th:attr="name=${post.metadata.name}"
  colorScheme="'light'"
/>
```

参数解释：

- `group`：自定义模型的 group，目前文章和自定义页面的分组均为 `content.halo.run`。
- `kind`：目前支持 Post（文章） 和 SinglePage（自定义页面） 两种类型，分别可用于 `post.html` 和 `page.html` 模板。
- `name`：文章或者自定义页面的唯一标识，可通过 `post.metadata.name` 或者 `singlePage.metadata.name` 获取。
- `colorScheme`：评论组件的颜色方案，支持 `light` 和 `dark` 两种，支持固定或者 JavaScript 变量。需要注意的是，如果需要固定一个值，那么需要添加单引号，如 `'dark'`。使用 JavaScript 变量时不需要。
