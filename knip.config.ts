import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  ignore: ['src/components/**',],
  ignoreDependencies: ["tailwindcss", "tw-animate-css", "zod", "react-router-dom", "react-router", "@base-ui-components/react"]
};

export default config;