import { ChevronDown } from "lucide-react";
import React from "react";

const SidebarCategory = ({ cat, allCategories, category, updateFilter, level = 0 }: any) => {
    const children = allCategories.filter((c: any) => c.parentCategory?._id === cat._id);
    const hasChildren = children.length > 0;
    const isCategoryActive = category === cat.slug;
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div>
            <div className="flex items-center">
                <button onClick={() => updateFilter("category", cat.slug)} className={`flex-1 text-left px-3 py-2 text-sm rounded-md transition-all ${isCategoryActive ? "bg-app-green text-white" : "text-app-text-light hover:bg-app-cream"}`} style={{ paddingLeft: `${(level + 1) * 0.75}rem` }}>
                    {cat.name}
                </button>
                {hasChildren && (
                    <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-app-text-light hover:text-app-green transition-colors">
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                )}
            </div>
            {hasChildren && isOpen && (
                <div className="mt-0.5 space-y-0.5 border-l-2 border-app-border ml-3 pl-1 animate-fade-in">
                    {children.map((child: any) => (
                        <SidebarCategory key={child.slug} cat={child} allCategories={allCategories} category={category} updateFilter={updateFilter} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const FilterPanel = ({ categories, category, minPrice, maxPrice, updateFilter, clearFilters, hasFilters }: any) => {
    return (
        <div className="space-y-6">
            {/* Categories */}
            <div>
                <h3 className="text-sm font-semibold text-app-green mb-3">Categories</h3>
                <div className="space-y-1.5">
                    <button onClick={() => updateFilter("category", "")} className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-all ${!category ? "bg-app-green text-white" : "text-app-text-light hover:bg-app-cream"}`}>
                        All Categories
                    </button>
                    {categories.filter((c: any) => !c.parentCategory).map((cat: any) => (
                        <SidebarCategory key={cat.slug} cat={cat} allCategories={categories} category={category} updateFilter={updateFilter} />
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-sm font-semibold text-app-green mb-3">Price Range</h3>
                <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min" value={minPrice} onChange={(e) => updateFilter("minPrice", e.target.value)} className="w-full px-3 py-2 text-sm bg-white rounded-lg border not-focus:border-app-border" />

                    <span className="text-app-text-light">-</span>

                    <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => updateFilter("maxPrice", e.target.value)} className="w-full px-3 py-2 text-sm bg-white rounded-lg border not-focus:border-app-border" />
                </div>
            </div>

            {hasFilters && (
                <button onClick={clearFilters} className="w-full py-2 text-sm text-app-error hover:bg-red-50 rounded-lg transition-colors font-medium">
                    Clear All Filters
                </button>
            )}
        </div>
    );
};

export default FilterPanel;
