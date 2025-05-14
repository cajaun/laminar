export type LIST_DATA_ITEM = {
  id: string;
  name: string;
  email: string;
  profilePic: string;
};
export type LIST_DATA = LIST_DATA_ITEM[];

export type RENDER_ITEM_TYPE = {
  item: LIST_DATA_ITEM;
  index: number;
};
