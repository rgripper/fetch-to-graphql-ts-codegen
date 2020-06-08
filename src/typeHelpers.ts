import { toUpperFirstChar } from "./helpers";

export type Type = { name: string; members: TypeMember[] };
export type TypeMember = { name: string; typeSyntax: string; complexType: Type | undefined };

function getTypeName(name: string, obj: unknown) {
  switch (typeof obj) {
    case "number":
      return "number";
    case "string":
      return "string";
    case "boolean":
      return "boolean";
    case "object": {
      if (obj === null) {
        return "null";
      }
      return toUpperFirstChar(name);
    }
    default:
      throw new Error(`Type '${typeof obj}' of '${name}' is not supported`);
  }
}

function getMember(name: string, obj: unknown, tryAddType: (type: Type) => boolean): TypeMember {
  const typeName = getTypeName(name, obj);

  if (typeof obj === "object" && obj !== null) {
    const targetObj = Array.isArray(obj) ? obj[0] : obj;
    const type: Type = {
      name: typeName,
      members: targetObj ? Object.keys(targetObj).map((key) => getMember(key, targetObj[key], tryAddType)) : [],
    };
    let attempts = 1;
    while (!tryAddType(type)) {
      type.name = typeName + attempts;
      attempts++;
    }
    console.log(Array.isArray(obj) ? type.name + "[]" : type.name);
    return { name, typeSyntax: Array.isArray(obj) ? type.name + "[]" : type.name, complexType: type };
  } else {
    return { name, typeSyntax: typeName, complexType: undefined };
  }
}

export function discoverTypes(name: string, obj: object) {
  const typeMap = new Map<string, Type>();
  getMember(name, obj, (type) => {
    if (typeMap.has(type.name)) {
      return false;
    } else {
      typeMap.set(type.name, type);
      return true;
    }
  });
  return Array.from(typeMap.values()).reverse();
}
