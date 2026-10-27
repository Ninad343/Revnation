import http from 'http';
import app from '../server.js';
import mongoose from 'mongoose';

const PORT = 5001; // isolated test port
let server;
const BASE_URL = `http://localhost:${PORT}/api`;

const logTest = (name, passed, detail = '') => {
  if (passed) {
    console.log(`  ✓ PASS: ${name}`);
  } else {
    console.error(`  ✗ FAIL: ${name} ${detail}`);
  }
};

const runTests = async () => {
  console.log('\n======================================================');
  console.log('   REVNATION COMPREHENSIVE BACKEND & RBAC TEST SUITE  ');
  console.log('======================================================\n');

  let passedCount = 0;
  let totalCount = 0;

  const assert = (name, condition, detail = '') => {
    totalCount++;
    if (condition) {
      passedCount++;
      logTest(name, true);
    } else {
      logTest(name, false, detail);
    }
  };

  try {
    // 1. Start test server
    server = app.listen(PORT);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert('API Health Check', healthRes.status === 200 && healthData.status === 'OK');

    // 2. User Registration
    const testEmail = `testdriver_${Date.now()}@revnation.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Hunter',
        email: testEmail,
        password: 'Password@123',
        phone: '+91 98888 77777'
      })
    });
    const regData = await regRes.json();
    assert('User Registration', regRes.status === 201 && regData.success && regData.token);
    assert('Default Role is USER', regData.user.role === 'USER');

    const userToken = regData.token;

    // 3. User Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password@123'
      })
    });
    const loginData = await loginRes.json();
    assert('User Login & JWT Verification', loginRes.status === 200 && loginData.token);

    // 4. Vehicle Garage Management
    const addVehRes = await fetch(`${BASE_URL}/auth/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        make: 'BMW',
        model: '3 Series',
        variant: '330i',
        year: 2022,
        fuelType: 'Petrol',
        nickname: 'Blue Lightning'
      })
    });
    const vehData = await addVehRes.json();
    assert('Add Vehicle to Garage (My Garage)', addVehRes.status === 201 && vehData.activeVehicle.make === 'BMW');

    // 5. Product Browsing & Vehicle Compatibility Search
    const productsRes = await fetch(`${BASE_URL}/products?vehicleMake=BMW&vehicleModel=3 Series&vehicleYear=2022`);
    const prodData = await productsRes.json();
    assert('Fetch Products with Vehicle Compatibility', productsRes.status === 200 && prodData.products.length > 0);

    const firstProduct = prodData.products[0];
    assert('Product has compatibility specs and brand', firstProduct && firstProduct.brand && firstProduct.price);

    // 6. Wishlist Add / Toggle
    const wishRes = await fetch(`${BASE_URL}/wishlist/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({ productId: firstProduct._id })
    });
    const wishData = await wishRes.json();
    assert('Toggle Product in Wishlist', wishRes.status === 200 && wishData.isWishlisted === true);

    // 7. Cart Operations & Stock Validation
    const cartRes = await fetch(`${BASE_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({ productId: firstProduct._id, quantity: 2 })
    });
    const cartData = await cartRes.json();
    assert('Add Product to Cart', cartRes.status === 200 && cartData.success);

    // Verify stock overflow rejection
    const overflowRes = await fetch(`${BASE_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({ productId: firstProduct._id, quantity: 9999 })
    });
    assert('Stock Overflow Rejection in Cart', overflowRes.status === 400);

    // 8. Place Order & Checkout
    const initialStock = firstProduct.stock;
    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        shippingAddress: {
          fullName: 'Alex Hunter',
          phone: '+91 98888 77777',
          street: '42 Speed Highway',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India'
        },
        paymentMethod: 'TEST_MODE_CARD'
      })
    });
    const orderData = await orderRes.json();
    assert('Checkout & Order Placement', orderRes.status === 201 && orderData.order.orderNumber);

    // Verify stock decrement
    const checkProductRes = await fetch(`${BASE_URL}/products/${firstProduct._id}`);
    const checkProductData = await checkProductRes.json();
    assert('Atomic Stock Decrement in MongoDB', checkProductData.product.stock === initialStock - 2);

    // 9. Seller Application (USER -> PENDING)
    const applyRes = await fetch(`${BASE_URL}/sellers/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        businessName: 'Hunter High-Performance Spares',
        businessEmail: 'sales@hunterspares.in',
        businessPhone: '+91 98888 77777',
        address: 'Speed Valley Sector 4, Bangalore',
        taxId: '29ABCDE1234F1Z5',
        description: 'Manufacturer of bespoke composite diffusers and high-rate valve springs.',
        categories: ['Engine Parts', 'Exterior Styling & Aerodynamics']
      })
    });
    const applyData = await applyRes.json();
    assert('User Submits Seller Application', applyRes.status === 201 && applyData.application.status === 'PENDING');

    // 10. Strict RBAC Enforcement BEFORE Approval
    // Normal user attempting to access seller dashboard -> MUST RETURN 403!
    const rbacSellerDashboard = await fetch(`${BASE_URL}/sellers/dashboard`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert('RBAC: Normal User Blocked from Seller Dashboard (403 Forbidden)', rbacSellerDashboard.status === 403);

    // Normal user attempting to access admin endpoints -> MUST RETURN 403!
    const rbacAdminUsers = await fetch(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert('RBAC: Normal User Blocked from Admin Users (403 Forbidden)', rbacAdminUsers.status === 403);

    // Normal user attempting to add product -> MUST RETURN 403!
    const rbacAddProduct = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        name: 'Hacked Part',
        description: 'Should not succeed',
        category: 'Engine Parts',
        brand: 'Fake',
        price: 1000
      })
    });
    assert('RBAC: Normal User Blocked from Creating Products (403 Forbidden)', rbacAddProduct.status === 403);

    // 11. Admin Login & Seller Approval Workflow
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@revnation.com',
        password: 'Admin@12345'
      })
    });
    const adminLoginData = await adminLoginRes.json();
    assert('Admin Login', adminLoginRes.status === 200 && adminLoginData.user.role === 'ADMIN');
    const adminToken = adminLoginData.token;

    // Admin views pending applications
    const appsRes = await fetch(`${BASE_URL}/admin/sellers?status=PENDING`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const appsData = await appsRes.json();
    assert('Admin Views Pending Applications', appsRes.status === 200 && appsData.applications.length > 0);

    const appToApprove = appsData.applications.find(a => a.businessName === 'Hunter High-Performance Spares');
    assert('Target Application Found in Admin Queue', Boolean(appToApprove));

    // Admin approves the application
    const approveRes = await fetch(`${BASE_URL}/admin/sellers/${appToApprove._id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ notes: 'Verified business registration number and inventory facility.' })
    });
    const approveData = await approveRes.json();
    assert('Admin Approves Application & Upgrades User to SELLER', approveRes.status === 200 && approveData.application.status === 'APPROVED');

    // 12. Approved Seller Login & Operations
    // User re-logins to obtain updated JWT with SELLER role
    const sellerReLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password@123'
      })
    });
    const sellerReLoginData = await sellerReLoginRes.json();
    assert('Seller Login with Role SELLER', sellerReLoginData.user.role === 'SELLER');
    const sellerToken = sellerReLoginData.token;

    // Seller accesses seller dashboard
    const sellerDashRes = await fetch(`${BASE_URL}/sellers/dashboard`, {
      headers: { Authorization: `Bearer ${sellerToken}` }
    });
    const sellerDashData = await sellerDashRes.json();
    assert('Newly Approved Seller Accesses Seller Dashboard', sellerDashRes.status === 200 && sellerDashData.stats);

    // Seller creates a new performance product
    const createProdRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        name: 'Hunter Stage-3 Titanium Dual Valve Springs Kit',
        description: 'Engineered for high-RPM engines up to 9,500 RPM. Eliminates high-boost valve float.',
        category: 'Engine Parts',
        subcategory: 'Camshafts',
        brand: 'Hunter Racing',
        price: 38500,
        discountPrice: 34000,
        stock: 8,
        sku: 'HNT-VS-B58',
        partNumber: 'HNT-9500-B58',
        images: ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'],
        specifications: [
          { name: 'Seat Pressure', value: '85 lbs @ 1.450"' },
          { name: 'Open Pressure', value: '235 lbs @ 0.950"' }
        ],
        compatibility: [
          { make: 'BMW', model: '3 Series', variant: '330i', yearStart: 2019, yearEnd: 2024 }
        ],
        badges: ['PERFORMANCE', 'NEW']
      })
    });
    const createdProdData = await createProdRes.json();
    assert('Seller Successfully Creates New Product', createProdRes.status === 201 && createdProdData.product.slug);

    // Seller updates stock directly in inventory
    const updateStockRes = await fetch(`${BASE_URL}/products/${createdProdData.product._id}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`
      },
      body: JSON.stringify({ stock: 25 })
    });
    const updateStockData = await updateStockRes.json();
    assert('Seller Updates Inventory Stock Level', updateStockRes.status === 200 && updateStockData.stock === 25);

    // Check newly created product is visible in public marketplace
    const publicCheckRes = await fetch(`${BASE_URL}/products/${createdProdData.product.slug}`);
    const publicCheckData = await publicCheckRes.json();
    assert('Newly Created Product Accessible in Public Marketplace', publicCheckRes.status === 200 && publicCheckData.product.name === 'Hunter Stage-3 Titanium Dual Valve Springs Kit');

    console.log('\n======================================================');
    console.log(`TEST SUMMARY: ${passedCount} / ${totalCount} PASSED`);
    console.log('======================================================\n');

    if (passedCount === totalCount) {
      console.log('🎉 ALL BACKEND, RBAC, AND WORKFLOW TESTS PASSED PERFECTLY!\n');
    } else {
      console.error('⚠️ SOME TESTS FAILED. PLEASE REVIEW OUTPUT.\n');
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('Fatal Test Suite Error:', error);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.connection.close();
    process.exit();
  }
};

runTests();
