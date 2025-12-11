// A utility function that converts prisma text to human readable texts best for UI presentation
function humanizeEnum(str: string) {
  return str
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function parseEnum<T extends Record<string, string>>(enumObj: T) {
  return Object.values(enumObj).map((item) => ({
    value: item,
    label: humanizeEnum(item),
  }));
}
