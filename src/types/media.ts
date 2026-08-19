export interface MediaAssetItem {
  id: string;
  uploadedBy: {
    id: string;
    name: string;
  };
  fileUrl: string;
  displayUrl: string;
  deleteUrl: string;
  imgbbId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  folder: 'blog' | 'project' | 'avatar' | 'seo' | 'general';
  altText?: string;
  caption?: string;
  createdAt: string;
}
