import {build} from "esbuild";
import {copyFile,mkdir,chmod} from "node:fs/promises";
await mkdir("packages/cli/dist",{recursive:true});
await build({entryPoints:["src/cli/main.ts"],outfile:"packages/cli/dist/nodedots.cjs",bundle:true,platform:"node",format:"cjs",target:"node22",tsconfig:"tsconfig.json",banner:{js:"#!/usr/bin/env node"},legalComments:"eof"});
await copyFile("LICENSE","packages/cli/LICENSE");await copyFile("NOTICE","packages/cli/NOTICE");
await chmod("packages/cli/dist/nodedots.cjs",0o755);
console.log("Built packages/cli/dist/nodedots.cjs");
