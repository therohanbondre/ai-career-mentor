/* 
 * Architectural Decision: PostCSS Configuration
 * - Tailwind CSS for utility-first styling
 * - Autoprefixer for cross-browser compatibility
 * - Modern CSS processing pipeline
 */
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
