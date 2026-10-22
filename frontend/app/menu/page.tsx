'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAnalytics } from '@/lib/analytics-provider';
import Navbar from '@/components/Navbar';

const MENU = {
  Starters: [
    { id: 1,  name: 'Burrata & Heirloom Tomatoes', price: 14, desc: 'Creamy burrata, ripe heirlooms, fresh basil oil.' },
    { id: 2,  name: 'Seared Scallops',             price: 18, desc: 'Pan-seared diver scallops, cauliflower purée, micro herbs.' },
    { id: 3,  name: 'Mushroom Arancini',            price: 12, desc: 'Crispy risotto balls, wild mushroom, truffle aioli.' },
  ],
  'Main Course': [
    { id: 4,  name: 'Grilled Atlantic Salmon',  price: 28, desc: '6oz salmon, lemon caper butter, broccolini, dill oil.' },
    { id: 5,  name: 'Braised Short Rib',        price: 34, desc: '12-hour braised short rib, creamy polenta, gremolata.' },
    { id: 6,  name: 'Pasta Carbonara',          price: 22, desc: 'Hand-rolled tagliatelle, guanciale, aged pecorino, farm egg.' },
    { id: 7,  name: 'Margherita Risotto',       price: 20, desc: 'San Marzano tomatoes, fresh mozzarella, Arborio rice, basil.' },
  ],
  Desserts: [
    { id: 8,  name: 'Tiramisu',          price: 10, desc: 'Classic Italian tiramisu, mascarpone, espresso, cocoa.' },
    { id: 9,  name: 'Crème Brûlée',      price: 9,  desc: 'Vanilla bean custard, caramelized sugar, fresh berries.' },
    { id: 10, name: 'Chocolate Fondant', price: 11, desc: 'Warm dark chocolate cake, molten centre, vanilla gelato.' },
  ],
  'Wine & Drinks': [
    { id: 11, name: 'Château Margaux 2018',      price: 95,  desc: 'Full-bodied Bordeaux, dark fruit, cedar and tobacco notes. 750ml.' },
    { id: 12, name: 'Cloudy Bay Sauvignon Blanc', price: 65,  desc: 'Crisp New Zealand white, zesty citrus, passion fruit. 750ml.' },
    { id: 13, name: 'Moët & Chandon Brut NV',    price: 85,  desc: 'Classic Champagne, fine bubbles, green apple and brioche.' },
    { id: 14, name: 'Aperol Spritz',             price: 14,  desc: 'Aperol, Prosecco, soda water, fresh orange slice.' },
    { id: 15, name: 'Old Fashioned',             price: 16,  desc: 'Bourbon, Angostura bitters, sugar, orange peel.' },
    { id: 16, name: 'Sparkling Mineral Water',   price: 5,   desc: 'San Pellegrino, 500ml bottle.' },
    { id: 17, name: 'Freshly Squeezed Juices',   price: 7,   desc: 'Orange, grapefruit, or carrot-ginger. Daily press.' },
  ],
  "Chef's Special": [
    { id: 18, name: 'Wagyu Beef Tenderloin',       price: 68,  desc: 'A5 Wagyu, truffle jus, asparagus, roasted bone marrow. Limited nightly.' },
    { id: 19, name: 'Lobster Thermidor',           price: 72,  desc: 'Whole Atlantic lobster, cognac cream sauce, gruyère gratin. Weekend only.' },
    { id: 20, name: 'Black Truffle Tagliatelle',   price: 48,  desc: 'Fresh pasta, shaved Périgord black truffle, parmesan foam. Seasonal.' },
    { id: 21, name: "Chef's Tasting Menu (5-course)", price: 120, desc: 'Curated 5-course journey — ingredients chosen daily by the kitchen. Serves 2.' },
  ],
};

type CartItem = { id: number; name: string; price: number; qty: number };

export default function MenuPage() {
  const analytics    = useAnalytics();
  const searchParams = useSearchParams();
  const viewedItems  = useRef<Set<number>>(new Set());
  const [cart, setCart]               = useState<CartItem[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const initialTab = searchParams.get('tab') ?? 'Starters';
  const [activeSection, setActiveSection] = useState(
    Object.keys(MENU).includes(initialTab) ? initialTab : 'Starters'
  );

  function trackItemViewed(item: { id: number; name: string; price: number }) {
    if (viewedItems.current.has(item.id)) return;
    viewedItems.current.add(item.id);
    analytics?.track('menu_item_viewed', 'Menu Item Viewed', { item: item.name, price: item.price });
  }

  function addToCart(item: { id: number; name: string; price: number }) {
    analytics?.track('add_to_cart', 'Add to Cart', { item: item.name, price: item.price });
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  }

  function changeQty(id: number, delta: number) {
    setCart((prev) =>
      prev
        .map((c) => c.id === id ? { ...c, qty: c.qty + delta } : c)
        .filter((c) => c.qty > 0)
    );
  }

  function removeFromCart(id: number) {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }

  function clearCart() {
    setCart([]);
  }

  function placeOrder() {
    if (!cart.length) return;
    const total   = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const orderId = 'ORD-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    analytics?.track('order_created', 'Order Created', {
      order_id: orderId,
      items: cart.map((c) => ({ name: c.name, quantity: c.qty, price: c.price })),
      total: parseFloat(total.toFixed(2)),
      currency: 'USD',
    });
    setOrderPlaced(true);
    setCart([]);
  }

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Navbar />

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-stone-900 to-amber-950 py-12 px-6 text-center">
        <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-2">Seasonal Offerings</p>
        <h1 className="text-4xl font-bold text-white">Our Menu</h1>
        <p className="text-stone-300 mt-2 text-sm">Fresh, seasonal, crafted with love.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 flex flex-col lg:flex-row gap-8">

        {/* Menu */}
        <div className="flex-1 min-w-0">
          {/* Section tabs */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {Object.keys(MENU).map((section) => (
              <button key={section} onClick={() => setActiveSection(section)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeSection === section
                    ? 'bg-amber-500 text-stone-900 shadow-sm'
                    : 'bg-white border border-stone-200 text-stone-500 hover:border-amber-300'
                }`}>
                {section}
              </button>
            ))}
          </div>

          {Object.entries(MENU).map(([section, items]) => (
            <div key={section} className={section === activeSection ? 'block' : 'hidden'}>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id}
                    onMouseEnter={() => trackItemViewed(item)}
                    className="bg-white rounded-2xl border border-stone-100 p-5 flex items-start justify-between gap-4 hover:shadow-md transition-shadow group">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-stone-900 group-hover:text-amber-700 transition-colors">{item.name}</h3>
                      <p className="text-stone-400 text-sm mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xl font-bold text-amber-600">${item.price}</span>
                      <button onClick={() => addToCart(item)}
                        className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-sm px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95">
                        + Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Cart sidebar */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm sticky top-24 overflow-hidden">
            {/* Cart header */}
            <div className="bg-stone-900 px-5 py-4 flex items-center justify-between">
              <h2 className="text-white font-bold flex items-center gap-2">
                🛒 Your Order
                {cartCount > 0 && (
                  <span className="bg-amber-500 text-stone-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </h2>
            </div>

            <div className="p-5">
              {orderPlaced ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">🎉</div>
                  <p className="font-bold text-emerald-700 text-lg">Order Placed!</p>
                  <p className="text-stone-400 text-sm mt-1">Thank you for your order.</p>
                  <button onClick={() => setOrderPlaced(false)}
                    className="mt-4 text-sm text-amber-600 underline hover:text-amber-500">
                    Start a new order
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-3">🍴</p>
                  <p className="text-stone-400 text-sm">Add items to get started</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-stone-400">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
                    <button onClick={clearCart}
                      className="text-xs text-red-400 hover:text-red-500 transition-colors">
                      Clear all
                    </button>
                  </div>
                  <ul className="space-y-3 mb-4">
                    {cart.map((c) => (
                      <li key={c.id} className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-800 leading-snug">{c.name}</p>
                          <p className="text-xs text-stone-400 mt-0.5">${c.price} each</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => changeQty(c.id, -1)}
                            className="w-6 h-6 rounded-full border border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-600 text-sm font-bold flex items-center justify-center transition-colors">
                            −
                          </button>
                          <span className="w-5 text-center text-sm font-bold text-stone-900">{c.qty}</span>
                          <button onClick={() => changeQty(c.id, 1)}
                            className="w-6 h-6 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-900 text-sm font-bold flex items-center justify-center transition-colors">
                            +
                          </button>
                        </div>
                        <span className="text-sm font-bold text-stone-900 shrink-0 w-14 text-right">
                          ${(c.price * c.qty).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-stone-100 pt-3 space-y-1 mb-4">
                    <div className="flex justify-between text-sm text-stone-500">
                      <span>Subtotal</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-stone-500">
                      <span>Tax (8%)</span>
                      <span>${(cartTotal * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-100">
                      <span>Total</span>
                      <span>${(cartTotal * 1.08).toFixed(2)}</span>
                    </div>
                  </div>
                  <button onClick={placeOrder}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-100 shadow-sm">
                    Place Order →
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-stone-900 text-stone-400 py-10 px-6 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍽</span>
            <span className="text-white font-semibold">Bistro Table</span>
            <span className="text-stone-600 ml-2 text-sm">© 2024. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/menu"         className="text-amber-400">Menu</Link>
            <Link href="/reservations" className="hover:text-amber-400 transition-colors">Reservations</Link>
            <Link href="/about"        className="hover:text-amber-400 transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
