export enum TabValue {
  ForYou = 0,
  Following = 1,
  News = 2,
  Sports = 3,
  Entertainment = 4,
  Design = 5,

}

export type Tab = { label: string; value: TabValue; content: React.ReactNode };
