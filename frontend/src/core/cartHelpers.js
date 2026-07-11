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
    cart.push({
      ...item,
      count: 1,
    });

    // Remove duplicates
    cart = Array.from(new Set(cart.map((p) => p._id))).map((id) => {
      return cart.find((p) => p._id === id);
    });

    localStorage.setItem(key, JSON.stringify(cart));
    next();
  }
};

export const itemTotal = () => {
  const key = getCartKey();
  if (typeof window !== 'undefined') {
    if (localStorage.getItem(key)) {
      return JSON.parse(localStorage.getItem(key)).length;
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
  }
  return cart;
};

export const emptyCart = (next) => {
  const key = getCartKey();
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
    next();
  }
};
