// A utility function that converts prisma text to human readable texts best for UI presentation
function humanizeEnum(str: string) {
  return str
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function parseEnum<T extends Record<string, string>>(
  enumObj: T,
  enumName?: string,
) {
  const overrides = enumName ? EnumLabelOverrides[enumName] : undefined;

  return Object.values(enumObj).map((item) => ({
    value: item,
    label: overrides?.[item] ?? humanizeEnum(item),
  }));
}

export function toReadableLabel(str: string): string {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const EnumLabelOverrides: Record<string, Record<string, string>> = {
  NoOfAssailants: {
    less_than_2: '1',
    from_2_5: '2–5',
    from_5_10: '5–10',
    over_10: 'Over 10',
  },

  AgeRange: {
    less_than_18: 'Less than 18',
    from_18_to_25: '18–25',
    from_26_to_35: '26–35',
    from_36_to_45: '36–45',
    above_45: 'Above 45',
  },

  OrgSize: {
    size_5_10: '5–10',
    size_10_20: '10–20',
    size_20_50: '20–50',
    size_50_plus: 'Above 50',
  },
};
