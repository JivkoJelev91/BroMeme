import { supabase } from '../supabase/supabaseConfig';

export type MemeTemplate = {
  id?: string;
  name: string;
  url: string;
  categories: string[];
  created_at?: string;
  created_by?: string;
  views?: number;
  likes?: number;
};

export const uploadMemeTemplate = async (
  file: File,
  name: string,
  categories: string[],
  userId: string | undefined
): Promise<MemeTemplate | null> => {
  try {
    // 1. Upload image to Supabase storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `meme-templates/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('memes')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // 2. Get the public URL
    const { data: urlData } = supabase.storage
      .from('memes')
      .getPublicUrl(filePath);

    const publicUrl = urlData?.publicUrl;

    if (!publicUrl) {
      throw new Error('Failed to get public URL');
    }

    // 3. Create record in meme_templates table
    const newTemplate: MemeTemplate = {
      name,
      url: publicUrl,
      categories,
      created_by: userId,
    };

    const { error: dbError, data: memeData } = await supabase
      .from('meme_templates')
      .insert(newTemplate)
      .select()
      .single();

    if (dbError) {
      throw new Error(dbError.message);
    }

    return memeData;
  } catch (error) {
    console.error('Error uploading meme template:', error);
    return null;
  }
};

export const getMemeTemplatesByCategory = async (category: string): Promise<MemeTemplate[]> => {
  const { data, error } = await supabase
    .from('meme_templates')
    .select('*')
    .contains('categories', [category]);

  if (error) {
    console.error('Error fetching meme templates:', error);
    return [];
  }

  return data || [];
};

export const getAllMemeTemplates = async (): Promise<MemeTemplate[]> => {
  const { data, error } = await supabase
    .from('meme_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all meme templates:', error);
    return [];
  }

  return data || [];
};