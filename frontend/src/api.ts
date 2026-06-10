type AppConfig = {
  appName: string;
  dataEndpoint: string;
  runId: string;
};

function getConfig(): AppConfig {
  // Check if we are in NextToken environment
  if ((window as any).__APP_CONFIG__) {
    return (window as any).__APP_CONFIG__;
  }
  
  // Standalone/Coolify environment fallback
  // In your Dockerfile/Nginx, we proxy /data to the FastAPI backend
  return {
    appName: "stalker_converter",
    dataEndpoint: "/data", 
    runId: "standalone"
  };
}

type RpcParams = {
  func: string;
  args?: Record<string, any>;
  module?: string;
};

function getUserFacingErrorMessage(status: number): string {
  if (status === 401) return "Authentication required. Please sign in again.";
  if (status === 403) return "You do not have access to this app workspace.";
  if (status === 404) return "Requested app resource was not found.";
  if (status >= 500) return "Server error while loading app data. Please try again.";
  return "Request failed. Please try again.";
}

function cacheKey(func: string, args: Record<string, any>, module: string): string {
  return `rpc:${module}:${func}:${JSON.stringify(args)}`;
}

function getCached<T>(key: string): T | undefined {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return undefined;
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function setCache(key: string, data: unknown): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — ignore
  }
}

async function fetchRpc<T>(config: AppConfig, resolvedModule: string, func: string, args: Record<string, any>): Promise<T> {
  const res = await fetch(config.dataEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Run-Id": config.runId || "" },
    body: JSON.stringify({ module: resolvedModule, func, args }),
    credentials: "include",
  });

  const contentType = res.headers.get("content-type") || "";
  console.log("[FETCH_RESPONSE]", { status: res.status, contentType });

  const raw = await res.text();
  if (!res.ok) {
    console.error("[FETCH_ERROR]", raw.slice(0, 200));
    throw new Error(getUserFacingErrorMessage(res.status));
  }

  if (!contentType.includes("application/json")) {
    console.error("[PARSE_ERROR]", `Unexpected content-type: ${contentType}`);
    console.log("[PARSE_ERROR_PREVIEW]", raw.slice(0, 200));
    throw new Error(`Expected JSON response, got '${contentType || "unknown"}'`);
  }

  try {
    const data = JSON.parse(raw);
    console.log("[PARSE_SUCCESS]", { keys: Object.keys(data ?? {}) });
    return data as T;
  } catch (err) {
    console.error("[PARSE_ERROR]", err);
    console.log("[PARSE_ERROR_PREVIEW]", raw.slice(0, 200));
    throw err;
  }
}

/**
 * Clear cached query results. Call after mutations to prevent stale data.
 * @param funcNames - Specific function names to invalidate (e.g., ['get_items', 'get_stats']). Omit to clear all.
 */
export function invalidateCache(funcNames?: string[]): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith("rpc:")) {
      if (!funcNames || funcNames.some((fn) => key.includes(`:${fn}:`))) {
        keysToRemove.push(key);
      }
    }
  }
  keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  console.log("[CACHE_INVALIDATE]", { funcs: funcNames || "*", cleared: keysToRemove.length });
}

export async function rpcCall<T = any>({ func, args = {}, module }: RpcParams): Promise<T> {
  const config = getConfig();
  const resolvedModule = module || `apps.${config.appName}.backend.main`;
  const key = cacheKey(func, args, resolvedModule);

  const cached = getCached<T>(key);
  if (cached !== undefined) {
    console.log("[CACHE_HIT]", { func, module: resolvedModule });
    // Return cached data immediately, refresh in background
    fetchRpc<T>(config, resolvedModule, func, args)
      .then((fresh) => setCache(key, fresh))
      .catch(() => {});
    return cached;
  }

  console.log("[FETCH_START]", { func, module: resolvedModule });
  const data = await fetchRpc<T>(config, resolvedModule, func, args);
  setCache(key, data);
  return data;
}
