import fetch, { Request, Response } from "node-fetch";
import { writeFileSync } from "fs";
import path from "path";
import prettier from "prettier";
import jsonToTS from "json-to-ts";

const request = new Request(TODO);

function toUpperFirstChar(input: string) {
  return input[0].toUpperCase() + input.substr(1);
}

function generateFieldSelectors(obj: object, level: number) {
  return Object.keys(obj).map((key): string => {
    const value = (obj as any)[key];
    if (typeof value === "object" && value !== null && Object.keys(value).length > 0) {
      return `
    ${key} @typeof(name: "${toUpperFirstChar(key)}") {
        ${generateFieldSelectors(value, level + 1)}
    }
`;
    } else {
      return key;
    }
  });
}

function generateQuery(queryName: string, request: Request, json: unknown) {
  const url = new URL(request.url);
  const fragments = url.pathname.split("/");
  const name = fragments[fragments.length - 1];
  const queryType = request.method == "GET" ? "query" : "mutation";
  const [queryArgs, requestArgs] = request.body ? ["($input: any)", "(input: $input)"] : ["", ""];
  const query = `
${queryType} ${queryName}${queryArgs} {
    ${name}Result ${requestArgs}
      @rest(type: "${toUpperFirstChar(name)}Result", path: "${url.pathname.substr(1)}${url.search}", method: "${
    request.method
  }") {
        ${typeof json === "object" && json !== null ? generateFieldSelectors(json, 3) : ""}
    }
}    
`;

  return query;
}

async function generateEverything() {
  const response = await fetch(request);
  const json = await response.json();

  if (json !== undefined && typeof json !== "object") {
    throw new Error("Root primitive values are not supported");
  }

  const queryName = "QueryName";
  const constName = queryName
    .split(/(?<!(^|[A-Z]))(?=[A-Z])|(?<!^)(?=[A-Z][a-z])/)
    .map((x) => (x === undefined ? "_" : x.toUpperCase()))
    .join("");

  const query = generateQuery(queryName, request, json);

  const variablesInterfaceName = `${queryName}Variables`;
  const dataInterfaceName = `${queryName}Variables`;

  const variablesInterfaces =
    request.body != undefined ? jsonToTS(request.body, { rootName: variablesInterfaceName }) : undefined;
  const dataInterfaces = json !== undefined ? jsonToTS(json, { rootName: dataInterfaceName }) : undefined;

  const fileContent = prettier.format(`
    import gql from 'graphql-tag';
    import { useQuery, QueryHookOptions, QueryResult } from '@apollo/client';

    ${variablesInterfaces?.join("\n") ?? ""}
    ${dataInterfaces?.join("\n") ?? ""}
    type Use${queryName} = (options?: QueryHookOptions<${dataInterfaceName}, ${variablesInterfaceName}>) => QueryResult<${dataInterfaceName}, ${variablesInterfaceName}>

    export const ${constName} = gql${"`"}${query
    .split("\n")
    .map((x) => "      " + x)
    .join("\n")}${"`"};

    export const use${queryName}: Use${queryName} = useQuery.bind(null, ${constName});
`);

  writeFileSync(path.join(__dirname, "result.ts"), fileContent);
  console.log(fileContent);
}

generateEverything().then(() => console.log("Done!"));
