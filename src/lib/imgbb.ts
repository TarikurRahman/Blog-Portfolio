const IMGBB_API_KEY = process.env.IMGBB_API_KEY || process.env.NEXT_PUBLIC_IMGBB_API_KEY;

export interface ImgBBUploadResponse {
  id: string;
  url: string;
  displayUrl: string;
  deleteUrl: string;
}

export class ImgBBHelper {
  static async uploadImage(base64Image: string): Promise<ImgBBUploadResponse> {
    if (!IMGBB_API_KEY) {
      throw new Error('Please define the IMGBB_API_KEY environment variable inside .env.local');
    }

    if (IMGBB_API_KEY === 'your_imgbb_api_key_here') {
      throw new Error('IMGBB_API_KEY in .env.local is currently set to a placeholder value. Please configure it with your real ImgBB API key.');
    }

    let cleanBase64 = base64Image;
    if (base64Image.includes(';base64,')) {
      cleanBase64 = base64Image.split(';base64,')[1];
    }

    const formData = new FormData();
    formData.append('image', cleanBase64);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ImgBB upload failed: ${response.statusText} - ${errorText}`);
    }

    const json = await response.json();
    if (!json.success) {
      throw new Error(json.error?.message || 'ImgBB upload returned unsuccessful response');
    }

    return {
      id: json.data.id,
      url: json.data.url,
      displayUrl: json.data.display_url || json.data.url,
      deleteUrl: json.data.delete_url || '',
    };
  }
}
