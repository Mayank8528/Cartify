// Use REACT_APP_API_URL to point to the backend in production
// Leave empty to rely on proxy or relative paths
export const BASE_URL = process.env.REACT_APP_API_URL || '';
export const PRODUCTS_URL = '/api/products';
export const USERS_URL = '/api/users';
export const ORDERS_URL = '/api/orders';
export const PAYPAL_URL = '/api/config/paypal';
