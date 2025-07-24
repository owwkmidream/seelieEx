# SeelieEx 样式隔离解决方案

## 问题描述

油猴脚本的样式会影响到宿主网页的样式，特别是 Tailwind CSS 的 `@tailwind base;` 会重置所有 HTML 元素的默认样式，导致网页显示异常。

## 解决方案

### 1. 移除全局样式重置

- 从 `src/isolated-styles.css` 中移除了 `@tailwind base;`
- 只保留 `@tailwind components;` 和 `@tailwind utilities;`

### 2. 添加样式前缀

在 `tailwind.config.cjs` 中配置：
```javascript
module.exports = {
  // 添加前缀避免与网页样式冲突
  prefix: 'seelie-',
  // 确保样式只在 seelieEx 容器内生效
  important: '#seelieEx',
  // ...其他配置
}
```

### 3. 创建独立的样式作用域

使用 `#seelieEx` 作为根容器，所有样式都限制在这个容器内：

```css
#seelieEx {
  /* 基础样式设置 */
  font-family: ui-sans-serif, system-ui, ...;
  line-height: 1.5;
  position: relative;
  z-index: 1200;
}

/* 只重置 SeelieEx 内部元素的必要样式 */
#seelieEx *,
#seelieEx *::before,
#seelieEx *::after {
  box-sizing: border-box;
  /* 其他必要的重置 */
}
```

### 4. 更新所有组件的样式类

将所有 Tailwind 类名添加 `seelie-` 前缀：
- `flex` → `seelie-flex`
- `bg-blue-500` → `seelie-bg-blue-500`
- `text-white` → `seelie-text-white`
- 等等...

## 实现细节

### 文件结构
```
src/
├── isolated-styles.css     # 隔离的样式文件
├── App.tsx                # 主应用组件
├── components/            # 所有组件都使用 seelie- 前缀
│   ├── SeelieExDialog.tsx
│   ├── select/ListboxSelect.tsx
│   ├── switch/ToggleSwitch.tsx
│   └── tabs/
└── ...
```

### 关键配置文件

1. **tailwind.config.cjs**
   - `prefix: 'seelie-'` - 添加前缀
   - `important: '#seelieEx'` - 限制作用域

2. **src/isolated-styles.css**
   - 移除 `@tailwind base;`
   - 添加容器样式隔离
   - 重置必要的元素样式

3. **src/index.tsx**
   - 创建独立的 `#seelieEx` 容器
   - 确保脚本内容不影响外部页面

## 测试验证

使用 `test-style-isolation.html` 文件可以测试样式隔离效果：

1. 打开测试页面
2. 点击"显示 SeelieEx"按钮
3. 验证原网页样式不受影响
4. 验证 SeelieEx 样式正常工作

## 优势

1. **完全隔离**：油猴脚本样式不会影响宿主页面
2. **向后兼容**：保持原有功能不变
3. **易于维护**：清晰的命名规范和文件结构
4. **性能优化**：只加载必要的样式，减少 CSS 体积

## 注意事项

1. 所有新增的样式类都必须使用 `seelie-` 前缀
2. 确保 `#seelieEx` 容器的 z-index 足够高（1200）
3. 测试时注意验证在不同网站上的兼容性
4. 如果遇到样式问题，检查是否正确使用了前缀

## 未来改进

1. 可以考虑使用 CSS-in-JS 方案进一步隔离样式
2. 添加更多的样式重置规则以处理特殊情况
3. 考虑使用 Shadow DOM 实现更彻底的隔离（需要权衡兼容性）