module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // 添加前缀避免与网页样式冲突
  prefix: 'seelie-',
  // 确保样式只在 seelieEx 容器内生效
  important: '#seelieEx',
  theme: {
    extend: {},
  },
  plugins: [],
}
