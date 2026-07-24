
import axios from 'axios';
import { auth } from './firebase';

const API_BASE = process.env.REACT_APP_API_BASE || 'https://grocygo.onrender.com/api';
const API_KEY = process.env.REACT_APP_API_KEY;

// AI Suggested Recipes API (returns matched/missing ingredients)
export const getSuggestedRecipes = async (ingredients, course = '', diet = '') => {
  // ingredients: array of strings
  const res = await axios.post(`${API_BASE}/ai/recipe-suggestions`, { ingredients, course, diet }, {
    headers: { 'x-api-key': API_KEY }
  });
  // The Node.js backend returns an array directly, not { suggestions: [...] }
  return Array.isArray(res.data) ? res.data : [];
};
export const getMealSuggestions = async (inventory = [], diet = '') => {
  const token = await auth.currentUser?.getIdToken();
  const res = await axios.post(`${API_BASE}/ai/mealplan-suggestions`, { inventory, diet }, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
  return res.data;
};

// Suggestions API
export const getSuggestions = async (q = '') => {
  // No auth required
  return axios.get(`${API_BASE}/inventory/suggestions`, {
    params: { q },
    headers: { 'x-api-key': API_KEY }
  });
};


export const getInventory = async () => {
  const token = await auth.currentUser?.getIdToken();
  return axios.get(`${API_BASE}/inventory`, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};

export const addInventory = async (item) => {
  const token = await auth.currentUser?.getIdToken();
  return axios.post(`${API_BASE}/inventory`, item, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};

export const updateInventory = async (id, item) => {
  const token = await auth.currentUser?.getIdToken();
  return axios.put(`${API_BASE}/inventory/${id}`, item, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};

export const deleteInventory = async (id) => {
  const token = await auth.currentUser?.getIdToken();
  return axios.delete(`${API_BASE}/inventory/${id}`, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};

// Recipes API
export const getRecipes = async () => {
  const token = await auth.currentUser?.getIdToken();
  return axios.get(`${API_BASE}/recipes`, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};

export const addRecipe = async (recipe) => {
  const token = await auth.currentUser?.getIdToken();
  // Add course and diet if present
  const payload = { ...recipe };
  if (!payload.course) payload.course = '';
  if (!payload.diet) payload.diet = '';
  const res = await axios.post(`${API_BASE}/recipes`, payload, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
  return res.data;
};

export const updateRecipe = async (id, recipe) => {
  const token = await auth.currentUser?.getIdToken();
  return axios.put(`${API_BASE}/recipes/${id}`, recipe, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};

export const deleteRecipe = async (id) => {
  const token = await auth.currentUser?.getIdToken();
  return axios.delete(`${API_BASE}/recipes/${id}`, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};

// Meal Plans API
export const getMealPlans = async () => {
  const token = await auth.currentUser?.getIdToken();
  return axios.get(`${API_BASE}/meal-plans`, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};

export const fetchWeeklyMealPlans = async (startDate, endDate) => {
  const token = await auth.currentUser?.getIdToken();
  return axios.get(`${API_BASE}/meal-plans/weekly`, {
    params: { startDate, endDate },
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};

export const addMealPlan = async (plan) => {
  const token = await auth.currentUser?.getIdToken();
  return axios.post(`${API_BASE}/meal-plans`, plan, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};

export const updateMealPlan = async (id, plan) => {
  const token = await auth.currentUser?.getIdToken();
  return axios.put(`${API_BASE}/meal-plans/${id}`, plan, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};

export const deleteMealPlan = async (id) => {
  const token = await auth.currentUser?.getIdToken();
  return axios.delete(`${API_BASE}/meal-plans/${id}`, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};

// Shopping Lists API
export const getShoppingLists = async () => {
  const token = await auth.currentUser?.getIdToken();
  return axios.get(`${API_BASE}/shopping`, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};

export const addShoppingList = async (list) => {
  const token = await auth.currentUser?.getIdToken();
  return axios.post(`${API_BASE}/shopping`, list, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};

export const updateShoppingList = async (id, list) => {
  const token = await auth.currentUser?.getIdToken();
  return axios.put(`${API_BASE}/shopping/${id}`, list, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};

export const deleteShoppingList = async (id) => {
  const token = await auth.currentUser?.getIdToken();
  return axios.delete(`${API_BASE}/shopping/${id}`, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};

// Notifications API
export const getNotifications = async () => {
  const token = await auth.currentUser?.getIdToken();
  return axios.get(`${API_BASE}/notifications`, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};

export const addNotification = async (notification) => {
  const token = await auth.currentUser?.getIdToken();
  return axios.post(`${API_BASE}/notifications`, notification, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};

export const markNotificationRead = async (id) => {
  const token = await auth.currentUser?.getIdToken();
  return axios.put(`${API_BASE}/notifications/${id}/read`, {}, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};

export const deleteNotification = async (id) => {
  const token = await auth.currentUser?.getIdToken();
  return axios.delete(`${API_BASE}/notifications/${id}`, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};

// Analytics API
export const getAnalyticsStats = async () => {
  const token = await auth.currentUser?.getIdToken();
  return axios.get(`${API_BASE}/analytics/stats`, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY }
  });
};


// Use ingredients for meal plan (decrease inventory and optionally delete plan)
export const useIngredients = async ({ ingredients, planId }) => {
  const token = await auth.currentUser?.getIdToken();
  return axios.post(`${API_BASE}/meal-plans/use-ingredients`, { ingredients, planId }, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-api-key': API_KEY
    }
  });
};
