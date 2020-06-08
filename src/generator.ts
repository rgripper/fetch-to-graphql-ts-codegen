import fetch, { Request } from "node-fetch";
import { Type, discoverTypes, TypeMember } from "./typeHelpers";
import { toUpperFirstChar } from "./helpers";

type RequestInfo = { method: string; url: string; variablesTypes: Type[] | undefined; dataTypes: Type[] };

function generateType(type: Type) {
  return `
  type ${type.name} = {
${type.members.map((x) => `${x.name}: ${x.typeSyntax}`).join(";\n")}
  }
  `;
}

export async function createRequestInfo(queryName: string, request: Request): Promise<RequestInfo> {
  const response = await fetch(request);
  const data = await response.json();
  const variables = request.body ? JSON.parse(((request.body as unknown) as Buffer).toString()) : undefined;

  if (data !== undefined && typeof data !== "object") {
    throw new Error("Root primitive values are not supported");
  }

  const variablesTypeName = `${queryName}Variables`;
  const dataTypeName = `${queryName}Data`;

  const variablesTypes = variables != undefined ? discoverTypes(variablesTypeName, variables) : undefined;
  const dataTypes = discoverTypes(dataTypeName, data);

  if (!dataTypes[0]) {
    throw new Error("Query must return some value");
  }

  return {
    url: request.url,
    method: request.method,
    variablesTypes,
    dataTypes,
  };
}

export async function generateModule(queryName: string, requestInfo: RequestInfo): Promise<string> {
  const constName = queryName
    .split(/(?<!(^|[A-Z]))(?=[A-Z])|(?<!^)(?=[A-Z][a-z])/)
    .map((x) => (x === undefined ? "_" : x.toUpperCase()))
    .join("");

  const variablesTypesScript = requestInfo.variablesTypes?.map(generateType).join("\n") ?? "";
  const dataTypesScript = requestInfo.dataTypes.map(generateType).join("\n") ?? "";

  const query = generateQuery(queryName, requestInfo);

  const dataTypeName = queryName + "Data";
  const variablesTypeName = queryName + "Variables";

  const fileContent = `
    import gql from 'graphql-tag';
    import { useQuery, QueryHookOptions, QueryResult } from '@apollo/client';

    ${dataTypesScript}
    ${variablesTypesScript}
    type Use${queryName} = (options?: QueryHookOptions<${dataTypeName}, ${variablesTypeName}>) => QueryResult<${dataTypeName}, ${variablesTypeName}>

    export const ${constName} = gql${"`"}${query}${"`"};

    export const use${queryName}: Use${queryName} = useQuery.bind(null, ${constName});
`;

  return fileContent;
}

function generateFieldSelectors(member: TypeMember): string {
  if (member.complexType) {
    return `
      ${member.name} @typeof(name: "${member.complexType.name}") {
          ${member.complexType.members.map(generateFieldSelectors)}
      }
  `;
  } else {
    return member.name;
  }
}

function generateQuery(queryName: string, requestInfo: RequestInfo) {
  const url = new URL(requestInfo.url);
  const fragments = url.pathname.split("/");
  const name = fragments[fragments.length - 1];
  const queryType = requestInfo.method == "GET" ? "query" : "mutation";
  const [queryArgs, requestArgs] = requestInfo.variablesTypes ? ["($input: any)", "(input: $input)"] : ["", ""];
  const queryPath = url.pathname.substr(1) + url.search;

  const dataType = requestInfo.dataTypes[0];
  const query = `
  ${queryType} ${queryName}${queryArgs} {
      ${name}Result ${requestArgs}
        @rest(type: "${toUpperFirstChar(name)}Result", path: "${queryPath}", method: "${requestInfo.method}") 
        ${dataType.members.map(generateFieldSelectors).join("\n")}
  }`;

  return query;
}
