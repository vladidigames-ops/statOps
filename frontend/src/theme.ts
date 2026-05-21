import { createTheme, type MantineColorsTuple, type MantineThemeOverride } from "@mantine/core";

const emerald: MantineColorsTuple = [
  "#e6fbf3",
  "#c4f1de",
  "#9ce5c5",
  "#6fd9a9",
  "#43cd8e",
  "#1cc377",
  "#00bd6c",
  "#00a55c",
  "#008c4d",
  "#00723e",
];

export const theme: MantineThemeOverride = createTheme({
  primaryColor: "emerald",
  primaryShade: { light: 6, dark: 5 },
  defaultRadius: "md",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Roboto, Helvetica, Arial, sans-serif',
  headings: {
    fontWeight: "700",
  },
  colors: {
    emerald,
  },
});
