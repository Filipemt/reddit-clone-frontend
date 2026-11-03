export interface CommunityReferenceOption {
  id: number;
  apiName: string;
  label: string;
}

export const COMMUNITY_ACTIVE_STATUS_ID = 1;

export const COMMUNITY_TOPICS: readonly CommunityReferenceOption[] = [
  { id: 1, apiName: 'Games', label: 'Games' },
  { id: 2, apiName: 'Technology', label: 'Tecnologia' },
  { id: 3, apiName: 'Sport', label: 'Esporte' },
  { id: 4, apiName: 'Music', label: 'Música' },
  { id: 5, apiName: 'Science', label: 'Ciência' },
  { id: 6, apiName: 'Movies', label: 'Filmes' },
  { id: 7, apiName: 'Series', label: 'Séries' },
  { id: 8, apiName: 'Books', label: 'Livros' },
  { id: 9, apiName: 'Anime', label: 'Anime' },
  { id: 10, apiName: 'Art', label: 'Arte' },
  { id: 11, apiName: 'Photography', label: 'Fotografia' },
  { id: 12, apiName: 'Food & Cooking', label: 'Comida e culinária' },
  { id: 13, apiName: 'Travel', label: 'Viagem' },
  { id: 14, apiName: 'Fitness', label: 'Fitness' },
  { id: 15, apiName: 'Programming', label: 'Programação' },
  { id: 16, apiName: 'Economy', label: 'Economia' },
  { id: 17, apiName: 'History', label: 'História' },
  { id: 18, apiName: 'Nature', label: 'Natureza' },
  { id: 19, apiName: 'Design', label: 'Design' },
  { id: 20, apiName: 'Health', label: 'Saúde' },
] as const;

export const COMMUNITY_TYPES: readonly CommunityReferenceOption[] = [
  { id: 1, apiName: 'PUBLIC', label: 'Pública' },
  { id: 2, apiName: 'PRIVATE', label: 'Privada' },
  { id: 3, apiName: 'RESTRICTED', label: 'Restrita' },
] as const;

export function topicLabel(apiName: string | null | undefined): string {
  if (!apiName) {
    return '';
  }
  return COMMUNITY_TOPICS.find((topic) => topic.apiName === apiName)?.label ?? apiName;
}

export function typeLabel(apiName: string | null | undefined): string {
  if (!apiName) {
    return '';
  }
  return COMMUNITY_TYPES.find((type) => type.apiName === apiName)?.label ?? apiName;
}
