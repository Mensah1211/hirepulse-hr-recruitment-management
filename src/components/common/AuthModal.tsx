import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { X, KeyRound, Mail, Phone, User as UserIcon, Camera, Upload, Lock, CheckCircle2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "register";
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = "login" }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register" | "reset">(defaultMode);

  React.useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFileName, setAvatarFileName] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Invalid image file format. Please upload a JPEG, PNG, or WEBP photo.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile picture file size must not exceed 5MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
      setAvatarFileName(file.name);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login(email, password);
        onClose();
      } else if (mode === "register") {
        if (!avatarUrl) {
          setError("Profile picture is compulsory. Please upload your photo.");
          setIsSubmitting(false);
          return;
        }
        if (!name.trim()) {
          setError("Full name is compulsory.");
          setIsSubmitting(false);
          return;
        }
        if (!email.trim()) {
          setError("Email address is compulsory.");
          setIsSubmitting(false);
          return;
        }
        if (!phone.trim()) {
          setError("Phone number is compulsory.");
          setIsSubmitting(false);
          return;
        }
        if (!password) {
          setError("Password is compulsory.");
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters long.");
          setIsSubmitting(false);
          return;
        }
        if (!confirmPassword) {
          setError("Confirm password is compulsory.");
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match. Please verify your password entry.");
          setIsSubmitting(false);
          return;
        }

        await register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role: "applicant",
          avatarUrl,
          password
        });
        onClose();
      } else if (mode === "reset") {
        setSuccessMsg(`Password reset instructions have been sent to ${email}`);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              H
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">HirePulse Portal</h2>
              <p className="text-xs text-slate-500">Recruitment Management System</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-200 mb-5 text-sm">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); }}
              className={`pb-2.5 font-medium border-b-2 transition-colors px-4 ${
                mode === "login"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(null); }}
              className={`pb-2.5 font-medium border-b-2 transition-colors px-4 ${
                mode === "register"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Register Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-lg text-xs font-medium border border-rose-200">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-200">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                {/* Profile Picture Upload (Compulsory) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Profile Picture <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center shrink-0 shadow-xs">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-7 h-7 text-indigo-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg cursor-pointer transition-colors shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        {avatarUrl ? "Change Photo" : "Upload Photo"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                      {avatarUrl ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                            {avatarFileName || "photo_uploaded.jpg"}
                          </span>
                          <button
                            type="button"
                            onClick={() => { setAvatarUrl(""); setAvatarFileName(""); }}
                            className="text-[10px] font-semibold text-rose-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500">JPG, PNG or WEBP up to 5MB (Required)</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address {mode === "register" && <span className="text-rose-500">*</span>}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Passwords */}
            {mode !== "reset" && (
              <>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password {mode === "register" && <span className="text-rose-500">*</span>}
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => setMode("reset")}
                        className="text-[11px] text-indigo-600 hover:underline font-medium"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {mode === "register" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting
                ? "Processing..."
                : mode === "login"
                ? "Sign In"
                : mode === "register"
                ? "Create Account"
                : "Send Reset Link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

