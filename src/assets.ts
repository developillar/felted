import { Platform } from "react-native";

export const art = {
  avatars: require("../assets/art/avatars.png"),
  collectibles: require("../assets/art/collectibles.png"),
  readerScene: require("../assets/art/reader-scene.png"),
  clubVignette: require("../assets/art/club-vignette.png"),
};
export const avatars: Record<string, number> = {
  "cap-skater": 0,
  "purple-headphones": 1,
  "fox-glasses": 2,
  rabbit: 3,
  "frog-knit": 4,
  "cloth-ghost": 5,
  helmet: 6,
  "black-cat-knit": 7,
};
export const fontAssets = {
  DMSans:
    Platform.OS === "web"
      ? require("../assets/fonts/web/DMSans-Regular.woff2")
      : require("../assets/fonts/brand/DMSans-Regular.ttf"),
  DMSansMedium:
    Platform.OS === "web"
      ? require("../assets/fonts/web/DMSans-Medium.woff2")
      : require("../assets/fonts/brand/DMSans-Medium.ttf"),
  DMSansBold:
    Platform.OS === "web"
      ? require("../assets/fonts/web/DMSans-Bold.woff2")
      : require("../assets/fonts/brand/DMSans-Bold.ttf"),
  InstrumentSerif:
    Platform.OS === "web"
      ? require("../assets/fonts/web/InstrumentSerif-Regular.woff2")
      : require("../assets/fonts/brand/InstrumentSerif-Regular.ttf"),
  InstrumentSerifItalic:
    Platform.OS === "web"
      ? require("../assets/fonts/web/InstrumentSerif-Italic.woff2")
      : require("../assets/fonts/brand/InstrumentSerif-Italic.ttf"),
  Ioskeley:
    Platform.OS === "web"
      ? require("../assets/fonts/web/FeltedMono-Regular.woff2")
      : require("../assets/fonts/IoskeleyMono-Regular.ttf"),
  IoskeleyMedium:
    Platform.OS === "web"
      ? require("../assets/fonts/web/FeltedMono-Medium.woff2")
      : require("../assets/fonts/IoskeleyMono-Medium.ttf"),
  IoskeleySemiBold:
    Platform.OS === "web"
      ? require("../assets/fonts/web/FeltedMono-SemiBold.woff2")
      : require("../assets/fonts/IoskeleyMono-SemiBold.ttf"),
};
