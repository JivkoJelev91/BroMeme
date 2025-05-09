import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      modalOverlay: Interpolation<FastOmit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, never>>;
      categoryTag: Interpolation<FastOmit<DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, never>>;
      favorite: Interpolation<Substitute<DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, { isFavorite?: boolean | undefined; }>>;
      primaryHover: Interpolation<FastOmit<DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, never>>;
      error: Interpolation<FastOmit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, never>>;
      input: {
        background: Interpolation<FastOmit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, never>>;
        border: Interpolation<FastOmit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, never>>;
        placeholder: Interpolation<FastOmit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, never>>;
      };
      secondary: Interpolation<Substitute<DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, { $active: boolean; }>>;
      secondary: Interpolation<Substitute<DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, { $active: boolean; }>>;
      primary: string;
      cardBackground: string;
      divider: string;
      background: string;
      shadow: string;
      avatarBackground: string;
      text: {
        tertiary: Interpolation<Substitute<DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, { isFavorite?: boolean | undefined; }>>;
        inverse: Interpolation<FastOmit<DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, never>>;
        primary: string;
        secondary: string;
      };
      border: {
        medium: Interpolation<FastOmit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, never>>;
        light: string;
      };
    };
  }
}