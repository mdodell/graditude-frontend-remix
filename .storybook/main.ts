import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../app/components/**/*.mdx",
    "../app/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
    "storybook-dark-mode",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {
      builder: {
        viteConfigPath: "sb-vite.config.ts",
      },
    },
  },
  docs: {
    autodocs: "tag",
  },
};

export default config;
