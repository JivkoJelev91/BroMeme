export interface MemeTemplate {
    id: string;
    name: string;
    url: string;
    tags: string[];
    category: string;
  }
  
  export const memeTemplates: MemeTemplate[] = [
    {
      id: 'drake',
      name: 'Drake Hotline Bling',
      url: 'https://i.imgflip.com/30b1gx.jpg',
      tags: ['drake', 'yes', 'no', 'compare'],
      category: 'popular'
    },
    {
      id: 'distracted-boyfriend',
      name: 'Distracted Boyfriend',
      url: 'https://i.imgflip.com/1ur9b0.jpg',
      tags: ['relationship', 'jealous', 'distracted'],
      category: 'popular'
    },
    {
      id: 'two-buttons',
      name: 'Two Buttons',
      url: 'https://i.imgflip.com/1g8my4.jpg',
      tags: ['choice', 'decision', 'buttons'],
      category: 'popular'
    },
    {
      id: 'change-my-mind',
      name: 'Change My Mind',
      url: 'https://i.imgflip.com/24y43o.jpg',
      tags: ['opinion', 'debate', 'change mind'],
      category: 'popular'
    },
    {
      id: 'expanding-brain',
      name: 'Expanding Brain',
      url: 'https://i.imgflip.com/1jwhww.jpg',
      tags: ['brain', 'intelligence', 'levels'],
      category: 'popular'
    },
    {
      id: 'buff-doge-vs-cheems',
      name: 'Buff Doge vs. Cheems',
      url: 'https://i.imgflip.com/43a45p.png',
      tags: ['doge', 'dogs', 'compare', 'past', 'present'],
      category: 'popular'
    },
    {
      id: 'woman-yelling-at-cat',
      name: 'Woman Yelling at Cat',
      url: 'https://i.imgflip.com/345v97.jpg',
      tags: ['cat', 'woman', 'argument'],
      category: 'popular'
    },
    {
      id: 'crying-cat',
      name: 'Crying Cat',
      url: 'https://i.imgflip.com/38el31.jpg',
      tags: ['cat', 'crying', 'sad'],
      category: 'cats'
    },
    {
      id: 'always-has-been',
      name: 'Always Has Been',
      url: 'https://i.imgflip.com/46e43q.png',
      tags: ['astronaut', 'gun', 'space', 'earth'],
      category: 'reaction'
    },
    {
      id: 'disaster-girl',
      name: 'Disaster Girl',
      url: 'https://i.imgflip.com/23ls.jpg',
      tags: ['girl', 'fire', 'disaster', 'evil'],
      category: 'classic'
    },
    {
      id: 'one-does-not-simply',
      name: 'One Does Not Simply',
      url: 'https://i.imgflip.com/1bij.jpg',
      tags: ['boromir', 'lord of the rings', 'one does not simply'],
      category: 'classic'
    },
    {
      id: 'success-kid',
      name: 'Success Kid',
      url: 'https://i.imgflip.com/1bhk.jpg',
      tags: ['kid', 'success', 'victory', 'achievement'],
      category: 'classic'
    },
    {
      id: 'think-about-it',
      name: 'Roll Safe - Think About It',
      url: 'https://i.imgflip.com/1h7in3.jpg',
      tags: ['smart', 'thinking', 'logic', 'roll safe'],
      category: 'reaction'
    },
    {
      id: 'surprised-pikachu',
      name: 'Surprised Pikachu',
      url: 'https://i.imgflip.com/2kbn1e.jpg',
      tags: ['pikachu', 'pokemon', 'surprised', 'shocked'],
      category: 'reaction'
    },
    {
      id: 'this-is-fine',
      name: 'This Is Fine',
      url: 'https://i.imgflip.com/wxica.jpg',
      tags: ['dog', 'fire', 'fine', 'emergency'],
      category: 'reaction'
    },
    {
      id: 'waiting-skeleton',
      name: 'Waiting Skeleton',
      url: 'https://i.imgflip.com/2fm6x.jpg',
      tags: ['skeleton', 'waiting', 'patience'],
      category: 'waiting'
    }
  ];
  
  // Get memes by category
  export const getMemesByCategory = (category: string): MemeTemplate[] => {
    return memeTemplates.filter(meme => meme.category === category);
  };
  
  // Get popular memes (first 8)
  export const getPopularMemes = (): MemeTemplate[] => {
    return memeTemplates.slice(0, 8);
  };
  
  // Search memes by name or tags
  export const searchMemes = (query: string): MemeTemplate[] => {
    const lowercaseQuery = query.toLowerCase();
    return memeTemplates.filter(meme => 
      meme.name.toLowerCase().includes(lowercaseQuery) || 
      meme.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };