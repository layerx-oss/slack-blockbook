import { startBlockKitPreviewServer } from "slack-blockbook";

export const config = {
  port: 5176,
  workspaceId: "YOUR_SLACK_WORKSPACE_ID",
  searchDir: import.meta.dirname,
  projectName: "slack-blockbook-example",
  baseDir: import.meta.dirname,
  restartOnChange: true,
  watchPatterns: ["**/*.tsx"],
};

startBlockKitPreviewServer(config);
