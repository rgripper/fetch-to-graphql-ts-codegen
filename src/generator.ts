import fetch, { Request } from "node-fetch";
import jsonToTS from "json-to-ts";

export async function generateModule(request: Request): Promise<string> {
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

  const fileContent = `
    import gql from 'graphql-tag';
    import { useQuery, QueryHookOptions, QueryResult } from '@apollo/client';

    ${variablesInterfaces?.join("\n") ?? ""}
    ${dataInterfaces?.join("\n") ?? ""}
    type Use${queryName} = (options?: QueryHookOptions<${dataInterfaceName}, ${variablesInterfaceName}>) => QueryResult<${dataInterfaceName}, ${variablesInterfaceName}>

    export const ${constName} = gql${"`"}${query}${"`"};

    export const use${queryName}: Use${queryName} = useQuery.bind(null, ${constName});
`;

  return fileContent;
}

function toUpperFirstChar(input: string) {
  return input[0].toUpperCase() + input.substr(1);
}

function generateFieldSelectors(obj: object) {
  return Object.keys(obj).map((key): string => {
    const value = (obj as any)[key];
    if (typeof value === "object" && value !== null && Object.keys(value).length > 0) {
      return `
      ${key} @typeof(name: "${toUpperFirstChar(key)}") {
          ${generateFieldSelectors(value)}
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
  const queryPath = url.pathname.substr(1) + url.search;

  const returnSelector =
    typeof json === "object" && json !== null
      ? `{
    ${generateFieldSelectors(json)}}
`
      : "";

  const query = `
  ${queryType} ${queryName}${queryArgs} {
      ${name}Result ${requestArgs}
        @rest(type: "${toUpperFirstChar(name)}Result", path: "${queryPath}", method: "${request.method}") 
        ${returnSelector}
  }`;

  return query;
}
