export const apiKeys = {
  users: "/users",
  user: (id: string) => `/users/${id}`,
  leads: "/leads",
  lead: (id: string) => `/leads/${id}`,
  categories: "/categories",
  blogs: "/blogs",
  creditPackages: "/credit-packages",
  transactions: "/transactions",
  notifications: "/notifications",
  profile: "/profile",
  faqs: "/faqs",
  disclaimers: "/disclaimers",
} as const;
