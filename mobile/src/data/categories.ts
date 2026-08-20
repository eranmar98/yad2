export type CategoryNode = {
  label: string;
  subCategories?: CategoryNode[];
};

export const categoryTree: CategoryNode[] = [
  {
    label: 'נדל"ן',
    subCategories: [
      {
        label: 'להשכרה',
        subCategories: [{ label: 'בית/קוטג׳' }, { label: 'דירה' }, { label: 'יחידת דיור' }],
      },
      {
        label: 'מכירה',
        subCategories: [{ label: 'בית/קוטג׳' }, { label: 'דירה' }, { label: 'יחידת דיור' }],
      },
    ],
  },
  { label: 'רכבים' },
  {
    label: 'מוצרים',
    subCategories: [
      { label: 'מוצרי חשמל' },
      { label: 'טלפונים' },
      { label: 'מוצרי בית' },
      { label: 'גינה' },
    ],
  },
];

export function flattenCategoryPaths(nodes: CategoryNode[] = categoryTree, prefix = ''): string[] {
  return nodes.flatMap((node) => {
    const path = prefix ? `${prefix} / ${node.label}` : node.label;
    if (!node.subCategories) return [path];
    return [path, ...flattenCategoryPaths(node.subCategories, path)];
  });
}
