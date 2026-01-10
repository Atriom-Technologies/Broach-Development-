const EnumLabelOverrides: Record<string, Record<string, string>> = {
  noOfAssailants: {
    less_than_2: '1',
    from_2_5: '2-5',
    from_5_10: '5-10',
    over_10: 'Over 10',
  },

  ageRange: {
    less_than_18: 'Less than 18',
    from_18_to_25: '18-25',
    from_26_to_35: '26-35',
    from_36_to_45: '36-45',
    above_45: 'Above 45',
  },

  orgSize: {
    size_5_10: '5-10',
    size_10_20: '10-20',
    size_20_50: '20-50',
    size_50_plus: 'Above 50',
  },
};

// single humanizer
export function humanize(str: string) {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function parseEnum<T extends Record<string, string>>(
  enumObj: T,
  enumName?: string,
) {
  const overrides = enumName ? EnumLabelOverrides[enumName] : {};

  return Object.values(enumObj).map((value) => ({
    value,
    label: overrides?.[value] ?? humanize(value),
  }));
}

export function toProperCaseName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function humanizeText(value: string): string {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatDateHuman(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
