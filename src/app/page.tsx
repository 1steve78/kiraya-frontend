"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  ChevronDown,
  Search,
  Bell,
  Settings,
  User,
  Zap,
  Star,
  Clock,
  Heart,
  Plus,
  Minus,
  X,
  ArrowRight,
  Home,
  ShoppingBag,
  Store,
  Pill,
  UtensilsCrossed,
  Fish,
  Flame,
  Coffee,
  PawPrint,
  LayoutGrid,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Shop {
  id: string;
  name: string;
  description: string;
  rating: number;
  distance: string;
  time: string;
  tag?: string;
  image: string;
}

interface Product {
  id: string;
  name: string;
  unit: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  image: string;
}

const CATEGORIES: Category[] = [
  { id: "grocery", name: "Grocery", icon: Store },
  { id: "pharmacy", name: "Pharmacy", icon: Pill },
  { id: "bakery", name: "Bakery", icon: UtensilsCrossed },
  { id: "meat", name: "Meat", icon: Fish },
  { id: "snacks", name: "Snacks", icon: Flame },
  { id: "beverages", name: "Beverages", icon: Coffee },
  { id: "pets", name: "Pet Care", icon: PawPrint },
  { id: "more", name: "More", icon: LayoutGrid },
];

const SHOPS: Shop[] = [
  {
    id: "shop-1",
    name: "Green Valley Grocers",
    description: "Fresh organic produce & daily essentials",
    rating: 4.8,
    distance: "0.8 km",
    time: "15 mins",
    tag: "Fastest Delivery",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBbmDi4e3UIzT9RsfuQcZNOQXv6wouvsngCgt-WfEoYBFD401YChU52jQkZbdYWC7olY2Qs5AFUAI63BwlmKneAPezdUBrGv1cRsNE1fiX4URaw2NVP5212K9xTFg6X4Yh3w0jjYdpgOjckRuL1lKJbxbnT7En-Stsr7_QGHdho3dmgJH4xcO1ir8_keyAFcXQT7aA-UqmQgnlByYttBRb5C-cn820C8J9kV1XsO7gNiV1WWUeHdSM4Fg",
  },
  {
    id: "shop-2",
    name: "City Health Pharmacy",
    description: "Medicines, wellness & baby care",
    rating: 4.6,
    distance: "1.2 km",
    time: "25 mins",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDmIYvu2OYqEeHDVVzo3yKjpVI9XNJ0S3Y_7G55itUihm9zpZsyke_WOyZGHO6H_sbsLmGxyXOFSIBOTVjEnb8oLFTgvsUHwF-dtuKGJVvncKdEkoe2WgSLZQ7pe6EKZDufik6p4FHvfcIYnZrg5sE5B4FlZPvXLyTRBo0JAkgZ-Dgkx334nTuvBERIe5sN37EXbB8zTkj1QaWISWvGPACJhpqT2wuNxytfWLWa264u7WJorkxAxJuJ6g",
  },
  {
    id: "shop-3",
    name: "The Daily Crumb",
    description: "Fresh bread, pastries & cakes",
    rating: 4.9,
    distance: "2.0 km",
    time: "35 mins",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAM4ZfV-XIGwrqR8J79VwTh8Q4MAyn-CyItgt1aYhFeq7vwIaxbXIXtF5Qi7nz0b1Q7ytTC3U_qzMKjWYLXLp2wahpu26cXqJZ41taWo22CoU6WiA7yiA35rEsd0nROIcwnHLPtOHZ3D8GOr9Lqs-5-Mok9Sj8B6LM7xK2sBBceXzjOscmRTeSSavSq17A69QBQZIpnobJTXnUh8PWWqYYaKchOu25AzB09DJzGp9g3gq8XmlMLcPb8Ww",
  },
];

const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Fresh Bananas (Robusta)",
    unit: "1 kg",
    price: 2.5,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDTYqJs1iU9BgOknRdfd5AiPb5_kXl_flCdeF8UH0yBA7VpL9FTZ0ahlUvlUnzbmqHLjLTd54SsR5vq4drsGjatEKjbnmMzRLLwRFm2hlQSrP12r8pdOn4DiWy6IXFDqNhKwu96rT_gFFK940CLTQHcfBA7yAjKsI6GHwephUTMtS1hH4Pa_MeM4P8v417QfenZptnMacf-Xk0PyxS_H--H_zToEl2ZD3J2McbxX3WrVi1UM5_p64JECQ",
  },
  {
    id: "prod-2",
    name: "Whole Wheat Bread",
    unit: "400g",
    price: 1.8,
    originalPrice: 2.0,
    discount: "10% OFF",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA9S9_yYhusN0RAo0N4UWjxqy55Lgs-gQjycSlUMRYxKBWjHah324ZXB1n_oVU9bQOpXtKb1WQsMC3CLMClG0F67I2wh-6vOdsDuwMvr7Bslmg2vEvsnJ6CB_BmsnO5lip5AxSMTX393X19TDzhe_dnd2OpGO_B6qzTiqEDxICEPfSIgBSOKcNJ-Eq5wLAOfJ_oOAmod5dgQL8YLpL-9L7o5ljkxVXRfnkX-5tTcVVyu1RwneZVYh0OYQ",
  },
  {
    id: "prod-3",
    name: "Farm Fresh Cow Milk",
    unit: "1 L",
    price: 1.5,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD2R3kGQ0jzVeuDYeN_E81FVc3ZNJraK98ixhYdzDuvjBa-3ZzaDfh30B5g8gSDAqXOCfRPZNc_kpENQirufpvay50DWiNILApG2Gl3udrI7NU-zDP4pF0CwOQD5NhFAWd5vp67RnbfqWYD2moOisGDq_gK_00e6CRR3GMSKL4dgteOxefGNByBq35CcscUWIEMdlIEQLbPUgund5jpDTmFAFy1_2hfnk03BVrp-lSFvFKsjSaFg3FvNQ",
  },
  {
    id: "prod-4",
    name: "Paracetamol 500mg",
    unit: "Strip of 15",
    price: 0.99,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB2Q8pmrx5oQFQ7vV4fjESnZuUqXnuxmh5cTDimxoAUiu_3oFuqJzWUbuWOi9LUGTvV_DmzXDFRHI8gKt2Gdu7PRE361PMrVbm63RMGGooO6zTl9kUF21fwzyV7Lnp9Ly7PFn4PWVn2h3qDaPKPEp370wIFuFcc1geAVwTUl9waM5JAXH7A2FmMMixnxni1xuTxiGiFnPW-fTkWqB7Ywn_I4q9VoxmKj98PBMVmaS6r06zEnlQOWTYqQQ",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<"home" | "search" | "orders" | "account">("home");

  // Auth state — read from localStorage
  const [authUser, setAuthUser] = useState<{ name: string; role: string; shopId?: number } | null>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const raw = localStorage.getItem('kiraya_auth_user');
      if (token && raw) setAuthUser(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('kiraya_auth_user');
    setAuthUser(null);
    router.refresh();
  }, [router]);

  const isShopOwner = authUser?.role === 'SHOP_OWNER' || authUser?.role === 'SHOP_STAFF';
  const isDelivery  = authUser?.role === 'DELIVERY_PARTNER';

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (id: string) => {
    setCartQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const filteredProducts = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] font-sans min-h-screen pb-24 md:pb-12">
      {/* TopNavBar (Desktop) */}
      <header className="hidden md:flex justify-between items-center w-full px-6 lg:px-16 h-16 bg-white shadow-xs sticky top-0 z-50 border-b border-slate-200/80">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-extrabold text-2xl text-[#006e2f] tracking-tight hover:opacity-90 transition-opacity">
            HyperLocal
          </Link>
          <button className="flex items-center gap-1.5 text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-full transition-colors text-sm font-medium border border-transparent hover:border-slate-200">
            <MapPin className="w-4 h-4 text-[#006e2f] fill-[#006e2f]" />
            <span className="font-semibold text-slate-800">Kankinara</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <nav className="flex items-center gap-2">
          <Link href="/" className="text-[#006e2f] bg-emerald-50 px-4 py-2 rounded-full text-sm font-semibold transition-colors">
            Marketplace
          </Link>
          {/* Role-specific nav links */}
          {isShopOwner && (
            <Link href="/shop/dashboard" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5">
              <Store className="w-4 h-4" /> Shop Dashboard
            </Link>
          )}
          {isDelivery && (
            <Link href="/delivery/dashboard" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" /> My Deliveries
            </Link>
          )}
          {authUser && !isShopOwner && !isDelivery && (
            <Link href="/orders/101" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-full text-sm font-medium transition-colors">
              My Orders
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {authUser ? (
            <>
              <span className="text-sm font-semibold text-slate-700 px-2">
                👋 {authUser.name.split(' ')[0]}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-[#004b1e] border border-emerald-200 uppercase tracking-wider">
                {authUser.role.replace('_', ' ')}
              </span>
              <button
                onClick={handleLogout}
                className="ml-2 text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-full border border-slate-200 hover:border-red-200 active:scale-95 transition-all"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-full border border-slate-200 active:scale-95 transition-all">
                Sign in
              </Link>
              <Link href="/register" className="bg-[#006e2f] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-emerald-800 transition-all active:scale-95 shadow-xs ml-1">
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center px-4 py-3 bg-white sticky top-0 z-40 border-b border-slate-200/80 shadow-xs">
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Delivering to</span>
          <div className="flex items-center gap-1 text-slate-900 cursor-pointer">
            <span className="text-sm font-bold">Kankinara</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </div>
        </div>
        {authUser ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#004b1e] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
              {authUser.role.split('_')[0]}
            </span>
            <button onClick={handleLogout} className="bg-slate-100 p-2 rounded-full text-slate-700 hover:bg-red-100 hover:text-red-600 transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <Link href="/login" className="bg-[#006e2f] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-emerald-800 transition-colors">
            Sign in
          </Link>
        )}
      </div>


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-6 space-y-8">
        {/* Search Hero Section */}
        <section className="bg-emerald-50/70 border border-emerald-200/60 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xs">
          <div className="w-full md:w-1/2 space-y-4 z-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#004b1e] tracking-tight leading-tight">
              What are you looking for?
            </h2>
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 rounded-full bg-white border border-slate-200 focus:border-[#006e2f] focus:ring-3 focus:ring-emerald-500/20 outline-hidden transition-all text-sm md:text-base text-slate-900 shadow-xs placeholder:text-slate-400"
                placeholder="Search for groceries, medicine, or shops..."
                type="text"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="w-full md:w-1/2 h-48 md:h-64 relative rounded-2xl overflow-hidden hidden md:block shadow-sm">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKYXGwAWf0_u-ByMRRq4ALc3VjlG0cjnRmV_ejvEWM6t5oFgdn3IhLOcpqnADugggnrdCXiUgk4IzgaTad1nYDKQ6uGskZIPNAb-lTwLzYLFC7Za01aonjQc0Mqnh0-ocmoCdos2756UTKTG5qFYSe-HWwjecnOBvN-fz3OyV1ZJE6KQZrDHTzzETBB4Mz9f6sYXl5y9V23pHvpVAMf0iAUeItfRPruoevwh7d_Q1ymLjuIe3YdIK4yg"
              alt="Fresh produce and groceries"
              fill
              className="object-cover rounded-2xl"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900">Categories</h3>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                  className="flex flex-col items-center gap-2 cursor-pointer group focus:outline-hidden"
                >
                  <div
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-xs group-hover:scale-105 ${
                      isSelected
                        ? "bg-[#006e2f] text-white shadow-md ring-4 ring-emerald-500/20"
                        : "bg-white border border-slate-200/80 text-[#006e2f] group-hover:bg-[#22c55e] group-hover:text-white group-hover:border-transparent group-hover:shadow-md"
                    }`}
                  >
                    <Icon className="w-7 h-7 md:w-8 md:h-8 transition-transform group-hover:scale-110" />
                  </div>
                  <span
                    className={`text-xs md:text-sm font-medium text-center transition-colors ${
                      isSelected ? "text-[#006e2f] font-bold" : "text-slate-700 group-hover:text-slate-900"
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Deals Banners */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#ef9900] rounded-3xl p-6 flex items-center justify-between shadow-xs relative overflow-hidden min-h-[140px] md:min-h-[160px] cursor-pointer hover:shadow-md transition-shadow group">
            <div className="z-10 text-[#3b2300] space-y-1 max-w-[65%]">
              <h4 className="text-2xl md:text-3xl font-extrabold tracking-tight">50% OFF</h4>
              <p className="text-sm md:text-base font-semibold text-[#5c3800]">On your first grocery order</p>
              <span className="inline-block mt-2 bg-[#5c3800] text-[#ffddb8] px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-xs">
                Use Code: FRESH50
              </span>
            </div>
            <div className="absolute right-0 top-0 w-1/2 h-full opacity-60 group-hover:opacity-75 transition-opacity">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCc9A2b3M9aHBeI5mlQlkuQPapTL2086oF_uhnXZDXuQ-yCJg51A25CoyAn9QXYYZy1JQGHoYtJkFrQtFAHVOkdq4daSBWJ7-oyEG3wiR_d56ykAgAKiuv0h45Sq7spjEZaqZI4TBRX7paSdu7xOvqPrggFDhxKR61OQ2BSjf1WOC55J6Va8iiWXk9AWZ-RY7HNG3o1pC6oXEixhVHHMD4Bqi6otN6PCD6wypzFcqNEOi6Hv8UMaW-iHQ"
                alt="Fresh grocery deals illustration"
                fill
                className="object-cover mix-blend-multiply"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          </div>

          <div className="bg-[#dce9ff] rounded-3xl p-6 flex items-center justify-between shadow-xs relative overflow-hidden min-h-[140px] md:min-h-[160px] cursor-pointer hover:shadow-md transition-shadow group border border-blue-200/50">
            <div className="z-10 text-slate-900 space-y-1 max-w-[65%]">
              <h4 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">Free Delivery</h4>
              <p className="text-sm md:text-base font-medium text-slate-600">Orders over $20 from Pharmacy</p>
              <span className="inline-block mt-2 bg-[#006e2f] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs group-hover:bg-emerald-800 transition-colors">
                Shop Now
              </span>
            </div>
            <div className="absolute right-0 top-0 w-1/2 h-full opacity-40 group-hover:opacity-60 transition-opacity">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6ROmiS9UTuZ3hIpcMvD-D6z7wD5GTrV5s8C03iDfcn2VzG_uTDrsWRNjz84n1nN_u8e4-jjbrTKr3NX_35zgF7kW3yA-g8OLeXW5puiasD2ElFAM075sDGLll4AXcnp-rCeU7TF21v12klgErBBjLxNWXwlV1Zc6BK3lzMdoxyuUeJos_YalHv6nYvbE3YM6BcOn6UoNJc70gcgkjD9BEFz6QEEAM-wU4w9LOzpL8Ao4hdrmYM8kmLQ"
                alt="Pharmacy promotion graphic"
                fill
                className="object-cover mix-blend-multiply"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          </div>
        </section>

        {/* Nearby Shops (Horizontal Scroll) */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900">Nearby Shops</h3>
            <a
              href="#all-shops"
              className="text-[#006e2f] font-semibold text-sm hover:underline inline-flex items-center gap-1 group"
            >
              <span>See All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-2 snap-x">
            {SHOPS.map((shop) => (
              <div
                key={shop.id}
                className="min-w-[280px] md:min-w-[320px] bg-white rounded-2xl shadow-xs snap-center overflow-hidden border border-slate-200/80 flex flex-col hover:shadow-lg transition-all group"
              >
                <div className="h-36 bg-slate-100 relative overflow-hidden">
                  <Image
                    src={shop.image}
                    alt={shop.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 280px, 320px"
                  />
                  {shop.tag && (
                    <div className="absolute top-3 left-3 bg-amber-500 text-amber-950 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                      <Zap className="w-3.5 h-3.5 fill-amber-950" />
                      <span>{shop.tag}</span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 mb-1 group-hover:text-[#006e2f] transition-colors">
                      {shop.name}
                    </h4>
                    <p className="text-sm text-slate-500 line-clamp-1">{shop.description}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-600 border-t border-slate-100 pt-3">
                    <div className="inline-flex items-center gap-1 text-[#006e2f] font-bold">
                      <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                      <span>{shop.rating}</span>
                    </div>
                    <div className="inline-flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{shop.distance}</span>
                    </div>
                    <div className="inline-flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{shop.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Products (Grid) */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900">Popular Right Now</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const isFav = favorites[product.id];
              const quantity = cartQuantities[product.id] || 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-3 flex flex-col border border-slate-200/80 hover:shadow-lg transition-all group"
                >
                  <div className="h-32 md:h-40 bg-slate-50 rounded-xl mb-3 relative p-2 flex items-center justify-center overflow-hidden border border-slate-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-2 mix-blend-multiply group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    {product.discount && (
                      <div className="absolute top-2 left-2 bg-red-100 text-red-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {product.discount}
                      </div>
                    )}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      aria-label="Toggle Favorite"
                      className={`absolute top-2 right-2 p-1.5 rounded-full shadow-xs transition-colors ${
                        isFav
                          ? "bg-red-500 text-white"
                          : "bg-white text-slate-400 hover:text-red-500 hover:bg-slate-50"
                      }`}
                    >
                      <Heart
                        className="w-4 h-4"
                        fill={isFav ? "currentColor" : "none"}
                      />
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h5 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-tight">
                        {product.name}
                      </h5>
                      <p className="text-xs text-slate-500 mt-1">{product.unit}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-base font-extrabold text-slate-900">${product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                          <span className="text-[11px] text-slate-400 line-through">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {quantity > 0 ? (
                        <div className="flex items-center gap-1.5 bg-[#22c55e] text-white px-2 py-1 rounded-full text-xs font-bold shadow-xs">
                          <button
                            onClick={() =>
                              setCartQuantities((prev) => ({
                                ...prev,
                                [product.id]: Math.max(0, prev[product.id] - 1),
                              }))
                            }
                            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-emerald-700 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-1 text-slate-950 font-extrabold">{quantity}</span>
                          <button
                            onClick={() => handleAddToCart(product.id)}
                            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-emerald-700 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          aria-label={`Add ${product.name} to cart`}
                          className="w-8 h-8 rounded-full bg-[#22c55e] text-white flex items-center justify-center hover:bg-[#006e2f] active:scale-90 transition-all shadow-xs"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-18 px-4 bg-white shadow-lg rounded-t-2xl border-t border-slate-200">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center justify-center rounded-full px-4 py-1.5 transition-all ${
            activeTab === "home"
              ? "bg-[#22c55e] text-[#004b1e] font-bold"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => setActiveTab("search")}
          className={`flex flex-col items-center justify-center rounded-full px-4 py-1.5 transition-all ${
            activeTab === "search"
              ? "bg-[#22c55e] text-[#004b1e] font-bold"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[11px] mt-0.5">Search</span>
        </button>

        <Link
          href="/orders/101"
          onClick={() => setActiveTab("orders")}
          className={`flex flex-col items-center justify-center rounded-full px-4 py-1.5 transition-all ${
            activeTab === "orders"
              ? "bg-[#22c55e] text-[#004b1e] font-bold"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[11px] mt-0.5">Orders</span>
        </Link>

        {authUser ? (
          <button
            onClick={handleLogout}
            className={`flex flex-col items-center justify-center rounded-full px-4 py-1.5 transition-all text-red-500 hover:bg-red-50`}
          >
            <User className="w-5 h-5" />
            <span className="text-[11px] mt-0.5">Sign out</span>
          </button>
        ) : (
          <Link
            href="/login"
            onClick={() => setActiveTab("account")}
            className={`flex flex-col items-center justify-center rounded-full px-4 py-1.5 transition-all ${
              activeTab === "account"
                ? "bg-[#22c55e] text-[#004b1e] font-bold"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[11px] mt-0.5">Sign in</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
