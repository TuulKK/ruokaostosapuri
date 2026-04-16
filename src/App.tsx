/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  ShoppingCart, 
  ChevronRight,
  X,
  Apple,
  Milk,
  Beef,
  Wheat,
  Package,
  Coffee,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { categorizeItem } from './services/geminiService';

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  completed: boolean;
  createdAt: number;
}

const CATEGORIES = [
  { id: 'produce', name: 'Hevi', icon: Apple, color: 'text-green-500' },
  { id: 'dairy', name: 'Maito & Vegaaniset', icon: Milk, color: 'text-blue-400' },
  { id: 'meat', name: 'Liha & Kala', icon: Beef, color: 'text-red-500' },
  { id: 'bakery', name: 'Leipomo', icon: Wheat, color: 'text-amber-600' },
  { id: 'pantry', name: 'Kuivatuotteet', icon: Package, color: 'text-orange-400' },
  { id: 'other', name: 'Muut', icon: Coffee, color: 'text-purple-500' },
];

export default function App() {
  const [items, setItems] = useState<GroceryItem[]>(() => {
    const saved = localStorage.getItem('grocery-list-items');
    return saved ? JSON.parse(saved) : [];
  });
  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('produce');
  const [isCategorizing, setIsCategorizing] = useState(false);

  useEffect(() => {
    localStorage.setItem('grocery-list-items', JSON.stringify(items));
  }, [items]);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || isCategorizing) return;

    const name = newItemName.trim();
    setIsCategorizing(true);
    
    try {
      // Yritetään tunnistaa kategoria tekoälyllä
      const aiCategory = await categorizeItem(name);
      
      // Jos tekoäly ei tunnista (palauttaa 'other') ja käyttäjä on valinnut jonkin muun kategorian,
      // käytetään käyttäjän valintaa. Muuten käytetään tekoälyn tunnistusta.
      const finalCategory = (aiCategory === 'other' && selectedCategory !== 'other') 
        ? selectedCategory 
        : aiCategory;

      const newItem: GroceryItem = {
        id: crypto.randomUUID(),
        name: name,
        category: finalCategory,
        completed: false,
        createdAt: Date.now(),
      };

      setItems(prev => [newItem, ...prev]);
      setNewItemName('');
    } catch (error) {
      // Jos tekoäly epäonnistuu kokonaan, käytetään valittua kategoriaa
      const newItem: GroceryItem = {
        id: crypto.randomUUID(),
        name: name,
        category: selectedCategory,
        completed: false,
        createdAt: Date.now(),
      };
      setItems(prev => [newItem, ...prev]);
      setNewItemName('');
    } finally {
      setIsCategorizing(false);
    }
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCompleted = () => {
    setItems(prev => prev.filter(item => !item.completed));
  };

  const resetList = () => {
    if (window.confirm('Haluatko varmasti tyhjentää koko listan?')) {
      setItems([]);
    }
  };

  const groupedItems = useMemo(() => {
    const groups: Record<string, GroceryItem[]> = {};
    items.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [items]);

  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter(i => i.completed).length;
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [items]);

  return (
    <div className="min-h-screen bg-[#FFF5F7] text-[#1A1A1A] font-sans selection:bg-pink-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Ruokaostokset</h1>
                <p className="text-sm text-pink-500 font-medium uppercase tracking-wider">Viikko {getWeekNumber(new Date())}</p>
              </div>
            </div>
            <button 
              onClick={resetList}
              className="p-2 text-gray-400 hover:text-pink-500 transition-colors rounded-full hover:bg-pink-50"
              title="Tyhjennä lista"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-8 bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="text-4xl font-light tracking-tighter text-pink-600">{stats.percent}%</span>
                <span className="text-sm text-pink-400 ml-2 font-medium uppercase tracking-widest">Valmiina</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-gray-900">{stats.completed}</span>
                <span className="text-sm text-gray-400"> / {stats.total} tuotetta</span>
              </div>
            </div>
            <div className="h-2 bg-pink-50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${stats.percent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </header>

        {/* Add Item Form */}
        <form onSubmit={addItem} className="mb-12 space-y-4">
          <div className="relative group">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Mitä tarvitaan?"
              className="w-full bg-white border-none rounded-2xl py-4 pl-6 pr-16 shadow-sm focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-pink-200 text-lg"
            />
            <button
              type="submit"
              disabled={!newItemName.trim() || isCategorizing}
              className="absolute right-2 top-2 bottom-2 px-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 disabled:opacity-50 disabled:hover:bg-pink-600 transition-all flex items-center justify-center"
            >
              {isCategorizing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Plus className="w-6 h-6" />
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    selectedCategory === cat.id
                      ? 'bg-white border-pink-200 text-pink-600 shadow-sm'
                      : 'bg-transparent border-transparent text-gray-400 hover:text-pink-400'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${selectedCategory === cat.id ? cat.color : 'text-current'}`} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </form>

        {/* List */}
        <div className="space-y-8">
          {items.length === 0 ? (
            <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium">Ostoslista on tyhjä</p>
              <p className="text-sm text-gray-300 mt-1">Lisää ensimmäinen tuote ylhäältä</p>
            </div>
          ) : (
            CATEGORIES.map(category => {
              const categoryItems = groupedItems[category.id];
              if (!categoryItems || categoryItems.length === 0) return null;

              return (
                <section key={category.id} className="space-y-3">
                  <div className="flex items-center gap-2 px-2">
                    <category.icon className={`w-4 h-4 ${category.color}`} />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      {category.name}
                    </h2>
                    <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-md font-bold">
                      {categoryItems.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {categoryItems.map(item => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`group flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-transparent hover:border-pink-100 transition-all ${
                            item.completed ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <button
                              onClick={() => toggleItem(item.id)}
                              className={`transition-colors ${
                                item.completed ? 'text-pink-500' : 'text-gray-200 hover:text-pink-400'
                              }`}
                            >
                              {item.completed ? (
                                <CheckCircle2 className="w-6 h-6 fill-pink-50" />
                              ) : (
                                <Circle className="w-6 h-6" />
                              )}
                            </button>
                            <span 
                              className={`text-lg transition-all ${
                                item.completed ? 'line-through text-gray-400' : 'text-gray-700'
                              }`}
                            >
                              {item.name}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-pink-500 transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {stats.completed > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 flex justify-center"
          >
            <button
              onClick={clearCompleted}
              className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-2xl hover:bg-pink-700 transition-all shadow-lg shadow-pink-100 text-sm font-bold uppercase tracking-widest"
            >
              <X className="w-4 h-4" />
              Poista kerätyt
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function getWeekNumber(d: Date) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}
