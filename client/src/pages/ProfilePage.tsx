import React, { useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/services';
import { User, Mail, Camera, Lock, Save, Shield, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (user?.avatar) return user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&bold=true&size=128`;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be under 5MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (password) {
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('bio', bio.trim());
      if (password) formData.append('password', password);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await authService.updateProfile(formData);
      updateUser(res.data);
      setPassword('');
      setConfirmPassword('');
      setAvatarFile(null);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark-50">Profile & Settings</h1>
          <p className="text-dark-400 mt-1">Manage your account information and preferences</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Avatar and quick summary card */}
          <div className="card p-6 flex flex-col items-center text-center">
            <div className="relative group mb-4">
              <img
                src={getAvatarUrl()}
                alt={user?.name}
                className="w-28 h-28 rounded-2xl object-cover ring-4 ring-dark-700 shadow-xl"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-dark-950/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer backdrop-blur-xs"
              >
                <Camera size={22} className="mb-1" />
                <span className="text-xs font-semibold">Change</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <h2 className="text-lg font-bold text-dark-100">{user?.name}</h2>
            <p className="text-xs text-dark-400 mt-0.5">{user?.email}</p>

            {user?.bio && (
              <p className="text-xs text-dark-300 italic mt-3 bg-dark-800/80 p-3 rounded-xl border border-dark-700/50 w-full text-left">
                "{user.bio}"
              </p>
            )}

            <div className="w-full border-t border-dark-700/50 mt-6 pt-4 space-y-2 text-left text-xs text-dark-400">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-primary-400" />
                <span>Verified Account</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" />
                <span>Real-time Sync Active</span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="card p-6 md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <User size={13} />
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Mail size={13} />
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input bg-dark-800/50 opacity-70 cursor-not-allowed text-dark-400"
                />
                <span className="text-[11px] text-dark-500 mt-1 block">Email address cannot be changed</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-1.5">
                  Bio / Role
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input min-h-[80px] resize-none"
                  placeholder="e.g. Senior Frontend Engineer / Product Lead"
                  maxLength={200}
                />
                <span className="text-[11px] text-dark-500 mt-1 block text-right">
                  {bio.length}/200
                </span>
              </div>

              <div className="border-t border-dark-700/50 pt-5 space-y-4">
                <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
                  <Lock size={15} />
                  Change Password (Optional)
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input"
                      placeholder="Min. 6 characters"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input"
                      placeholder="Repeat password"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center gap-2 px-6"
                >
                  <Save size={16} />
                  {saving ? 'Saving changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
