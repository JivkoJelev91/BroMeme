export interface MemeTemplate {
    url(url: string): string;
    id: string;
    name: string;
    category: string;
  }
  
  // Get memes by category
  export const getMemesByCategory = (memes: MemeTemplate[], category: string): MemeTemplate[] => {
    return memes.filter(meme => meme.category === category);
  };
  
  // Get popular memes (first 8)
  export const getPopularMemes = (memes: MemeTemplate[]): MemeTemplate[] => {
    return memes.slice(0, 8);
  };
  
  // Search memes by name or tags
  export const searchMemes = (memes: MemeTemplate[], query: string): MemeTemplate[] => {
    const lowercaseQuery = query.toLowerCase();
    return memes.filter(meme => 
      meme.name.toLowerCase().includes(lowercaseQuery) 
    );
  };