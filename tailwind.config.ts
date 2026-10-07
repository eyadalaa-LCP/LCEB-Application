import type {Config} from 'tailwindcss';
const config:Config={content:['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],theme:{extend:{colors:{navy:'#00072D'},fontFamily:{sans:['Inter','sans-serif'],heading:['Space Grotesk','sans-serif']}}},plugins:[]};
export default config;
