'use client';

import React, { useState } from 'react';
import { CartIcon, HeartIcon, UserIcon } from '../icons';
import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import UserMenu from '../user/UserMenu';
import { useFavorites } from '../../hooks/useFavorites';
import { useCart } from '../../contexts/CartContext';
import { useCartDrawer } from '../../contexts/CartDrawerContext';
import { Package } from 'lucide-react';
import { AuthModal } from '../modals/AuthModal';
import { useTranslations } from 'next-intl';

const CartSection = () => {
  const t = useTranslations('header');
  const tAuth = useTranslations('auth');
  const { isAuthenticated, isAdmin } = useAuth();
  const pathname = usePathname();
  const { favorites, mounted } = useFavorites();
  const { itemCount, mounted: cartMounted } = useCart();
  const { openDrawer } = useCartDrawer();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const openAuthModal = (message: string) => {
    setModalMessage(message);
    setShowAuthModal(true);
  };

  return (
    <>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message={modalMessage}
      />
      <div className="ml-auto h-10 hidden md:hidden lg:flex">
        {isAdmin && (
          <Link
            href="/admin"
            className="w-32 h-10 justify-center items-center flex text-white text-sm font-normal mr-4 hover:bg-amber-600 cursor-pointer rounded-lg"
          >
            {t('adminPanel')}
          </Link>
        )}

        {!isAuthenticated && (
          <Link
            href={`/login?returnUrl=${encodeURIComponent(pathname)}`}
            className="w-28 h-10 justify-center items-center gap-3 flex hover:bg-amber-600 cursor-pointer rounded-lg"
          >
            <div className="justify-center items-center flex">
              <UserIcon />
            </div>
            <div className="text-white text-sm font-normal">{t('login')}</div>
          </Link>
        )}
        {isAuthenticated ? (
          <Link
            href="/wishlist"
            className="w-32 h-10 justify-center items-center gap-3 flex hover:bg-amber-600 cursor-pointer rounded-lg"
          >
            <div className="justify-center items-center flex">
              <HeartIcon />
              <div className="w-3.5 h-3.5 bg-amber-500 rounded-full flex-col justify-center items-center gap-2 inline-flex">
                <div className="text-white text-xs font-normal">
                  {mounted ? favorites.length : 0}
                </div>
              </div>
            </div>
            <div className="text-white text-sm font-normal">{t('wishlist')}</div>
          </Link>
        ) : (
          <button
            onClick={() => openAuthModal(tAuth('wishlistAuthMessage'))}
            className="w-32 h-10 justify-center items-center gap-3 flex hover:bg-amber-600 cursor-pointer rounded-lg"
          >
            <div className="justify-center items-center flex">
              <HeartIcon />
              <div className="w-3.5 h-3.5 bg-amber-500 rounded-full flex-col justify-center items-center gap-2 inline-flex">
                <div className="text-white text-xs font-normal">
                  {mounted ? favorites.length : 0}
                </div>
              </div>
            </div>
            <div className="text-white text-sm font-normal">{t('wishlist')}</div>
          </button>
        )}
        {isAuthenticated ? (
          <Link
            href="/profile?tab=orders"
            className="w-32 h-10 justify-center items-center gap-3 flex hover:bg-amber-600 cursor-pointer rounded-lg"
          >
            <div className="justify-center items-center flex">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="text-white text-sm font-normal">{t('orders')}</div>
          </Link>
        ) : (
          <button
            onClick={() => openAuthModal(t('ordersAuthMessage'))}
            className="w-32 h-10 justify-center items-center gap-3 flex hover:bg-amber-600 cursor-pointer rounded-lg"
          >
            <div className="justify-center items-center flex">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="text-white text-sm font-normal">{t('orders')}</div>
          </button>
        )}
        <button
          onClick={openDrawer}
          className="w-32 h-10 justify-center items-center gap-3 flex hover:bg-amber-600 cursor-pointer rounded-lg"
        >
          <div className="justify-center items-center flex">
            <CartIcon />
            <div className="w-3.5 h-3.5 bg-amber-500 rounded-full flex-col justify-center items-center gap-2 inline-flex">
              <div className="text-white text-xs font-normal">{cartMounted ? itemCount : 0}</div>
            </div>
          </div>
          <div className="text-white text-sm font-normal">{t('cart')}</div>
        </button>
        {isAuthenticated && (
          <div className="ml-4 flex items-center relative z-[100]">
            <UserMenu />
          </div>
        )}
      </div>
    </>
  );
};

export default CartSection;
