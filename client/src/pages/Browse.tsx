import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ItemsServices, { type Item } from '../services/itemsServices';
import { categoryTree } from '../data/categories';
import ContactSellerButton from '../components/ContactSellerButton';

const REAL_ESTATE_LABEL = 'נדל"ן';
const realEstateNode = categoryTree.find((node) => node.label === REAL_ESTATE_LABEL);
const dealTypeOptions = realEstateNode?.subCategories?.map((node) => node.label) ?? [];
const propertyTypeOptions =
  realEstateNode?.subCategories?.[0]?.subCategories?.map((node) => node.label) ?? [];

function toggleInSet(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export default function Browse() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const hasSearch = Boolean(keyword || category);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isRealEstate = category === REAL_ESTATE_LABEL || category.startsWith(`${REAL_ESTATE_LABEL} / `);
  const [selectedDealTypes, setSelectedDealTypes] = useState<Set<string>>(new Set(dealTypeOptions));
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<Set<string>>(
    new Set(propertyTypeOptions),
  );

  useEffect(() => {
    setIsLoading(true);
    ItemsServices.getItems({ keyword: keyword || undefined, category: category || undefined })
      .then(setItems)
      .finally(() => setIsLoading(false));
  }, [keyword, category]);

  // Reset the checklist whenever the category changes, pre-checking whatever the URL already implies.
  useEffect(() => {
    const [, dealPart, propertyPart] = category.split(' / ');
    setSelectedDealTypes(new Set(dealPart ? [dealPart] : dealTypeOptions));
    setSelectedPropertyTypes(new Set(propertyPart ? [propertyPart] : propertyTypeOptions));
  }, [category]);

  const dealFilterActive = selectedDealTypes.size < dealTypeOptions.length;
  const propertyFilterActive = selectedPropertyTypes.size < propertyTypeOptions.length;

  const visibleItems = useMemo(() => {
    if (!isRealEstate || (!dealFilterActive && !propertyFilterActive)) return items;
    return items.filter((item) => {
      const [, dealPart, propertyPart] = item.category.split(' / ');
      if (dealFilterActive && !(dealPart && selectedDealTypes.has(dealPart))) return false;
      if (propertyFilterActive && !(propertyPart && selectedPropertyTypes.has(propertyPart))) return false;
      return true;
    });
  }, [items, isRealEstate, dealFilterActive, propertyFilterActive, selectedDealTypes, selectedPropertyTypes]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-2 text-center font-display text-3xl font-extrabold text-ink">מודעות</h1>
      {hasSearch && (
        <p className="mb-8 text-center font-sans text-sm text-ink/60">
          {category && (
            <>
              קטגוריה: <span className="font-medium text-navy">{category}</span>
              {keyword ? ' · ' : ''}
            </>
          )}
          {keyword && <>תוצאות חיפוש עבור &quot;{keyword}&quot;</>}
        </p>
      )}

      {isLoading ? (
        <p className="text-center font-sans text-ink/60">טוען...</p>
      ) : items.length === 0 ? (
        <div className="text-center">
          <p className="font-sans text-ink/60">
            {hasSearch ? 'לא מצאנו את מה שחיפשת... נסה מיקום אחר' : 'אין עדיין מודעות פעילות'}
          </p>
          {hasSearch && (
            <Link to="/browse" className="mt-3 inline-block font-sans text-sm text-navy hover:underline">
              נקו את החיפוש וראו את כל המודעות
            </Link>
          )}
        </div>
      ) : (
        <div className={isRealEstate ? 'flex flex-col gap-8 lg:flex-row lg:items-start' : ''}>
          {isRealEstate && (
            <aside className="w-full shrink-0 rounded-2xl border border-ink/10 p-5 lg:w-64">
              <h2 className="mb-4 font-display text-sm font-bold text-ink">סינון נדל"ן</h2>

              <div className="mb-5">
                <p className="mb-2 font-sans text-xs font-bold text-ink/50">סוג עסקה</p>
                <div className="flex flex-col gap-2">
                  {dealTypeOptions.map((label) => (
                    <label key={label} className="flex items-center gap-2 font-sans text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={selectedDealTypes.has(label)}
                        onChange={() => setSelectedDealTypes((prev) => toggleInSet(prev, label))}
                        className="h-4 w-4 rounded border-ink/30 accent-navy"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 font-sans text-xs font-bold text-ink/50">סוג נכס</p>
                <div className="flex flex-col gap-2">
                  {propertyTypeOptions.map((label) => (
                    <label key={label} className="flex items-center gap-2 font-sans text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={selectedPropertyTypes.has(label)}
                        onChange={() => setSelectedPropertyTypes((prev) => toggleInSet(prev, label))}
                        className="h-4 w-4 rounded border-ink/30 accent-navy"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </aside>
          )}

          <div className="flex-1">
            {visibleItems.length === 0 ? (
              <p className="text-center font-sans text-ink/60">אין מודעות התואמות לסינון שבחרת</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleItems.map((item) => (
                  <div key={item._id} className="overflow-hidden rounded-2xl border border-ink/10">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} className="h-48 w-full object-cover" />
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-navy/5 font-sans text-sm text-ink/40">
                        אין תמונה
                      </div>
                    )}
                    <div className="p-5">
                      <span className="font-sans text-xs font-medium text-navy">{item.category}</span>
                      <h2 className="mt-1 font-display font-bold text-ink">{item.title}</h2>
                      <p className="mt-2 font-display text-lg font-bold text-navy">{item.price} ₪</p>
                      <ContactSellerButton item={item} className="mt-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}