/** arg map 子项 */
export type ArgMapItemType = {
  [key: string]: string[] | [];
  value: string[] | [];
};

/** arg map   */
export type ArgMapType = {
  [key: string]: ArgMapItemType;
};
