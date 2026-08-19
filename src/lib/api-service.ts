const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 30000; // 30 seconds

export const ApiService = {
  clearCache() {
    cache.clear();
  },

  async get<T>(url: string, useCache = true): Promise<T> {
    if (useCache) {
      const cached = cache.get(url);
      if (cached && cached.expiry > Date.now()) {
        return cached.data as T;
      }
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'API request failed');
    }

    const data = json.data;
    if (useCache) {
      cache.set(url, { data, expiry: Date.now() + CACHE_TTL });
    }
    return data;
  },

  async getBlogs(params?: { search?: string; category?: string; tag?: string; status?: string; page?: number; limit?: number; ids?: string }, useCache = true) {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          q.append(key, String(val));
        }
      });
    }
    const queryString = q.toString();
    const url = `/api/blogs${queryString ? `?${queryString}` : ''}`;
    return this.get<any>(url, useCache);
  },

  async getFeaturedBlogs(useCache = true) {
    return this.get<any[]>('/api/blogs/featured', useCache);
  },

  async getBlogBySlugOrId(idOrSlug: string, useCache = true) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const url = isObjectId ? `/api/blogs/${idOrSlug}` : `/api/blogs/slug/${idOrSlug}`;
    return this.get<any>(url, useCache);
  },

  async getProjects(params?: { search?: string; category?: string }, useCache = true) {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          q.append(key, String(val));
        }
      });
    }
    const queryString = q.toString();
    const url = `/api/projects${queryString ? `?${queryString}` : ''}`;
    return this.get<any[]>(url, useCache);
  },

  async getFeaturedProjects(useCache = true) {
    return this.get<any[]>('/api/projects/featured', useCache);
  },

  async getSettings(useCache = true) {
    return this.get<any>('/api/admin/settings', useCache);
  },

  async uploadImage(file: File, folder: 'blog' | 'project' | 'avatar' | 'seo' | 'general' = 'general'): Promise<{ url: string; id: string; displayUrl: string }> {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only PNG, JPG, JPEG, and WEBP are supported.');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File is too large. Maximum size is 5MB.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${res.statusText} - ${errorText}`);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Upload failed');
    }

    return {
      url: json.data.fileUrl,
      id: json.data.id,
      displayUrl: json.data.displayUrl,
    };
  }
};
