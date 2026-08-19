class ServerCache {
  private cache = new Map<string, { data: any; expiry: number }>();

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data as T;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  set(key: string, data: any, ttlMs: number = 60000): void {
    this.cache.set(key, { data, expiry: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global reference declaration to prevent hot-reload from clearing the cache in dev mode
declare global {
  var globalServerCache: ServerCache | undefined;
}

if (!global.globalServerCache) {
  global.globalServerCache = new ServerCache();
}

export const serverCache = global.globalServerCache!;
