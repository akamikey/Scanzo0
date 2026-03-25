import React from 'react';

export interface Review {
  id: string;
  owner_id?: string;
  business_id?: string;
  customer_name?: string;
  name?: string;
  rating: number;
  comment?: string;
  message?: string;
  feedback?: string;
  created_at: string;
  platform?: string;
  is_valid?: boolean;
  rejection_reason?: string | null;
  reply?: string;
  replied_at?: string;
}

export interface StatData {
  name: string;
  value: number;
  change: number; // percentage
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}