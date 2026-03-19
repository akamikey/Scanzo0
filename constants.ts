import { Review, StatData } from './types';

export const RECENT_REVIEWS: Review[] = [
  {
    id: '1',
    owner_id: 'mock_owner_1',
    customer_name: 'Alice Johnson',
    rating: 5,
    comment: 'Absolutely love the service! Highly recommended.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    owner_id: 'mock_owner_1',
    customer_name: 'Mark Smith',
    rating: 4,
    comment: 'Great experience, but waiting time was a bit long.',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: '3',
    owner_id: 'mock_owner_1',
    customer_name: 'Sarah Lee',
    rating: 5,
    comment: 'The team went above and beyond.',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
];

export const MOCK_STATS: StatData[] = [
  { name: 'Total Reviews', value: 1248, change: 12.5 },
  { name: 'Avg. Rating', value: 4.8, change: 0.2 },
];