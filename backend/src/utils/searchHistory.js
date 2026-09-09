const getKey = (userId) => `search_history_${userId}`;

export const getSearchHistory = (userId) => {
  try {
    const data = localStorage.getItem(getKey(userId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addToSearchHistory = (userId, query) => {
  if (!query.trim()) return;
  const history = getSearchHistory(userId);
  const filtered = history.filter((q) => q.toLowerCase() !== query.toLowerCase());
  const updated = [query, ...filtered].slice(0, 8);
  localStorage.setItem(getKey(userId), JSON.stringify(updated));
};

export const removeFromSearchHistory = (userId, query) => {
  const history = getSearchHistory(userId);
  const updated = history.filter((q) => q !== query);
  localStorage.setItem(getKey(userId), JSON.stringify(updated));
};

export const clearSearchHistory = (userId) => {
  localStorage.removeItem(getKey(userId));
};