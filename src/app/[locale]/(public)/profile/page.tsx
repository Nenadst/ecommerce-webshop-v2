'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { User, Mail, Shield, Package, Settings } from 'lucide-react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client';
import { UPDATE_USER_MUTATION } from '@/shared/graphql/mutations/auth.mutations';
import toast from 'react-hot-toast';
import OrdersTab from '@/features/profile/components/OrdersTab';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isHydrated, user, login } = useAuth();
  const t = useTranslations('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER_MUTATION);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'orders', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/');
    }
  }, [isHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">{t('redirecting')}</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      const { data } = await updateUser({
        variables: { id: user.id, input: { name, email } },
      });
      if (data?.updateUser) {
        login(data.updateUser.token, data.updateUser.user);
        toast.success(t('profileUpdated'));
        setIsEditing(false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t('failedUpdateProfile');
      toast.error(message);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return 'U';
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/profile?tab=${tab}`, { scroll: false });
  };

  const tabs = [
    { id: 'profile', label: t('profileTab'), icon: User },
    { id: 'orders', label: t('ordersTab'), icon: Package },
    { id: 'settings', label: t('settingsTab'), icon: Settings },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-6 py-5">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-lg shadow-amber-500/30">
              {getInitials(user?.name, user?.email)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{user?.name || t('myAccount')}</h1>
              <p className="text-slate-400 text-sm">{user?.email}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-500'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        {/* Profile tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {/* Card header */}
              <div className="bg-slate-900 px-8 py-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-amber-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-amber-500/30 flex-shrink-0">
                    {getInitials(user?.name, user?.email)}
                  </div>
                  <div>
                    <h2 className="text-white text-2xl font-bold mb-1">
                      {user?.name || t('userProfile')}
                    </h2>
                    <p className="text-slate-400 text-sm">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900">{t('accountInformation')}</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      {t('editProfile')}
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {t('fullName')}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                        placeholder={t('namePlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {t('emailAddress')}
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                        placeholder={t('emailPlaceholder')}
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={updateLoading}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updateLoading ? t('saving') : t('saveChanges')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setName(user?.name || '');
                          setEmail(user?.email || '');
                        }}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-5">
                    {[
                      {
                        icon: User,
                        label: t('name'),
                        value: user?.name || t('notProvided'),
                      },
                      { icon: Mail, label: t('email'), value: user?.email },
                    ].map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Icon className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-slate-400 font-medium mb-0.5">{label}</div>
                          <div className="text-slate-900 font-semibold truncate">{value}</div>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Shield className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-medium mb-0.5">{t('role')}</div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            user?.role === 'admin'
                              ? 'bg-violet-100 text-violet-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {user?.role === 'admin' ? t('administrator') : t('user')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders tab */}
        {activeTab === 'orders' && <OrdersTab />}

        {/* Settings tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-2xl border border-slate-100 p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6">{t('accountSettings')}</h2>
              <div className="space-y-3">
                <button className="w-full text-left px-5 py-4 border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm rounded-xl transition-all group">
                  <div className="font-semibold text-slate-800 group-hover:text-slate-900 text-sm">
                    {t('changePassword')}
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">{t('changePasswordDesc')}</p>
                </button>
                <button className="w-full text-left px-5 py-4 border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm rounded-xl transition-all group">
                  <div className="font-semibold text-slate-800 group-hover:text-slate-900 text-sm">
                    {t('notificationPreferences')}
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {t('notificationPreferencesDesc')}
                  </p>
                </button>
                <button className="w-full text-left px-5 py-4 border border-red-100 bg-red-50/50 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all group">
                  <div className="font-semibold text-red-500 group-hover:text-red-600 text-sm">
                    {t('deleteAccount')}
                  </div>
                  <p className="text-red-400 text-xs mt-0.5">{t('deleteAccountDesc')}</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-slate-400">Loading...</div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
