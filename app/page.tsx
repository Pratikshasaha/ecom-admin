"use client";

import { useState, useEffect } from "react";

interface UserType {
  id: string | number;
  name: string;
  email: string;
  vendorName?: string;
  location?: string;
  mobile?: string;
  role: string;
  status?: string;
}

export default function Home() {
  // Login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [pendingStatus, setPendingStatus] = useState(false);

  // Registration states
  const [regForm, setRegForm] = useState({
    name: "",
    vendorName: "",
    email: "",
    mobile: "",
    location: "",
    password: "",
    confirmPassword: ""
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  const [showDashboard, setShowDashboard] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [profile, setProfile] = useState<UserType | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check for existing login on mount
  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      const userData = JSON.parse(loggedInUser);
      setUser(userData);
      if (userData.status === 'pending') {
        setPendingStatus(true);
      } else {
        setShowDashboard(true);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    setPendingStatus(false);

    try {
      const response = await fetch("https://ecom-rest-topaz.vercel.app/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.message || "Invalid credentials");
        return;
      }

      const userData = data.user || data;
      
      if (userData.status === 'pending') {
        setPendingStatus(true);
        setUser(userData);
        return;
      }

      setUser(userData);

      if (userData.id) {
        try {
          const profileResponse = await fetch(
            `https://ecom-rest-topaz.vercel.app/users/${userData.id}`,
          );
          const profileData = await profileResponse.json();

          if (profileResponse.ok) {
            setProfile(profileData);
            localStorage.setItem("loggedInUser", JSON.stringify(profileData));
            localStorage.setItem("userRole", profileData.role);
            setShowDashboard(true);
          }
        } catch (profileErr) {
          console.error("Failed to fetch profile:", profileErr);
          setShowDashboard(true);
        }
      } else {
        localStorage.setItem("loggedInUser", JSON.stringify(userData));
        setShowDashboard(true);
      }

      setEmail("");
      setPassword("");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password match
    if (regForm.password !== regForm.confirmPassword) {
      setRegError("Passwords do not match");
      return;
    }

    setRegLoading(true);
    setRegError("");
    setRegSuccess(false);

    try {
      const response = await fetch("https://ecom-rest-topaz.vercel.app/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: regForm.name,
          vendorName: regForm.vendorName,
          email: regForm.email,
          mobile: regForm.mobile,
          location: regForm.location,
          password: regForm.password,
          role: "customer",
          status: "pending"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRegError(data.message || "Registration failed");
        return;
      }

      // Success: show approval message
      setRegSuccess(true);
      const userData = data.user || data;
      localStorage.setItem("loggedInUser", JSON.stringify(userData));
      
      // Reset form
      setRegForm({
        name: "",
        vendorName: "",
        email: "",
        mobile: "",
        location: "",
        password: "",
        confirmPassword: ""
      });
    } catch (err) {
      setRegError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setRegLoading(false);
    }
  };

  const handleDismissRegSuccess = () => {
    setRegSuccess(false);
  };

  if (showDashboard && user) {
    return (
      <div className="min-h-screen bg-white text-black">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-300 relative">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-bold text-white">Precia E-Commerce Dashboard</h1>
              <nav className="text-xs text-slate-300 hidden md:block">
                <a href="/" className="hover:text-white">📊 Dashboard</a>
                <span className="mx-2">/</span>
                <span className="text-white font-medium">Profile</span>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1 text-slate-300 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <nav className="hidden md:flex items-center space-x-1">
                <a href="/" className="px-3 py-1 text-xs text-white bg-slate-700 rounded transition">
                  📊 Dashboard
                </a>
                <a href="/products" className="px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition">
                  🛍️ Products
                </a>
                <a href="/orders" className="px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition">
                  📋 Orders
                </a>
                {user.role === 'superadmin' && (
                  <a href="/users" className="px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition">
                    👥 Users
                  </a>
                )}
              </nav>

              <button
                onClick={() => {
                  localStorage.removeItem("loggedInUser");
                  localStorage.removeItem("userRole");
                  setShowDashboard(false);
                  setUser(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition"
              >
                Sign Out
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden absolute top-full right-0 mt-1 w-56 bg-slate-700 rounded-lg shadow-xl border border-slate-600 z-50">
                <nav className="py-2">
                  <a href="/" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-600 transition">
                    📊 Dashboard
                  </a>
                  <a href="/products" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-600 transition">
                    🛍️ Products
                  </a>
                  <a href="/orders" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-600 transition">
                    📋 Orders
                  </a>
                  {user.role === 'superadmin' && (
                    <a href="/users" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-600 transition">
                      👥 Users
                    </a>
                  )}
                </nav>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-black mb-1">
              Welcome,{" "}
              <span className="text-slate-600">{user.name}</span>
            </h2>
            <p className="text-slate-500 text-sm">Your profile information</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded border border-gray-200 p-3 shadow-sm">
              <div className="flex items-center mb-2">
                <span className="text-sm mr-2">👤</span>
                <h3 className="text-sm font-semibold text-black">Profile</h3>
              </div>
              <div className="space-y-1 text-xs">
                <p><span className="font-medium">Name:</span> {user.name}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">ID:</span> {user.id}</p>
              </div>
            </div>

            <div className="bg-white rounded border border-gray-200 p-3 shadow-sm">
              <div className="flex items-center mb-2">
                <span className="text-sm mr-2">🏢</span>
                <h3 className="text-sm font-semibold text-black">Business</h3>
              </div>
              <div className="space-y-1 text-xs">
                <p><span className="font-medium">Vendor:</span> {user.vendorName || "N/A"}</p>
                <p><span className="font-medium">Location:</span> {user.location || "N/A"}</p>
              </div>
            </div>

            <div className="bg-white rounded border border-gray-200 p-3 shadow-sm">
              <div className="flex items-center mb-2">
                <span className="text-sm mr-2">📱</span>
                <h3 className="text-sm font-semibold text-black">Contact</h3>
              </div>
              <div className="space-y-1 text-xs">
                <p><span className="font-medium">Mobile:</span> {user.mobile || "N/A"}</p>
                <p><span className="font-medium">Role:</span> {user.role}</p>
              </div>
            </div>
          </div>

          {user.role === "superadmin" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-black mb-2">👥 Super Admin</h3>
              <p className="text-xs text-slate-600 mb-3">Manage all users</p>
              <a href="/users" className="inline-flex items-center px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium rounded transition">
                View Users
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (pendingStatus && user) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor Approval Pending</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Hi <strong>{user.name}</strong>,<br/>
            Your account is pending approval from Precia admin. 
            <br/>Please wait for verification. You will be notified via email.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                localStorage.removeItem("loggedInUser");
                localStorage.removeItem("userRole");
                setPendingStatus(false);
                setUser(null);
              }}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
            >
              Return to Login
            </button>
            <p className="text-xs text-gray-500">
              Already approved? <button 
                onClick={handleLogin}
                disabled={loginLoading}
                className="font-semibold text-slate-800 hover:text-slate-900 underline disabled:opacity-50"
              >
                Try logging in again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left - Description */}
          <div className="lg:pt-12">
            <h1 className="text-5xl lg:text-7xl font-black bg-gradient-to-r from-slate-50 via-white to-slate-200 bg-clip-text text-transparent mb-8 drop-shadow-2xl leading-tight">
              Precia
            </h1>
            <p className="text-3xl lg:text-4xl font-bold text-white mb-12 leading-tight">
              E-Commerce Dashboard
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-slate-400 to-transparent rounded-full mb-12"></div>
            <p className="text-xl lg:text-2xl text-slate-300 leading-relaxed max-w-lg">
              Leading e-commerce platform for modern businesses. 
              <br className="hidden lg:inline" />
              <span className="text-slate-200 font-semibold">Manage products, orders, and users effortlessly.</span>
            </p>
          </div>

          {/* Right - Forms */}
          <div className="lg:max-w-lg w-full">
            <div className="space-y-8">
              {/* Reg Success Message */}
              {regSuccess && (
                <div className="bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-3xl p-6 shadow-xl text-center animate-in fade-in-0 zoom-in-95 duration-500">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-green-900 mb-2">
                    Registration Completed!
                  </h3>
                  <p className="text-green-800 text-lg mb-6 leading-relaxed">
                    Please wait for Precia approval. You will be notified soon.
                  </p>
                  <button
                    onClick={handleDismissRegSuccess}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Got it, continue
                  </button>
                </div>
              )}

              {/* Login Form */}
              <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/60">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Welcome Back</h2>
                  <p className="text-slate-600 text-center text-lg">Sign in to your account</p>
                </div>

                {loginError && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-xl backdrop-blur-sm">
                    <p className="text-red-800 font-medium">{loginError}</p>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-3">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full px-5 py-3.5 text-black border border-slate-300/50 rounded-2xl focus:border-slate-500 focus:ring-4 focus:ring-slate-200/50 outline-none bg-white font-medium text-sm shadow-sm hover:shadow-md transition-all placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-3">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-5 py-3.5 text-black border border-slate-300/50 rounded-2xl focus:border-slate-500 focus:ring-4 focus:ring-slate-200/50 outline-none bg-white font-medium text-sm shadow-sm hover:shadow-md transition-all placeholder-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-950 text-white py-3.5 rounded-2xl font-bold text-sm shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loginLoading ? "Signing in..." : "Sign In"}
                  </button>
                </form>
              </div>

              {/* Divider */}
              <div className="flex items-center">
                <div className="flex-1 h-px bg-gradient-to-r from-slate-700/30"></div>
                <span className="px-6 text-xs text-slate-500 font-bold uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-gradient-to-l from-slate-700/30"></div>
              </div>

              {/* Registration Form */}
              <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/60">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">New to Precia</h2>
                  <p className="text-slate-600 text-center text-lg">Create Your Store Now</p>
                </div>

                {regError && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-xl backdrop-blur-sm">
                    <p className="text-red-800 font-medium">{regError}</p>
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={regForm.name}
                        onChange={(e) => setRegForm({...regForm, name: e.target.value})}
                        placeholder="John Doe"
                        required
                        className="w-full px-4 py-2.5 text-black border border-slate-300/50 rounded-xl focus:border-slate-500 focus:ring-3 focus:ring-slate-200/50 outline-none bg-white text-sm font-medium shadow-sm hover:shadow-md transition-all placeholder-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Vendor *
                      </label>
                      <input
                        type="text"
                        value={regForm.vendorName}
                        onChange={(e) => setRegForm({...regForm, vendorName: e.target.value})}
                        placeholder="ABC Store"
                        required
                        className="w-full px-4 py-2.5 text-black border border-slate-300/50 rounded-xl focus:border-slate-500 focus:ring-3 focus:ring-slate-200/50 outline-none bg-white text-sm font-medium shadow-sm hover:shadow-md transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={regForm.email}
                      onChange={(e) => setRegForm({...regForm, email: e.target.value})}
                      placeholder="admin@precia.com"
                      required
                      className="w-full px-4 py-2.5 text-black border border-slate-300/50 rounded-xl focus:border-slate-500 focus:ring-3 focus:ring-slate-200/50 outline-none bg-white text-sm font-medium shadow-sm hover:shadow-md transition-all placeholder-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Mobile *
                      </label>
                      <input
                        type="tel"
                        value={regForm.mobile}
                        onChange={(e) => setRegForm({...regForm, mobile: e.target.value})}
                        placeholder="9876543210"
                        required
                        className="w-full px-4 py-2.5 text-black border border-slate-300/50 rounded-xl focus:border-slate-500 focus:ring-3 focus:ring-slate-200/50 outline-none bg-white text-sm font-medium shadow-sm hover:shadow-md transition-all placeholder-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Location *
                      </label>
                      <input
                        type="text"
                        value={regForm.location}
                        onChange={(e) => setRegForm({...regForm, location: e.target.value})}
                        placeholder="Mumbai, Maharashtra"
                        required
                        className="w-full px-4 py-2.5 text-black border border-slate-300/50 rounded-xl focus:border-slate-500 focus:ring-3 focus:ring-slate-200/50 outline-none bg-white text-sm font-medium shadow-sm hover:shadow-md transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={regForm.password}
                        onChange={(e) => setRegForm({...regForm, password: e.target.value})}
                        placeholder="••••••••"
                        required
                        className="w-full px-4 py-2.5 text-black border border-slate-300/50 rounded-xl focus:border-slate-500 focus:ring-3 focus:ring-slate-200/50 outline-none bg-white text-sm font-medium shadow-sm hover:shadow-md transition-all placeholder-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Confirm *
                      </label>
                      <input
                        type="password"
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm({...regForm, confirmPassword: e.target.value})}
                        placeholder="••••••••"
                        required
                        className="w-full px-4 py-2.5 text-black border border-slate-300/50 rounded-xl focus:border-slate-500 focus:ring-3 focus:ring-slate-200/50 outline-none bg-white text-sm font-medium shadow-sm hover:shadow-md transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-teal-600 hover:to-emerald-600 text-white py-3 rounded-xl font-bold text-sm shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {regLoading ? "Creating..." : "Create Store"}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-200 text-center text-xs">
                  <p className="text-slate-500 mb-1">Already have account?</p>
                  <p className="font-semibold text-slate-800">Use login form above</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

