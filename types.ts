
export enum ScreenState {
  LANDING = 'LANDING',
  QUIZ = 'QUIZ',
  LOADING = 'LOADING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export type Category = 
  | 'MOOD' 
  | 'WEATHER' 
  | 'SITUATION' 
  | 'PHYSICAL'
  | 'TEMP'
  | 'CAFFEINE'
  | 'SWEETNESS'
  | 'FLAVOR'
  | 'TEXTURE'
  | 'VOLUME'
  | 'PAIRING'
  | 'VIBE';

export interface Question {
  id: number;
  text: string;
  category: Category;
  options: {
    text: string;
    value: string;
  }[];
}

export interface CoffeeRecommendation {
  coffeeName: string;
  tagline: string;
  description: string;
  traits: string[];
  snackPairing: string; 
  musicPairing: string; 
  brewingStyle: string; 
  visualPrompt: string; 
}

export interface Cafe {
  name: string;
  rating: string;
  address: string;
  openStatus: string;
  mapsUrl: string;
}

export interface UserSelection {
  mood: string;
  weather: string;
  situation: string;
  physical: string;
  temp: string;
  caffeine: string;
  sweetness: string;
  flavor: string;
  texture: string;
  volume: string;
  pairing: string;
  vibe: string;
}
