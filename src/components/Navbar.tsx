import { ArrowUpRightIcon, BikeIcon, ChevronDownIcon, LogOutIcon, MapPinIcon, MenuIcon, PackageIcon, SearchIcon, ShieldIcon, ShoppingCartIcon, UserIcon, XIcon, HeartIcon } from "lucide-react";
import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { assets } from "../assets/assets";
import api from "../config/api";

const CategoryNode = ({ category, allCategories }: { category: any; allCategories: any[] }) => {
    const children = allCategories.filter(c => c.parentCategory?._id === category._id);
    const hasChildren = children.length > 0;
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
            <Link to={`/products?category=${category.slug}`} className="px-5 py-2.5 text-sm hover:bg-orange-50 hover:text-app-orange flex justify-between items-center transition-colors">
                {category.name}
                {hasChildren && <ChevronDownIcon className="size-3 -rotate-90 text-zinc-400" />}
            </Link>
            {hasChildren && isOpen && (
                <div className="absolute top-0 left-full -ml-1 w-52 bg-white rounded-xl shadow-lg border border-app-border py-2 z-50 animate-fade-in">
                    {children.map(child => (
                        <CategoryNode key={child.slug} category={child} allCategories={allCategories} />
                    ))}
                </div>
            )}
        </div>
    );
};

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartCount, setIsCartOpen } = useCart();
    const [searchQuery, setSearchQuery] = useState("");
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const navigate = useNavigate();

    React.useEffect(() => {
        api.get("/categories").then(res => setCategories(res.data.categories)).catch(() => {});
    }, []);

    const handleSearch = (e: React.SubmitEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
        }
    };

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate("/");
    };

    return (
        <nav className="bg-white sticky top-0 z-50 border-b border-app-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 text-[22px] font-medium shrink-0">
                    <img src={assets.dailysewa_nav_logo} alt="DailySewa Logo" className="h-8 md:h-10" />
                </Link>

                <div className="w-full flex items-center justify-end gap-4 lg:gap-10">
                    {/* Nav Links - Desktop */}
                    <div className="hidden md:flex items-center gap-6 text-sm text-zinc-600">
                        <NavLink to="/" className={({ isActive }) => isActive ? "text-app-orange font-medium" : "hover:text-app-orange transition-colors"}>Home</NavLink>
                        <NavLink to="/products" className={({ isActive }) => isActive ? "text-app-orange font-medium" : "hover:text-app-orange transition-colors"}>Products</NavLink>
                        
                        <div className="relative group py-2">
                            <button className="flex items-center gap-1 hover:text-app-orange transition-colors outline-none">
                                Categories <ChevronDownIcon className="size-4" />
                            </button>
                            <div className="absolute top-full left-0 mt-0 w-56 bg-white rounded-xl shadow-lg border border-app-border py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                {categories.filter(c => !c.parentCategory).map(parent => (
                                    <CategoryNode key={parent.slug} category={parent} allCategories={categories} />
                                ))}
                            </div>
                        </div>

                        <NavLink to="/deals" className={({ isActive }) => isActive ? "text-app-orange font-medium" : "hover:text-app-orange transition-colors"}>Deals</NavLink>
                    </div>
                    {/* Search */}
                    <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-sm text-xs sm:text-sm">
                        <div className="relative w-full">
                            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                            <input type="text" placeholder="Search for groceries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-8 p-2 bg-orange-50 rounded-full ring ring-app-orange/15 focus:ring-app-orange/30" />
                        </div>
                    </form>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        {/* Cart */}
                        <button className="relative p-2 rounded-xl" onClick={() => setIsCartOpen(true)}>
                            <ShoppingCartIcon className="size-5 text-zinc-900" />
                            {cartCount > 0 && <span className="absolute -top-1 -right-1 size-4 bg-app-orange text-white text-[10px] rounded-full flex-center">{cartCount}</span>}
                        </button>
                        
                        {/* Wishlist */}
                        {user && (
                            <Link to="/wishlist" className="relative p-2 rounded-xl hidden sm:block">
                                <HeartIcon className="size-5 text-zinc-900" />
                            </Link>
                        )}
                        
                        {/* User */}
                        <div className="relative">
                            {user ? (
                                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2">
                                    <div className="size-7 rounded-full bg-green-950 text-white flex-center">{user.name.charAt(0).toUpperCase()}</div>
                                    <ChevronDownIcon className="size-3 text-zinc-500" />
                                </button>
                            ) : (
                                <div className="flex-center gap-2">
                                    <Link to="/login" className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-950 rounded-full hover:bg-green-950-light transition-colors">
                                        <UserIcon size={16} /> Sign In
                                    </Link>
                                    {userMenuOpen ? <XIcon className="md:hidden" onClick={() => setUserMenuOpen(!userMenuOpen)} /> : <MenuIcon className="md:hidden" onClick={() => setUserMenuOpen(!userMenuOpen)} />}
                                </div>
                            )}

                            {userMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                    <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-xl shadow-lg border border-app-border py-2 z-50 animate-fade-in">
                                        <div className="px-4 py-3 border-b border-app-border md:hidden flex justify-center">
                                            <img src={assets.dailysewa_nav_logo} alt="DailySewa" className="h-6" />
                                        </div>
                                        {user && (
                                            <div className="px-4 py-2 border-b border-app-border">
                                                <p className="text-sm font-medium text-zinc-900">{user?.name}</p>
                                                <p className="text-xs text-zinc-500">{user?.email}</p>
                                            </div>
                                        )}
                                        <div onClick={() => setUserMenuOpen(false)}>
                                            {!user && (
                                                <Link to="/login" className="dropdown-link">
                                                    <UserIcon size={16} /> Sign In{" "}
                                                </Link>
                                            )}

                                            {user && (
                                                <Link to="/orders" className="dropdown-link">
                                                    <PackageIcon size={16} /> My Orders{" "}
                                                </Link>
                                            )}

                                            {user && (
                                                <Link to="/addresses" className="dropdown-link">
                                                    <MapPinIcon size={16} /> Addresses{" "}
                                                </Link>
                                            )}

                                            {user && (
                                                <Link to="/wishlist" className="dropdown-link sm:hidden">
                                                    <HeartIcon size={16} /> Wishlist{" "}
                                                </Link>
                                            )}

                                            <Link to="/products" className="dropdown-link md:hidden">
                                                <ArrowUpRightIcon size={16} /> Products{" "}
                                            </Link>

                                            <Link to="/deals" className="dropdown-link md:hidden">
                                                <ArrowUpRightIcon size={16} /> Deals{" "}
                                            </Link>
                                            {user?.isAdmin && (
                                                <Link to="/admin/products" className="dropdown-link">
                                                    <ShieldIcon className="text-app-orange-dark" size={16} /> <span className="text-app-orange-dark">Admin Panel</span>{" "}
                                                </Link>
                                            )}
                                            {user && (
                                                <div className="border-t border-app-border pt-1">
                                                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-app-error hover:bg-red-50 w-full transition-colors">
                                                        <LogOutIcon size={16} /> Logout
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
