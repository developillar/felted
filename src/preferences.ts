import AsyncStorage from '@react-native-async-storage/async-storage';
export type Preferences = { equipped: boolean; muted: boolean; sound: boolean; haptics: boolean; reducedMotion: boolean };
export const defaults: Preferences = { equipped: false, muted: false, sound: false, haptics: true, reducedMotion: false };
const key = 'felted.preferences.v1';
export async function loadPreferences(): Promise<Preferences> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return defaults;
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const result = { ...defaults };
  for (const name of Object.keys(defaults) as (keyof Preferences)[]) {
    if (typeof parsed[name] === 'boolean') result[name] = parsed[name];
  }
  return result;
}
export function savePreferences(value: Preferences) { return AsyncStorage.setItem(key, JSON.stringify(value)); }
