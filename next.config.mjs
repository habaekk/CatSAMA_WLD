const homeAssistantTarget =
  process.env.HOME_ASSISTANT_URL ??
  process.env.NEXT_PUBLIC_LOCAL_HOST_HA ??
  'http://127.0.0.1:8123';

const ollamaTarget = process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434';
const vtuberTarget = process.env.VTUBER_URL ?? 'http://127.0.0.1:12393';

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/ollama/:path*',
        destination: `${ollamaTarget}/api/:path*`,
      },
      {
        source: '/api/ha/ws',
        destination: `${homeAssistantTarget}/api/websocket`,
      },
      {
        source: '/api/ha/:path*',
        destination: `${homeAssistantTarget}/api/:path*`,
      },
      {
        source: '/vtuber/proxy',
        destination: `${vtuberTarget}/`,
      },
      {
        source: '/vtuber/proxy/:path*',
        destination: `${vtuberTarget}/:path*`,
      },
      {
        source: '/vtuber-ws',
        destination: `${vtuberTarget}/client-ws`,
      },
    ];
  },
};

export default nextConfig;
