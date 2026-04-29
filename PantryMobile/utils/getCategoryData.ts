import { categoryMap } from "./categoryIcons";
import { productCategoryMap } from "./productCategoryMap";

export const getCategoryData = (productName: string) => {
  const normalized = productName.toLowerCase().trim();

  for (const keyword in productCategoryMap) {
    if (normalized.includes(keyword)) {
      const category = productCategoryMap[keyword];
      return categoryMap[category as keyof typeof categoryMap];
    }
  }

  return categoryMap.Other;
};
