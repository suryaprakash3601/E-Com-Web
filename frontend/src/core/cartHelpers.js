const getUserId = () => {
  if (typeof window !== 'undefined') {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      try {
        const auth = JSON.parse(jwt);
        if (auth && auth.user && auth.user._id) {
          return auth.user._id;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
  return null;
};

export const getCartKey = () => {
  const userId = getUserId();
  return userId ? `cart_${userId}` : 'cart';
};

const dispatchCartEvent = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cartUpdate'));
  }
};

export const mergeCartAfterLogin = (userId) => {
  if (typeof window !== 'undefined') {
    const guestCart = JSON.parse(localStorage.getItem('cart')) || [];
    if (guestCart.length > 0) {
      const userCartKey = `cart_${userId}`;
      let userCart = JSON.parse(localStorage.getItem(userCartKey)) || [];

      // Merge items, matching by product id
      let mergedCart = [...userCart, ...guestCart];
      mergedCart = Array.from(new Set(mergedCart.map((p) => p._id))).map((id) => {
        return mergedCart.find((p) => p._id === id);
      });

      localStorage.setItem(userCartKey, JSON.stringify(mergedCart));
      localStorage.removeItem('cart');
      dispatchCartEvent();
    }
  }
};

export const addItem = (item = {}, count = 0, next = (f) => f) => {
  if (typeof count === 'function') {
    next = count;
    count = 0;
  }

  let cart = [];
  const key = getCartKey();
  if (typeof window !== 'undefined') {
    if (localStorage.getItem(key)) {
      cart = JSON.parse(localStorage.getItem(key));
    }
    
    // Check if item already exists, increment count if so
    const existingIndex = cart.findIndex((p) => p._id === item._id);
    if (existingIndex !== -1) {
      cart[existingIndex].count = (cart[existingIndex].count || 0) + 1;
    } else {
      cart.push({
        ...item,
        count: 1,
      });
    }

    localStorage.setItem(key, JSON.stringify(cart));
    dispatchCartEvent();
    next();
  }
};

export const itemTotal = () => {
  const key = getCartKey();
  if (typeof window !== 'undefined') {
    if (localStorage.getItem(key)) {
      try {
        const cart = JSON.parse(localStorage.getItem(key)) || [];
        return cart.reduce((total, item) => total + (parseInt(item.count, 10) || 0), 0);
      } catch (e) {
        console.error(e);
      }
    }
  }
  return 0;
};

export const getCart = () => {
  const key = getCartKey();
  if (typeof window !== 'undefined') {
    if (localStorage.getItem(key)) {
      return JSON.parse(localStorage.getItem(key));
    }
  }
  return [];
};

export const updateItem = (productId, count) => {
  let cart = [];
  const key = getCartKey();
  if (typeof window !== 'undefined') {
    if (localStorage.getItem(key)) {
      cart = JSON.parse(localStorage.getItem(key));
    }

    cart = cart.map((product) => {
      if (product._id === productId) {
        return {
          ...product,
          count: parseInt(count, 10),
        };
      }
      return product;
    });

    localStorage.setItem(key, JSON.stringify(cart));
    dispatchCartEvent();
  }
};

export const removeItem = (productId) => {
  let cart = [];
  const key = getCartKey();
  if (typeof window !== 'undefined') {
    if (localStorage.getItem(key)) {
      cart = JSON.parse(localStorage.getItem(key));
    }

    cart = cart.filter((product) => product._id !== productId);

    localStorage.setItem(key, JSON.stringify(cart));
    dispatchCartEvent();
  }
  return cart;
};

export const emptyCart = (next) => {
  const key = getCartKey();
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
    dispatchCartEvent();
    next();
  }
};
