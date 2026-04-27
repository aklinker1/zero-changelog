import { readdir } from "node:fs/promises";

const allChildren = await readdir("src", { withFileTypes: true });
const tsFilesNoExtension = allChildren
  .filter((file) => file.isFile() && file.name.endsWith(".ts"))
  .map((file) => file.name.slice(0, -3))
  .toSorted();

const pkgJsonFile = Bun.file("package.json");
const jsrJsonFile = Bun.file("jsr.json");

const pkgJson = await pkgJsonFile.json();
const jsrJson = await jsrJsonFile.json();

pkgJson.exports = tsFilesNoExtension.reduce<Record<string, { types: string; default: string }>>(
  (acc, name) => {
    acc[`./${name}`] = {
      types: `./dist/${name}.d.mts`,
      default: `./dist/${name}.mjs`,
    };
    return acc;
  },
  {},
);
jsrJson.exports = tsFilesNoExtension.reduce<Record<string, string>>((acc, name) => {
  acc[`./${name}`] = `./src/${name}.ts`;
  return acc;
}, {});

await pkgJsonFile.write(JSON.stringify(pkgJson, null, 2));
await jsrJsonFile.write(JSON.stringify(jsrJson, null, 2));

await Bun.$`oxfmt --write package.json jsr.json`;

console.log("Done");
