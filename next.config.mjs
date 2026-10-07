/** @type {import('next').NextConfig} */
const config = {
  poweredByHeader: false,
  distDir: process.env.NEXT_VERIFY_BUILD === '1' ? '.next-verify' : '.next',
  experimental: { webpackBuildWorker: false, ...(process.env.NEXT_TEST_WASM_DIR ? {workerThreads:true,cpus:2} : {}) },
  images: { remotePatterns: [{protocol:'https',hostname:'*.public.blob.vercel-storage.com',pathname:'/media/**'}] },
  async headers() { return [{source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'X-Frame-Options',value:'DENY'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'}]}]; }
};
export default config;
