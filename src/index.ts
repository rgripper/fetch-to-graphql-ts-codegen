import fetch, { Request } from "node-fetch";
import { generateModule, createRequestInfo } from "./generator";
import { writeFileSync, readFileSync } from "fs";
import prettier from "prettier";
import JSON5 from "json5";
import path from "path";

const [_, _2, source, dest] = process.argv;
console.log(path.resolve(source), path.resolve(dest));
const input = readFileSync(source).toString();
generateModuleFromFetchCode(input).then((module) => {
  writeFileSync(dest, module);
});

async function generateModuleFromFetchCode(input: string): Promise<string> {
  const params = /fetch\(([\s\S]+?)\);\s*$/.exec(input)?.[1];
  if (!params) {
    throw new Error("Invalid fetch syntax");
  }

  const jsonParams: Parameters<typeof fetch> = JSON5.parse(`[${params}]`);
  const request = new Request(...jsonParams);

  const queryName = "QueryName";
  const requestInfo = await createRequestInfo(queryName, request);
  const module = await generateModule(queryName, requestInfo);
  return prettier.format(module);
}
