// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const donateForm = document.getElementById('donateForm');
const requestForm = document.getElementById('requestForm');

// Base URL for API
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for API calls
async function makeRequest(url, method, body = null, token = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
        method,
        headers
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        // User is logged in
        const nav = document.querySelector('nav ul');
        if (nav) {
            nav.innerHTML = `
                <li><a href="index.html">Home</a></li>
                <li><a href="dashboard.html">Dashboard</a></li>
                <li><a href="donate.html">Donate Food</a></li>
                <li><a href="request.html">Request Food</a></li>
                <li><a href="#" id="logout">Logout</a></li>
            `;
            
            document.getElementById('logout').addEventListener('click', logout);
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Handle login
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const data = await makeRequest('/auth/login', 'POST', { email, password });
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            window.location.href = 'dashboard.html';
        } catch (error) {
            alert(error.message);
        }
    });
}

// Handle registration
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;
        
        try {
            const data = await makeRequest('/auth/register', 'POST', {
                name, email, password, role, address, phone
            });
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            window.location.href = 'dashboard.html';
        } catch (error) {
            alert(error.message);
        }
    });
}

// Handle food donation
if (donateForm) {
    donateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        
        const foodName = document.getElementById('foodName').value;
        const quantity = document.getElementById('quantity').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const description = document.getElementById('description').value;
        const pickupAddress = document.getElementById('pickupAddress').value;
        
        try {
            await makeRequest('/donations', 'POST', {
                foodName, quantity, expiryDate, description, pickupAddress
            }, token);
            
            alert('Food donation posted successfully!');
            donateForm.reset();
        } catch (error) {
            alert(error.message);
        }
    });
}

// Handle food request
if (requestForm) {
    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/requests/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    foodType: document.getElementById('foodType').value,
                    requestQuantity: document.getElementById('requestQuantity').value,
                    preferredDate: document.getElementById('preferredDate').value,
                    requestDescription: document.getElementById('requestDescription').value,
                    deliveryAddress: document.getElementById('deliveryAddress').value
                })
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit request');
            }
            
            alert('Food request submitted successfully!');
            requestForm.reset();
        } catch (error) {
            console.error('Request error:', error);
            alert(error.message);
        }
    });
}

// Load dashboard data
if (window.location.pathname.includes('dashboard.html')) {
    document.addEventListener('DOMContentLoaded', async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        
        try {
            // Get user donations
            const donations = await makeRequest('/donations/my', 'GET', null, token);
            displayDonations(donations);
            
            // Get user requests
            const requests = await makeRequest('/requests/my', 'GET', null, token);
            displayRequests(requests);
            
            // Get available donations
            const availableDonations = await makeRequest('/donations/available', 'GET', null, token);
            displayAvailableDonations(availableDonations);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    });
}

function displayDonations(donations) {
    const container = document.getElementById('myDonations');
    if (!container) return;
    
    if (donations.length === 0) {
        container.innerHTML = '<p>You have not posted any donations yet.</p>';
        return;
    }
    
    container.innerHTML = donations.map(donation => `
        <div class="card">
            <h3>${donation.foodName}</h3>
            <p><strong>Quantity:</strong> ${donation.quantity}</p>
            <p><strong>Expiry:</strong> ${new Date(donation.expiryDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${donation.status}</p>
            <p>${donation.description}</p>
        </div>
    `).join('');
}

function displayRequests(requests) {
    const container = document.getElementById('myRequests');
    if (!container) return;
    
    if (requests.length === 0) {
        container.innerHTML = '<p>You have not made any requests yet.</p>';
        return;
    }
    
    container.innerHTML = requests.map(request => `
        <div class="card">
            <h3>${request.foodType}</h3>
            <p><strong>Quantity:</strong> ${request.quantity}</p>
            <p><strong>Preferred Date:</strong> ${new Date(request.preferredDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${request.status}</p>
            <p>${request.description}</p>
        </div>
    `).join('');
}

function displayAvailableDonations(donations) {
    const container = document.getElementById('availableDonations');
    if (!container) return;
    
    if (donations.length === 0) {
        container.innerHTML = '<p>No available donations at the moment.</p>';
        return;
    }
    
    container.innerHTML = donations.map(donation => `
        <div class="card">
            <h3>${donation.foodName}</h3>
            <p><strong>Quantity:</strong> ${donation.quantity}</p>
            <p><strong>Expiry:</strong> ${new Date(donation.expiryDate).toLocaleDateString()}</p>
            <p><strong>Donor:</strong> ${donation.donor.name}</p>
            <p>${donation.description}</p>
            <button class="btn" onclick="requestDonation('${donation._id}')">Request This Donation</button>
        </div>
    `).join('');
}

async function requestDonation(donationId) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        await makeRequest(`/donations/${donationId}/request`, 'POST', null, token);
        alert('Request submitted successfully!');
        window.location.reload();
    } catch (error) {
        alert(error.message);
    }
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', checkAuth);



//voluteer


  document.getElementById('volunteerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
      // Get form data
      const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        city: document.getElementById('city').value.trim(),
        roles: document.getElementById('roles').value.trim(),
        availability: document.getElementById('availability').value.trim(),
        vehicle: document.getElementById('vehicle').value.trim(),
        motivation: document.getElementById('motivation').value.trim(),
        emergencyContact: document.getElementById('emergencyContact').value.trim()
      };

      // Basic validation
      if (!formData.fullName || !formData.email) {
        throw new Error('Name and email are required');
      }

      const response = await fetch('http://localhost:5000/api/volunteer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit form');
      }

      alert('Volunteer application submitted successfully!');
      window.location.href = 'dashboard.html';
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Error: ${error.message}`);
    }
  });

  //rewards
  // Add these functions to script.js
async function addStarsToVolunteer() {
    const volunteerId = document.getElementById('volunteerId').value;
    const stars = document.getElementById('starsToAdd').value;
    
    try {
      const response = await fetch(`${API_BASE_URL}/volunteer/${volunteerId}/stars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ stars: parseInt(stars) })
      });
      
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error || 'Failed to add stars');
      
      alert('Stars added successfully!');
    } catch (error) {
      console.error('Error adding stars:', error);
      alert(`Error: ${error.message}`);
    }
  }
  
  async function addRewardToVolunteer() {
    const volunteerId = document.getElementById('volunteerIdReward').value;
    const reward = document.getElementById('rewardName').value;
    
    try {
      const response = await fetch(`${API_BASE_URL}/volunteer/${volunteerId}/reward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reward })
      });
      
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error || 'Failed to add reward');
      
      alert('Reward added successfully!');
    } catch (error) {
      console.error('Error adding reward:', error);
      alert(`Error: ${error.message}`);
    }
  }
  
  // Add this to your checkAuth function to show reward controls for admins
  function checkAuth() {
    // ... existing code ...
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role === 'admin') {
      const rewardsSection = document.getElementById('volunteerRewards');
      if (rewardsSection) rewardsSection.style.display = 'block';
    }
  }
  

  // Dashboard specific functions
   // Sample data for 5 food items with today's date as reference
   const today = new Date();
   const tomorrow = new Date();
   tomorrow.setDate(today.getDate() + 1);
   const nextWeek = new Date();
   nextWeek.setDate(today.getDate() + 7);
   const lastWeek = new Date();
   lastWeek.setDate(today.getDate() - 7);
   
   function formatDate(date) {
       return date.toISOString().split('T')[0];
   }

   const sampleFoodItems = [
       {
           id: 1,
           name: "Fresh Apples",
           category: "Produce",
           quantity: 5,
           expiryDate: formatDate(nextWeek),
           status: "available"
       },
       {
           id: 2,
           name: "Whole Wheat Bread",
           category: "Bakery",
           quantity: 2,
           expiryDate: formatDate(tomorrow),
           status: "expiring"
       },
       {
           id: 3,
           name: "Milk",
           category: "Dairy",
           quantity: 1,
           expiryDate: formatDate(lastWeek),
           status: "expired"
       },
       {
           id: 4,
           name: "Canned Beans",
           category: "Non-Perishable",
           quantity: 3,
           expiryDate: "2025-06-20",
           status: "available"
       },
       {
           id: 5,
           name: "Chicken Breast",
           category: "Meat",
           quantity: 2,
           expiryDate: formatDate(today),
           status: "collected"
       }
   ];

   // Initialize with sample data
   let foodItems = [...sampleFoodItems];

   // DOM elements
   const foodItemsList = document.getElementById('foodItemsList');
   const totalItemsEl = document.getElementById('totalItems');
   const availableItemsEl = document.getElementById('availableItems');
   const expiringSoonEl = document.getElementById('expiringSoon');
   const collectedItemsEl = document.getElementById('collectedItems');
   const expiredItemsEl = document.getElementById('expiredItems');
   const statusFilter = document.getElementById('statusFilter');
   const categoryFilter = document.getElementById('categoryFilter');
   const addFoodItemBtn = document.getElementById('addFoodItemBtn');
   const foodItemModal = document.getElementById('foodItemModal');
   const closeBtn = document.querySelector('.close-btn');
   const foodItemForm = document.getElementById('foodItemForm');

   // Chart instances
   let statusChart, categoryChart;

   // Initialize the dashboard
   function initDashboard() {
       updateStats();
       renderFoodItems();
       initCharts();
       setupEventListeners();
   }

   // Update statistics
   function updateStats() {
       const total = foodItems.length;
       const available = foodItems.filter(item => item.status === 'available').length;
       const expiring = foodItems.filter(item => item.status === 'expiring').length;
       const collected = foodItems.filter(item => item.status === 'collected').length;
       const expired = foodItems.filter(item => item.status === 'expired').length;

       totalItemsEl.textContent = total;
       availableItemsEl.textContent = available;
       expiringSoonEl.textContent = expiring;
       collectedItemsEl.textContent = collected;
       expiredItemsEl.textContent = expired;

       updateCharts();
   }

   // Render food items
   function renderFoodItems(filteredItems = null) {
       const itemsToRender = filteredItems || foodItems;
       foodItemsList.innerHTML = '';

       if (itemsToRender.length === 0) {
           foodItemsList.innerHTML = '<p>No food items found.</p>';
           return;
       }

       itemsToRender.forEach(item => {
           const foodItemEl = document.createElement('div');
           foodItemEl.className = 'food-item';
           
           let statusClass = '';
           let statusText = '';
           
           switch(item.status) {
               case 'available':
                   statusClass = 'status-available';
                   statusText = 'Available';
                   break;
               case 'expiring':
                   statusClass = 'status-expiring';
                   statusText = 'Expiring Soon';
                   break;
               case 'collected':
                   statusClass = 'status-collected';
                   statusText = 'Collected';
                   break;
               case 'expired':
                   statusClass = 'status-expired';
                   statusText = 'Expired';
                   break;
           }

           foodItemEl.innerHTML = `
               <div class="food-item-info">
                   <div class="food-item-name">${item.name}</div>
                   <div class="food-item-meta">
                       <span>${item.category}</span>
                       <span>Qty: ${item.quantity}</span>
                       <span>Exp: ${formatDisplayDate(item.expiryDate)}</span>
                   </div>
               </div>
               <div class="food-item-status ${statusClass}">${statusText}</div>
           `;
           
           foodItemsList.appendChild(foodItemEl);
       });
   }

   // Format date for display
   function formatDisplayDate(dateString) {
       const options = { year: 'numeric', month: 'short', day: 'numeric' };
       return new Date(dateString).toLocaleDateString(undefined, options);
   }

   // Initialize charts
   function initCharts() {
       const statusCtx = document.getElementById('statusChart').getContext('2d');
       const categoryCtx = document.getElementById('categoryChart').getContext('2d');

       statusChart = new Chart(statusCtx, {
           type: 'doughnut',
           data: {
               labels: ['Available', 'Expiring Soon', 'Collected', 'Expired'],
               datasets: [{
                   data: [0, 0, 0, 0],
                   backgroundColor: [
                       '#d4edda',
                       '#fff3cd',
                       '#d1ecf1',
                       '#f8d7da'
                   ],
                   borderColor: [
                       '#c3e6cb',
                       '#ffeeba',
                       '#bee5eb',
                       '#f5c6cb'
                   ],
                   borderWidth: 1
               }]
           },
           options: {
               responsive: true,
               maintainAspectRatio: false,
               plugins: {
                   legend: {
                       position: 'bottom'
                   }
               }
           }
       });

       categoryChart = new Chart(categoryCtx, {
           type: 'bar',
           data: {
               labels: [],
               datasets: [{
                   label: 'Food Items by Category',
                   data: [],
                   backgroundColor: '#4CAF50',
                   borderColor: '#3e8e41',
                   borderWidth: 1
               }]
           },
           options: {
               responsive: true,
               maintainAspectRatio: false,
               scales: {
                   y: {
                       beginAtZero: true,
                       ticks: {
                           stepSize: 1
                       }
                   }
               }
           }
       });

       updateCharts();
   }

   // Update charts with current data
   function updateCharts() {
       // Status chart
       const availableCount = foodItems.filter(item => item.status === 'available').length;
       const expiringCount = foodItems.filter(item => item.status === 'expiring').length;
       const collectedCount = foodItems.filter(item => item.status === 'collected').length;
       const expiredCount = foodItems.filter(item => item.status === 'expired').length;
       
       statusChart.data.datasets[0].data = [availableCount, expiringCount, collectedCount, expiredCount];
       statusChart.update();

       // Category chart
       const categories = [...new Set(foodItems.map(item => item.category))];
       const categoryCounts = categories.map(category => 
           foodItems.filter(item => item.category === category).length
       );
       
       categoryChart.data.labels = categories;
       categoryChart.data.datasets[0].data = categoryCounts;
       categoryChart.update();
   }

   