module.exports = {
  mode: 'jit',
  content: [
    "./pages/*.tsx",
    "./pages/*.ts",
    "./pages/examples/*.tsx",
    "./pages/examples/*.ts",
    "./components/Graph/interactions/*.ts",
    "./components/**/*.tsx",
    "./components/**/*.ts",
    "./utils/*.ts",
    "./utils/*.tsx"
  ],
  theme: {
    extend: {
      backgroundSize: {
        'size-200': '200% 200%',
      },
      backgroundPosition: {
        'pos-0': '0% 0%',
        'pos-100': '100% 100%',
      },
    },
  },
  plugins: [],
}
