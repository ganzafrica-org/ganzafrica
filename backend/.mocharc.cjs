module.exports = {
  require: ["ts-node/register", "tsconfig-paths/register"],
  extension: ["ts"],
  spec: ["src/__tests__/**/*.test.ts"],
  timeout: 10000,
  exit: true,
};
