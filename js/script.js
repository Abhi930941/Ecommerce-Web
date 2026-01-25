// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize cart count
  updateCartCount();
  
  // Initialize scroll to top button
  initScrollToTop();
  
  // Initialize product filtering if on products page
  if (document.getElementById('productList')) {
    initProductFiltering();
  }
  
  // Initialize product gallery if on product view page
  if (document.getElementById('productGallery')) {
    initProductGallery();
  }
  
  // Initialize cart functionality if on cart page
  if (document.getElementById('cartItems')) {
    initCart();
  }
  
  // Initialize checkout form if on checkout page
  if (document.getElementById('checkoutForm')) {
    initCheckout();
  }
});

// Cart functionality
let cart = JSON.parse(localStorage.getItem('shopEaseCart')) || [];

// Add to cart and redirect function
function addToCartAndRedirect(productId, productName, price, image) {
  // Get cart from localStorage
  let cart = JSON.parse(localStorage.getItem('shopEaseCart')) || [];
  
  // Add product to cart with default size
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      name: productName,
      price: price,
      image: image,
      size: 'M',
      quantity: 1
    });
  }
  
  // Save to localStorage
  localStorage.setItem('shopEaseCart', JSON.stringify(cart));
  
  // Update cart count
  updateCartCount();
  
  // Redirect to cart page
  window.location.href = 'cart.html';
}

function addToCart(productId, productName, price, image, size, quantity = 1) {
  const existingItem = cart.find(item => 
    item.id === productId && item.size === size
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: productId,
      name: productName,
      price: price,
      image: image,
      size: size,
      quantity: quantity
    });
  }
  
  localStorage.setItem('shopEaseCart', JSON.stringify(cart));
  updateCartCount();
  
  // Show success notification
  showNotification('Product added to cart!', 'success');
}

function removeFromCart(productId, size) {
  cart = cart.filter(item => !(item.id === productId && item.size === size));
  localStorage.setItem('shopEaseCart', JSON.stringify(cart));
  updateCartCount();
  
  if (document.getElementById('cartItems')) {
    renderCartItems();
  }
}

function updateCartCount() {
  const cartCount = document.getElementById('cartCount');
  if (cartCount) {
    const cartData = JSON.parse(localStorage.getItem('shopEaseCart')) || [];
    const totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
  }
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `alert alert-${type === 'success' ? 'success' : 'info'} alert-dismissible fade show`;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    border-radius: 10px;
    border: none;
  `;
  
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 3000);
}

// Scroll to top functionality
function initScrollToTop() {
  const scrollBtn = document.getElementById('scrollTopBtn');
  
  if (scrollBtn) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        scrollBtn.classList.add('show');
      } else {
        scrollBtn.classList.remove('show');
      }
    });
    
    scrollBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

// Product filtering functionality
function initProductFiltering() {
  const categoryFilters = document.querySelectorAll('.category-filter');
  const priceRange = document.getElementById('priceRange');
  const priceValue = document.getElementById('priceValue');
  const productList = document.getElementById('productList');
  const clearFiltersBtn = document.getElementById('clearFilters');
  
  if (priceRange && priceValue) {
    priceValue.textContent = priceRange.value;
    
    priceRange.addEventListener('input', function() {
      priceValue.textContent = this.value;
      filterProducts();
    });
  }
  
  categoryFilters.forEach(filter => {
    filter.addEventListener('change', filterProducts);
  });
  
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function() {
      categoryFilters.forEach(filter => {
        filter.checked = false;
      });
      
      if (priceRange) {
        priceRange.value = 10000;
        priceValue.textContent = '10000';
      }
      
      filterProducts();
    });
  }
  
  function filterProducts() {
    const selectedCategories = Array.from(categoryFilters)
      .filter(filter => filter.checked)
      .map(filter => filter.value);
    
    const maxPrice = priceRange ? parseInt(priceRange.value) : 10000;
    
    const products = productList.querySelectorAll('.product-card');
    
    products.forEach(product => {
      const productCategory = product.dataset.category;
      const productPrice = parseInt(product.dataset.price);
      
      const categoryMatch = selectedCategories.length === 0 || 
                           selectedCategories.includes(productCategory);
      const priceMatch = productPrice <= maxPrice;
      
      if (categoryMatch && priceMatch) {
        product.style.display = 'block';
      } else {
        product.style.display = 'none';
      }
    });
  }
}

// Product gallery functionality
function initProductGallery() {
  const mainImage = document.getElementById('mainProductImage');
  const thumbnails = document.querySelectorAll('.product-thumbnail');
  
  if (thumbnails.length > 0) {
    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', function() {
        const newSrc = this.getAttribute('data-full');
        if (mainImage && newSrc) {
          mainImage.src = newSrc;
        }
        
        // Update active thumbnail
        thumbnails.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }
}

// Cart page functionality
function initCart() {
  renderCartItems();
  
  const updateQuantityBtns = document.querySelectorAll('.update-quantity');
  updateQuantityBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const productId = this.dataset.id;
      const size = this.dataset.size;
      const action = this.dataset.action;
      
      const item = cart.find(item => item.id === productId && item.size === size);
      
      if (item) {
        if (action === 'increase') {
          item.quantity += 1;
        } else if (action === 'decrease' && item.quantity > 1) {
          item.quantity -= 1;
        }
        
        localStorage.setItem('shopEaseCart', JSON.stringify(cart));
        renderCartItems();
        updateCartCount();
      }
    });
  });
  
  const removeItemBtns = document.querySelectorAll('.remove-item');
  removeItemBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const productId = this.dataset.id;
      const size = this.dataset.size;
      
      removeFromCart(productId, size);
    });
  });
}

function renderCartItems() {
  const cartItemsContainer = document.getElementById('cartItems');
  const cartTotalElement = document.getElementById('cartTotal');
  const cartSubtotalElement = document.getElementById('cartSubtotal');
  const shippingElement = document.getElementById('shipping');
  
  if (!cartItemsContainer) return;
  
  // Get cart from localStorage
  const cartData = JSON.parse(localStorage.getItem('shopEaseCart')) || [];
  
  if (cartData.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="text-center py-5">
        <i class="fas fa-shopping-cart fa-3x mb-3 text-muted"></i>
        <h4 class="text-muted">Your cart is empty</h4>
        <p class="text-muted">Add some products to your cart</p>
        <a href="products.html" class="btn btn-primary mt-3">Continue Shopping</a>
      </div>
    `;
    
    if (cartTotalElement) cartTotalElement.textContent = '0';
    if (cartSubtotalElement) cartSubtotalElement.textContent = '0';
    if (shippingElement) shippingElement.textContent = '0';
    
    return;
  }
  
  let subtotal = 0;
  
  cartItemsContainer.innerHTML = cartData.map(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    return `
      <div class="cart-item">
        <div class="row align-items-center">
          <div class="col-md-2">
            <img src="${item.image}" alt="${item.name}" class="img-fluid rounded">
          </div>
          <div class="col-md-4">
            <h6 class="mb-1">${item.name}</h6>
            <p class="text-muted mb-0">Size: ${item.size}</p>
          </div>
          <div class="col-md-2">
            <p class="mb-0 fw-bold">₹${item.price}</p>
          </div>
          <div class="col-md-2">
            <div class="quantity-selector d-flex align-items-center">
              <button class="btn btn-sm btn-outline-secondary update-quantity" data-id="${item.id}" data-size="${item.size}" data-action="decrease">-</button>
              <span class="mx-2">${item.quantity}</span>
              <button class="btn btn-sm btn-outline-secondary update-quantity" data-id="${item.id}" data-size="${item.size}" data-action="increase">+</button>
            </div>
          </div>
          <div class="col-md-2">
            <p class="mb-0 fw-bold">₹${itemTotal}</p>
            <button class="btn btn-sm btn-outline-danger remove-item mt-1" data-id="${item.id}" data-size="${item.size}">Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  const shipping = subtotal > 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.09); // 9% tax
  const total = subtotal + shipping + tax;
  
  if (cartSubtotalElement) cartSubtotalElement.textContent = subtotal;
  if (shippingElement) shippingElement.textContent = shipping;
  if (cartTotalElement) cartTotalElement.textContent = total;
  
  // Re-attach event listeners to new buttons
  document.querySelectorAll('.update-quantity').forEach(btn => {
    btn.addEventListener('click', function() {
      const productId = this.dataset.id;
      const size = this.dataset.size;
      const action = this.dataset.action;
      
      const cartData = JSON.parse(localStorage.getItem('shopEaseCart')) || [];
      const item = cartData.find(item => item.id === productId && item.size === size);
      
      if (item) {
        if (action === 'increase') {
          item.quantity += 1;
        } else if (action === 'decrease' && item.quantity > 1) {
          item.quantity -= 1;
        }
        
        localStorage.setItem('shopEaseCart', JSON.stringify(cartData));
        renderCartItems();
        updateCartCount();
      }
    });
  });
  
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', function() {
      const productId = this.dataset.id;
      const size = this.dataset.size;
      
      let cartData = JSON.parse(localStorage.getItem('shopEaseCart')) || [];
      cartData = cartData.filter(item => !(item.id === productId && item.size === size));
      localStorage.setItem('shopEaseCart', JSON.stringify(cartData));
      
      renderCartItems();
      updateCartCount();
    });
  });
}

// Checkout functionality
function initCheckout() {
  const checkoutForm = document.getElementById('checkoutForm');
  
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Simulate form processing
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.innerHTML = '<span class="loading"></span> Processing...';
      submitBtn.disabled = true;
      
      setTimeout(() => {
        // Clear cart
        localStorage.setItem('shopEaseCart', JSON.stringify([]));
        updateCartCount();
        
        // Redirect to confirmation page
        window.location.href = 'confirmation.html';
      }, 2000);
    });
  }
  
  // Populate order summary
  const orderItemsContainer = document.getElementById('orderItems');
  const orderSubtotalElement = document.getElementById('orderSubtotal');
  const orderShippingElement = document.getElementById('orderShipping');
  const orderTotalElement = document.getElementById('orderTotal');
  
  const cartData = JSON.parse(localStorage.getItem('shopEaseCart')) || [];
  
  if (orderItemsContainer && cartData.length > 0) {
    let subtotal = 0;
    
    orderItemsContainer.innerHTML = cartData.map(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      return `
        <div class="d-flex justify-content-between mb-2">
          <div>
            <span class="fw-medium">${item.name}</span>
            <small class="text-muted d-block">Size: ${item.size} × ${item.quantity}</small>
          </div>
          <span>₹${itemTotal}</span>
        </div>
      `;
    }).join('');
    
    const shipping = subtotal > 999 ? 0 : 99;
    const tax = Math.round(subtotal * 0.09);
    const total = subtotal + shipping + tax;
    
    if (orderSubtotalElement) orderSubtotalElement.textContent = subtotal;
    if (orderShippingElement) orderShippingElement.textContent = shipping;
    if (orderTotalElement) orderTotalElement.textContent = total;
  }
}

// Search functionality
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  
  if (searchInput && searchResults) {
    searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase().trim();
      
      if (query.length < 2) {
        searchResults.style.display = 'none';
        return;
      }
      
      // Simulate search results
      const results = [
        { name: 'Men\'s Formal Shirt', category: 'Men', price: '₹1,299', image: 'images/mens-shirt.jpg', url: 'product-view.html' },
        { name: 'Women\'s Summer Dress', category: 'Women', price: '₹2,499', image: 'images/womens-dress.jpg', url: 'product-view.html' },
        { name: 'Sports Running Shoes', category: 'Footwear', price: '₹3,299', image: 'images/sports-shoes.jpg', url: 'product-view.html' }
      ].filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.category.toLowerCase().includes(query)
      );
      
      if (results.length > 0) {
        searchResults.innerHTML = results.map(item => `
          <a href="${item.url}" class="search-result-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="search-result-info">
              <h6>${item.name}</h6>
              <p class="text-muted mb-0">${item.category}</p>
              <p class="fw-bold mb-0">${item.price}</p>
            </div>
          </a>
        `).join('');
        searchResults.style.display = 'block';
      } else {
        searchResults.innerHTML = '<div class="p-3 text-center text-muted">No products found</div>';
        searchResults.style.display = 'block';
      }
    });
    
    // Hide results when clicking outside
    document.addEventListener('click', function(e) {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.style.display = 'none';
      }
    });
  }
}

// Initialize search if search input exists
if (document.getElementById('searchInput')) {
  initSearch();
}