declare module "tailwindcss/lib/util/flattenColorPalette" {
  type ColorValue = string;
  type ColorName = string;
  type ColorVariant = string;

  type ColorPalette = Record<
    ColorName,
    ColorValue | Record<ColorVariant, ColorValue>
  >;

  const flattenColorPalette: (
    colors: ColorPalette,
  ) => Record<string, ColorValue>;

  export default flattenColorPalette;
}
