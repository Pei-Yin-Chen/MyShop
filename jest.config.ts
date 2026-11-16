import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
    // Next.js 專案路徑，用來載入 next.config.js 和 .env 檔案
    dir: "./",
});

const config: Config = {
    testEnvironment: "node",
    // 每次測試前自動清理 Mock，避免測試互相污染
    clearMocks: true,
    moduleNameMapper: {
        // 如果你的程式碼在根目錄，請改成： '^@/(.*)$': '<rootDir>/$1'
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    // 設定在測試環境啟動前，要額外執行的腳本（例如擴充斷言庫）
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

export default createJestConfig(config);
