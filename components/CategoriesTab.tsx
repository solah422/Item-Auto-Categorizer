
import React, { useState, useMemo } from 'react';
import { CategorizationResult } from '../types';
import { Search, Filter, PieChart, Tag } from 'lucide-react';

interface Props {
  results: CategorizationResult[];
}

const CategoriesTab: React.FC<Props> = ({ results }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const summaries = useMemo(() => {
    const categoryMap = new Map<string, number>();
    const subcategoryMap = new Map<string, { category: string, count: number }>();

    results.forEach(r => {
      // Category count
      categoryMap.set(r.category, (categoryMap.get(r.category) || 0) + 1);
      
      // Subcategory count
      const subKey = `${r.category}|${r.subcategory}`;
      const existing = subcategoryMap.get(subKey) || { category: r.category, count: 0 };
      subcategoryMap.set(subKey, { ...existing, count: existing.count + 1 });
    });

    const categories = Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const subcategories = Array.from(subcategoryMap.entries())
      .map(([key, data]) => {
        const [_, sub] = key.split('|');
        return { category: data.category, subcategory: sub, count: data.count };
      })
      .sort((a, b) => b.count - a.count);

    return { categories, subcategories };
  }, [results]);

  const filteredCategories = summaries.categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubcategories = summaries.subcategories.filter(s => 
    s.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-24 text-center">
        <PieChart className="mx-auto text-slate-300 mb-4" size={64} />
        <h3 className="text-xl font-bold text-slate-800">No Analytics Available</h3>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto">
          Start a categorization run to see a breakdown of your items and discover trends.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Filter categories or subcategories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm"
          />
        </div>
        <div className="h-8 w-px bg-slate-200"></div>
        <button className="flex items-center space-x-2 text-slate-600 font-medium text-sm hover:text-blue-600">
          <Filter size={18} />
          <span>Advanced Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Categories Breakdown */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 px-2">
            <PieChart className="text-blue-600" size={20} />
            <h3 className="font-bold text-slate-800">Top Categories</h3>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCategories.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {cat.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-slate-900">{cat.count}</span>
                    </td>
                  </tr>
                ))}
                {filteredCategories.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-slate-400 text-sm">No categories found matching your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Subcategories Breakdown */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 px-2">
            <Tag className="text-indigo-600" size={20} />
            <h3 className="font-bold text-slate-800">Subcategory Insight</h3>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Subcategory</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Parent Category</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSubcategories.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-800">{sub.subcategory}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-500 px-2 py-1 bg-slate-100 rounded">
                        {sub.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-slate-900">{sub.count}</span>
                    </td>
                  </tr>
                ))}
                {filteredSubcategories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400 text-sm">No subcategories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CategoriesTab;
