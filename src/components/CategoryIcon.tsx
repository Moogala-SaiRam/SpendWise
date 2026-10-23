import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Car,
  ShoppingBag,
  Zap,
  Film,
  HeartPulse,
  GraduationCap,
  Sparkles,
  MoreHorizontal,
  Smartphone,
  CreditCard,
  Banknote,
  Building,
  Wallet,
} from 'lucide-react';
import { CATEGORIES } from '../constants/categories';

interface CategoryIconProps {
  categoryId?: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ categoryId, className = 'w-4 h-4', size }) => {
  const category = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];

  switch (category.icon) {
    case 'Utensils':
      return <Utensils className={className} size={size} />;
    case 'ShoppingCart':
      return <ShoppingCart className={className} size={size} />;
    case 'Car':
      return <Car className={className} size={size} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} size={size} />;
    case 'Zap':
      return <Zap className={className} size={size} />;
    case 'Film':
      return <Film className={className} size={size} />;
    case 'HeartPulse':
      return <HeartPulse className={className} size={size} />;
    case 'GraduationCap':
      return <GraduationCap className={className} size={size} />;
    case 'Sparkles':
      return <Sparkles className={className} size={size} />;
    default:
      return <MoreHorizontal className={className} size={size} />;
  }
};

export const PaymentMethodIcon: React.FC<{ method: string; className?: string }> = ({ method, className = 'w-3.5 h-3.5' }) => {
  switch (method) {
    case 'upi':
      return <Smartphone className={className} />;
    case 'card':
      return <CreditCard className={className} />;
    case 'cash':
      return <Banknote className={className} />;
    case 'bank_transfer':
      return <Building className={className} />;
    default:
      return <Wallet className={className} />;
  }
};
