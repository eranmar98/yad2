import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ItemsServices, { type Item } from '../services/itemsServices';
import { categoryTree } from '../data/categories';
import ContactSellerButton from '../components/ContactSellerButton';
import Pagination from '../components/Pagination';

const REAL_ESTATE_LABEL = 'נדל"ן';
const CARS_LABEL = 'רכבים';
const PRODUCTS_LABEL = 'מוצרים';
// Top-level categories that get the filter sidebar.
const FILTERABLE_ROOTS = [REAL_ESTATE_LABEL, CARS_LABEL, PRODUCTS_LABEL];

const realEstateNode = categoryTree.find((node) => node.label === REAL_ESTATE_LABEL);
const dealTypeOptions = realEstateNode?.subCategories?.map((node) => node.label) ?? [];
const propertyTypeOptions = realEstateNode?.subCategories?.[0]?.subCategories?.map((node) => node.label) ?? [];
const productsNode = categoryTree.find((node) => node.label === PRODUCTS_LABEL);
const productTypeOptions = productsNode?.subCategories?.map((node) => node.label) ?? [];

const PRICE_DEBOUNCE_MS = 400;

function toggleInSet(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function parsePrice(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

// The sub-category paths the checklists narrow the search to, or undefined when nothing is filtered out.
function getCategoryFilter(
  rootCategory: string,
  dealTypes: Set<string>,
  propertyTypes: Set<string>,
  productTypes: Set<string>,
): string[] | undefined {
  if (rootCategory === REAL_ESTATE_LABEL) {
    const dealActive = dealTypes.size < dealTypeOptions.length;
    const propertyActive = propertyTypes.size < propertyTypeOptions.length;
    if (!dealActive && !propertyActive) return undefined;
    const deals = dealTypeOptions.filter((label) => dealTypes.has(label));
    const properties = propertyTypeOptions.filter((label) => propertyTypes.has(label));
    return deals.flatMap((deal) =>
      propertyActive
        ? properties.map((property) => `${REAL_ESTATE_LABEL} / ${deal} / ${property}`)
        : [`${REAL_ESTATE_LABEL} / ${deal}`],
    );
  }
  if (rootCategory === PRODUCTS_LABEL && productTypes.size < productTypeOptions.length) {
    return productTypeOptions.filter((label) => productTypes.has(label)).map((label) => `${PRODUCTS_LABEL} / ${label}`);
  }
  return undefined;
}

type CheckboxGroupProps = {
  title: string;
  options: string[];
  selected: Set<string>;
  onToggle: (label: string) => void;
};

function CheckboxGroup({ title, options, selected, onToggle }: CheckboxGroupProps) {
  return (
    <div className="mb-5">
      <p className="mb-2 font-sans text-xs font-bold text-ink/50">{title}</p>
      <div className="flex flex-col gap-2">
        {options.map((label) => (
          <label key={label} className="flex items-center gap-2 font-sans text-sm text-ink">
            <input
              type="checkbox"
              checked={selected.has(label)}
              onChange={() => onToggle(label)}
              className="h-4 w-4 rounded border-ink/30 accent-navy"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}

const priceInputClass =
  'w-full min-w-0 rounded-lg border border-ink/15 bg-white px-3 py-2 font-sans text-sm text-ink outline-none transition-colors duration-150 ease-out focus:border-ink focus-visible:ring-2 focus-visible:ring-ink/20';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const hasSearch = Boolean(keyword || category);
  const [items, setItems] = useState<Item[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sectionHeight, setSectionHeight] = useState<number>();

  // The section fills the viewport below the navbar so the pagination bar stays pinned to the
  // bottom of the screen while the items list scrolls above it.
  useLayoutEffect(() => {
    const measure = () => {
      const section = sectionRef.current;
      if (!section) return;
      const top = section.getBoundingClientRect().top + window.scrollY;
      setSectionHeight(Math.max(window.innerHeight - top, 400));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const rootCategory = category.split(' / ')[0];
  const isRealEstate = rootCategory === REAL_ESTATE_LABEL;
  const isProducts = rootCategory === PRODUCTS_LABEL;
  const hasFilters = FILTERABLE_ROOTS.includes(rootCategory);

  const [selectedDealTypes, setSelectedDealTypes] = useState<Set<string>>(new Set(dealTypeOptions));
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<Set<string>>(new Set(propertyTypeOptions));
  const [selectedProductTypes, setSelectedProductTypes] = useState<Set<string>>(new Set(productTypeOptions));
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  // Prices only reach the server once the user stops typing.
  const [debouncedPrices, setDebouncedPrices] = useState({ min: '', max: '' });

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedPrices({ min: minPriceInput, max: maxPriceInput }),
      PRICE_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [minPriceInput, maxPriceInput]);

  // Reset the filters whenever the category changes, pre-checking whatever the URL already implies.
  useEffect(() => {
    const [root, secondPart, thirdPart] = category.split(' / ');
    const realEstate = root === REAL_ESTATE_LABEL;
    setSelectedDealTypes(new Set(realEstate && secondPart ? [secondPart] : dealTypeOptions));
    setSelectedPropertyTypes(new Set(realEstate && thirdPart ? [thirdPart] : propertyTypeOptions));
    setSelectedProductTypes(new Set(root === PRODUCTS_LABEL && secondPart ? [secondPart] : productTypeOptions));
    setMinPriceInput('');
    setMaxPriceInput('');
    setDebouncedPrices({ min: '', max: '' });
  }, [category]);

  const categoryFilter = hasFilters
    ? getCategoryFilter(rootCategory, selectedDealTypes, selectedPropertyTypes, selectedProductTypes)
    : undefined;
  // A stable key so new-but-equal Sets don't trigger a refetch.
  const categoryFilterKey = categoryFilter ? JSON.stringify(categoryFilter) : '';
  const minPrice = hasFilters ? parsePrice(debouncedPrices.min) : undefined;
  const maxPrice = hasFilters ? parsePrice(debouncedPrices.max) : undefined;
  const filterActive =
    categoryFilter !== undefined || parsePrice(minPriceInput) !== undefined || parsePrice(maxPriceInput) !== undefined;

  useEffect(() => {
    // Filters can change faster than requests return; only the latest response may land.
    let ignore = false;
    setIsLoading(true);
    ItemsServices.getItems({
      keyword: keyword || undefined,
      category: category || undefined,
      categories: categoryFilterKey ? (JSON.parse(categoryFilterKey) as string[]) : undefined,
      minPrice,
      maxPrice,
      page,
    })
      .then((result) => {
        if (ignore) return;
        setItems(result.items);
        setTotalPages(result.totalPages);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [keyword, category, categoryFilterKey, minPrice, maxPrice, page]);

  const goToPage = (nextPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextPage <= 1) next.delete('page');
      else next.set('page', String(nextPage));
      return next;
    });
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // A changed filter starts the results over from page 1.
  const onFilterChange = () => {
    if (page > 1) goToPage(1);
  };

  const emptyMessage = filterActive ? (
    <p className="text-center font-sans text-ink/60">אין מודעות התואמות לסינון שבחרת</p>
  ) : (
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
  );

  return (
    <section
      ref={sectionRef}
      style={{ height: sectionHeight }}
      className="mx-auto flex w-full max-w-6xl flex-col px-6 pt-10"
    >
      <div className="shrink-0">
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
      </div>

      <div ref={scrollRef} className="-mx-2 min-h-0 flex-1 overflow-y-auto px-2 pb-6">
        <div className={hasFilters ? 'flex flex-col gap-8 lg:flex-row lg:items-start' : ''}>
          {hasFilters && (
            <aside className="w-full shrink-0 rounded-2xl border border-ink/10 p-5 lg:sticky lg:top-0 lg:w-64">
              <h2 className="mb-4 font-display text-sm font-bold text-ink">סינון {rootCategory}</h2>

              {isRealEstate && (
                <>
                  <CheckboxGroup
                    title="סוג עסקה"
                    options={dealTypeOptions}
                    selected={selectedDealTypes}
                    onToggle={(label) => {
                      setSelectedDealTypes((prev) => toggleInSet(prev, label));
                      onFilterChange();
                    }}
                  />
                  <CheckboxGroup
                    title="סוג נכס"
                    options={propertyTypeOptions}
                    selected={selectedPropertyTypes}
                    onToggle={(label) => {
                      setSelectedPropertyTypes((prev) => toggleInSet(prev, label));
                      onFilterChange();
                    }}
                  />
                </>
              )}

              {isProducts && (
                <CheckboxGroup
                  title="סוג מוצר"
                  options={productTypeOptions}
                  selected={selectedProductTypes}
                  onToggle={(label) => {
                    setSelectedProductTypes((prev) => toggleInSet(prev, label));
                    onFilterChange();
                  }}
                />
              )}

              <div>
                <p className="mb-2 font-sans text-xs font-bold text-ink/50">טווח מחירים (₪)</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="מ-"
                    aria-label="מחיר מינימלי"
                    value={minPriceInput}
                    onChange={(e) => {
                      setMinPriceInput(e.target.value);
                      onFilterChange();
                    }}
                    className={priceInputClass}
                  />
                  <span className="font-sans text-sm text-ink/40">–</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="עד"
                    aria-label="מחיר מקסימלי"
                    value={maxPriceInput}
                    onChange={(e) => {
                      setMaxPriceInput(e.target.value);
                      onFilterChange();
                    }}
                    className={priceInputClass}
                  />
                </div>
              </div>
            </aside>
          )}

          <div className="flex-1">
            {isLoading ? (
              <p className="text-center font-sans text-ink/60">טוען...</p>
            ) : items.length === 0 ? (
              emptyMessage
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
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
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </section>
  );
}
