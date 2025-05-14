import { Href } from "expo-router";

type Animation = {
  name: string;
  href: Href;
};

export type App = {
  name: string;
  animations: Animation[];
};