import { Model } from 'mongoose';

export async function generateUniqueSlug(title: string, model: Model<any>, currentId?: string): Promise<string> {
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!slug) {
    slug = 'untitled';
  }

  let uniqueSlug = slug;
  let count = 1;

  while (true) {
    const query: any = { slug: uniqueSlug };
    if (currentId) {
      query._id = { $ne: currentId };
    }

    const exists = await model.findOne(query);
    if (!exists) {
      break;
    }

    uniqueSlug = `${slug}-${count}`;
    count++;
  }

  return uniqueSlug;
}
