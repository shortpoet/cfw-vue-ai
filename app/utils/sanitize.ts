export {
  escapeRegExp,
  escapeRegExpWithReplacer,
  escapeNestedKeys,
  safeInit,
  trimAllWhitespace,
  escapeNestedKeysGpt
};

const trimAllWhitespace = (str: string) => str.replace(/\s+/g, '');

const safeInit = (init: any) => ({
  ...init,
  headers: {
    ...init.headers,
    Authorization: init.token ? `Bearer ${init.token?.substring(0, 7)}...}` : null
  },
  token: init.token ? init.token?.substring(0, 7) : null,
  user: {
    ...init.user,
    token: init.user && init.user.token ? init.user?.token?.substring(0, 7) : null
  },
  body: init.body ? JSON.stringify(init.body).substring(0, 50) : null
});

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function escapeRegExpWithReplacer(string: string, replacer: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, replacer); // $& means the whole matched string
}

function escapeNestedKeys(obj: any, targets: string[]): any {
  const escapedObj: Record<any, any> = {};
  // console.log("escapeNestedKeys", targets);
  if (Array.isArray(obj)) {
    // console.log("escape is array");
    return obj.map((o: any) => escapeNestedKeys(o, targets));
  }
  if (typeof obj === 'string') {
    // console.log("escape is string");
    obj = JSON.parse(obj);
  }
  // console.log("escape is not string - > typeof obj", typeof obj);
  if (typeof obj !== 'object' || obj === null) {
    // console.log("escape is not object or null");
    return obj;
  }
  // console.log("escape obj", obj);
  // const clone = JSON.parse(JSON.stringify(obj));
  // console.log("escape clone", clone);
  for (const [key, value] of Object.entries(obj)) {
    // console.log("escape key", key);
    // console.log("escape value", value);
    if (
      targets.some((target) => key.toLowerCase().includes(target.toLowerCase())) &&
      typeof value === 'string' &&
      value.length > 8
    ) {
      // console.log("escape is string and match");
      escapedObj[key] = value.substring(0, 8) + '...';
    } else if (typeof value === 'object' && value !== null) {
      // console.log("escape is object and not null");
      escapedObj[key] = escapeNestedKeys(value, targets);
    } else {
      // console.log("escape is neither string match nor object");
      escapedObj[key] = value;
    }
  }
  return escapedObj;
}

function escapeNestedKeysGpt(obj: any, targets: string[]) {
  const escapedObj = obj;
  const processedObjects = new Set();
  function escape(obj: any): any {
    if (typeof obj !== 'object' || obj === null || processedObjects.has(obj)) {
      return obj;
    }
    processedObjects.add(obj);
    if (Array.isArray(obj)) {
      return obj.map(escape);
    }
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] =
        targets.includes(key) && typeof value === 'string' && value.length > 8
          ? value.substring(0, 8) + '...'
          : escape(value);
    }
    return result;
  }
  return escape(escapedObj);
}
