import fetch, { Request } from "node-fetch";
import { generateModule } from "./generator";
import { writeFileSync, readFileSync } from "fs";
import path from "path";
import prettier from "prettier";
import JSON5 from "json5";

async function generateModuleFromFetchCode(input: string) {
  const params = /fetch\(([\s\S]+?)\);^/.exec(input)?.[1];
  if (!params) {
    throw new Error("Invalid fetch syntax");
  }
  writeFileSync("some", `[${params}]`);

  const jsonParams: Parameters<typeof fetch> = JSON5.parse(`[${params}]`);
  const request = new Request(...jsonParams);

  const module = await generateModule(request);
  writeFileSync(path.join(__dirname, "result.ts"), prettier.format(module));

  console.log(module);
  console.log("Done!");
}

const input = readFileSync(path.join(__dirname, "sample.ts")).toString();
generateModuleFromFetchCode(input).then();
