import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, User, Loader2, CheckCircle } from 'lucide-react';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email format';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(fullName, email, password);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'AI-powered priority suggestions',
    'Smart task completion predictions',
    'Beautiful Kanban boards',
    'Real-time project analytics',
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side — animated gradient */}
      <div className="hidden lg:flex lg:w-1/2 animated-gradient relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float delay-300" />

        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <span className="text-4xl font-extrabold text-white tracking-tight">TaskFlow</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
            Join thousands of productive teams
          </h1>
          <p className="text-lg text-white/70 mb-8 leading-relaxed">
            Start managing tasks smarter with AI-powered insights and beautiful project boards.
          </p>

          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 animate-slide-in-left" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90 font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — register form */}
      <div className="w-full lg:w-1/2 bg-dark-bg flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Zap className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">TaskFlow</span>
          </div>

          <div className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Create your account</h2>
            <p className="text-text-secondary mb-8">Get started for free — no credit card needed</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
                  <input
                    id="register-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: '' })); }}
                    placeholder="John Doe"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-dark-bg border ${errors.fullName ? 'border-red-500' : 'border-dark-border'} text-text-primary placeholder-text-secondary/50 text-sm transition-all duration-200 focus:border-primary`}
                  />
                </div>
                {errors.fullName && <p className="mt-1.5 text-xs text-red-400">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                    placeholder="you@example.com"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-dark-bg border ${errors.email ? 'border-red-500' : 'border-dark-border'} text-text-primary placeholder-text-secondary/50 text-sm transition-all duration-200 focus:border-primary`}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-12 py-3 rounded-xl bg-dark-bg border ${errors.password ? 'border-red-500' : 'border-dark-border'} text-text-primary placeholder-text-secondary/50 text-sm transition-all duration-200 focus:border-primary`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
                  <input
                    id="register-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-dark-bg border ${errors.confirmPassword ? 'border-red-500' : 'border-dark-border'} text-text-primary placeholder-text-secondary/50 text-sm transition-all duration-200 focus:border-primary`}
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword}</p>}
              </div>

              {errors.general && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {errors.general}
                </div>
              )}

              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-text-secondary mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:text-primary-400 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
