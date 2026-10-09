import AsyncStorage from "@react-native-async-storage/async-storage";

export const portraits = [
  { id: "black-cat-knit", name: "Black cat" },
  { id: "fox-glasses", name: "Fox" },
  { id: "rabbit", name: "Rabbit" },
  { id: "frog-knit", name: "Frog" },
  { id: "cloth-ghost", name: "Ghost" },
  { id: "cap-skater", name: "Skater" },
  { id: "purple-headphones", name: "Headphones" },
  { id: "helmet", name: "Explorer" },
] as const;
export type Profile = { name: string; avatar: string };
export const defaultProfile: Profile = {
  name: "You",
  avatar: "black-cat-knit",
};
const key = "felted.profile.v1";
export async function loadProfile(): Promise<Profile> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return defaultProfile;
  const value = JSON.parse(raw);
  return {
    name:
      typeof value?.name === "string" && value.name.trim()
        ? value.name.trim().slice(0, 24)
        : defaultProfile.name,
    avatar: portraits.some((p) => p.id === value?.avatar)
      ? value.avatar
      : defaultProfile.avatar,
  };
}
export function saveProfile(profile: Profile) {
  return AsyncStorage.setItem(key, JSON.stringify(profile));
}
