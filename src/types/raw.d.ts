// 允許以 ?raw 匯入純文字（例如 Markdown）
declare module '*.md?raw' {
  const content: string
  export default content
}

declare module '*.txt?raw' {
  const content: string
  export default content
}

