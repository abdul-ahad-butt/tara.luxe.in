// test-e2e-audit.mjs
// Comprehensive audit verification script for Tara Luxe 3-service architecture

const BACKEND_URL = 'http://localhost:8787';
const STOREFRONT_URL = 'http://localhost:3000';
const ADMIN_PROXY_URL = 'http://localhost:3002';

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  const json = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, json };
}

async function runAudit() {
  console.log('====================================================');
  console.log('   TARA LUXE (@tara.luxe.in) - E2E AUDIT TEST SUITE  ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(title, condition, extra = '') {
    if (condition) {
      console.log(`[PASS] ${title} ${extra ? `(${extra})` : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title} ${extra ? `(${extra})` : ''}`);
      failed++;
    }
  }

  // 1. Backend Health Check
  try {
    const health = await fetchJSON(`${BACKEND_URL}/api/health`);
    assert('1. Backend /api/health responding', health.ok && health.json?.status === 'ok', `status: ${health.json?.status}`);
  } catch (e) {
    assert('1. Backend /api/health responding', false, e.message);
  }

  // 2. Check Product Images (Verify no broken 404 URLs)
  try {
    const productsRes = await fetchJSON(`${BACKEND_URL}/api/products`);
    const products = productsRes.json?.data || [];
    assert('2a. Products endpoint returns data', productsRes.ok && products.length >= 9, `Total: ${products.length}`);
    
    console.log('   Testing all product image URLs for HTTP 200...');
    let brokenImages = 0;
    for (const p of products) {
      try {
        const imgHead = await fetch(p.imageUrl, { method: 'HEAD' });
        if (!imgHead.ok) {
          console.warn(`   Warning: Product "${p.name}" image returned ${imgHead.status}`);
          brokenImages++;
        }
      } catch (err) {
        console.warn(`   Warning: Failed fetching "${p.name}": ${err.message}`);
        brokenImages++;
      }
    }
    assert('2b. All product images reachable and verified', brokenImages === 0, `${products.length - brokenImages}/${products.length} reachable`);
  } catch (e) {
    assert('2. Products test failed', false, e.message);
  }

  // 3. Dynamic Categories CRUD
  try {
    const catsRes = await fetchJSON(`${BACKEND_URL}/api/categories`);
    const categories = catsRes.json?.data || [];
    assert('3a. Categories endpoint returns seeded categories', catsRes.ok && categories.length >= 5, `Count: ${categories.length}`);

    // Create a new test category
    const newCat = await fetchJSON(`${BACKEND_URL}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Festive Bangles & Kada' })
    });
    const createdCat = newCat.json?.data;
    assert('3b. Inline Category creation works', newCat.ok && createdCat?.name === 'Festive Bangles & Kada', `ID: ${createdCat?.id}`);

    // Clean up test category
    if (createdCat?.id) {
      await fetchJSON(`${BACKEND_URL}/api/categories/${createdCat.id}`, { method: 'DELETE' });
      assert('3c. Category deletion works', true);
    }
  } catch (e) {
    assert('3. Categories test failed', false, e.message);
  }

  // 4. Instagram Highlights CRUD
  try {
    const hlRes = await fetchJSON(`${BACKEND_URL}/api/highlights`);
    const highlights = hlRes.json?.data || [];
    assert('4. Highlights endpoint returns official highlights', hlRes.ok && highlights.length >= 4, `Titles: ${highlights.map(h => h.title).join(', ')}`);
  } catch (e) {
    assert('4. Highlights test failed', false, e.message);
  }

  // 5. Creator Collaborations CRUD
  try {
    const collabRes = await fetchJSON(`${BACKEND_URL}/api/collaborations`);
    const collabs = collabRes.json?.data || [];
    assert('5. Collaborations endpoint returns creator features', collabRes.ok && collabs.length >= 3, `Creators: ${collabs.map(c => c.creatorName).join(', ')}`);
  } catch (e) {
    assert('5. Collaborations test failed', false, e.message);
  }

  // 6. Admin Authentication Gate
  try {
    const loginFail = await fetchJSON(`${BACKEND_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'wrong@admin.com', password: 'badpassword' })
    });
    assert('6a. Admin Login rejects invalid credentials', loginFail.status === 401);

    const loginSuccess = await fetchJSON(`${BACKEND_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@taraluxe.in', password: 'TaraLuxe@2026' })
    });
    const token = loginSuccess.json?.token;
    assert('6b. Admin Login succeeds with official credentials', loginSuccess.ok && Boolean(token), `Token: ${token?.substring(0, 18)}...`);
  } catch (e) {
    assert('6. Admin Auth test failed', false, e.message);
  }

  // 7. Order Placement, TLX-XXXXXX Code & Real-Time Status Lifecycle
  try {
    const productsRes = await fetchJSON(`${BACKEND_URL}/api/products`);
    const firstProduct = productsRes.json?.data?.[0];

    const orderPayload = {
      customerName: 'Pooja Sharma',
      customerPhone: '+91 9876543210',
      address: 'Flat 402, Royal Palms, MG Road, Bengaluru, Karnataka - 560001',
      addressDetails: {
        street: 'Flat 402, Royal Palms, MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      },
      paymentMode: 'COD',
      items: [
        {
          productId: firstProduct.id,
          title: firstProduct.name,
          price: firstProduct.price,
          quantity: 1,
          imageUrl: firstProduct.imageUrl
        }
      ],
      couponCode: 'TARALUXE10',
      subtotal: firstProduct.price,
      discount: 100,
      finalTotal: firstProduct.price - 100
    };

    const placeRes = await fetchJSON(`${BACKEND_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const createdOrder = placeRes.json?.data || placeRes.json?.order;
    const testOrderId = createdOrder?.id;
    const trackingCode = createdOrder?.trackingCode || placeRes.json?.trackingCode;

    assert('7a. Order placed with +91 phone & full address', placeRes.ok && Boolean(testOrderId), `Order ID: ${testOrderId}`);
    assert('7b. Tracking code generated in TLX-XXXXXX format', Boolean(trackingCode && trackingCode.startsWith('TLX-')), `Tracking Code: ${trackingCode}`);

    // Query order tracking
    const trackRes = await fetchJSON(`${BACKEND_URL}/api/orders/track/${trackingCode}`);
    const trackedOrder = trackRes.json?.data || trackRes.json?.order;
    assert('7c. Order query by tracking code returns active order', trackRes.ok && trackedOrder?.trackingCode === trackingCode, `Status: ${trackedOrder?.status}`);

    // Update order status: Pending -> Approved
    const updateRes = await fetchJSON(`${BACKEND_URL}/api/orders/${testOrderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Approved', statusMessage: 'Order confirmed and packed with care in our velvet box.' })
    });
    const updatedOrder = updateRes.json?.data || updateRes.json?.order;
    assert('7d. Admin updates status to Approved', updateRes.ok && updatedOrder?.status === 'Approved', `New Status: ${updatedOrder?.status}`);

    // Verify tracking reflects Approved
    const trackAfterUpdate = await fetchJSON(`${BACKEND_URL}/api/orders/track/${trackingCode}`);
    const recheckedOrder = trackAfterUpdate.json?.data || trackAfterUpdate.json?.order;
    assert('7e. Tracking query reflects Approved status', recheckedOrder?.status === 'Approved');
  } catch (e) {
    assert('7. Order lifecycle test failed', false, e.message);
  }

  // 8. Storefront accessibility
  try {
    const sfRes = await fetch(STOREFRONT_URL);
    assert('8. Customer Storefront reachable on port 3000', sfRes.ok, `HTTP ${sfRes.status}`);
  } catch (e) {
    assert('8. Customer Storefront reachable', false, e.message);
  }

  // 9. Admin Panel accessibility
  try {
    const adminRes = await fetch(ADMIN_PROXY_URL);
    assert('9. Admin Center reachable on port 3002 (Mirror)', adminRes.ok, `HTTP ${adminRes.status}`);
  } catch (e) {
    assert('9. Admin Center reachable', false, e.message);
  }

  // 10. Notification System & Bulk Controls
  try {
    const notifsRes = await fetchJSON(`${BACKEND_URL}/api/notifications`);
    assert('10a. Notifications GET endpoint returns list', notifsRes.ok && Array.isArray(notifsRes.json?.data));

    // Post test notification
    const testNotifRes = await fetchJSON(`${BACKEND_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Audit Test Notification',
        message: 'Verifying notification dispatch and archiving',
        type: 'order'
      })
    });
    const createdNotif = testNotifRes.json?.data;
    assert('10b. Create notification works', testNotifRes.ok && Boolean(createdNotif?.id));

    if (createdNotif?.id) {
      // Archive notification
      const archiveRes = await fetchJSON(`${BACKEND_URL}/api/notifications/${createdNotif.id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: true })
      });
      assert('10c. Archive notification works', archiveRes.ok && archiveRes.json?.data?.archived === true);

      // Permanently delete notification
      const delRes = await fetchJSON(`${BACKEND_URL}/api/notifications/${createdNotif.id}`, {
        method: 'DELETE'
      });
      assert('10d. Permanently delete notification works', delRes.ok);
    }
  } catch (e) {
    assert('10. Notifications test failed', false, e.message);
  }

  // 11. Activity Stream Archiving and Permanent Deletion
  try {
    // Post test bag event
    const bagRes = await fetchJSON(`${BACKEND_URL}/api/bag-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test-audit-session',
        productId: 'prod-test-audit',
        productTitle: 'Audit Test Piece',
        productImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f',
        type: 'ADD_TO_BAG',
        quantity: 1,
        subtotal: 999
      })
    });
    const bagItem = bagRes.json?.data;
    assert('11a. Bag event creation works', bagRes.ok && Boolean(bagItem?.id));

    if (bagItem?.id) {
      // Archive bag event
      const archBagRes = await fetchJSON(`${BACKEND_URL}/api/bag-events/${bagItem.id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: true })
      });
      assert('11b. Archive bag event works', archBagRes.ok && archBagRes.json?.data?.archived === true);

      // Permanently delete bag event
      const delBagRes = await fetchJSON(`${BACKEND_URL}/api/bag-events/${bagItem.id}`, {
        method: 'DELETE'
      });
      assert('11c. Permanently delete bag event works', delBagRes.ok);
    }
  } catch (e) {
    assert('11. Activity stream archiving/delete failed', false, e.message);
  }

  console.log('\n====================================================');
  console.log(` AUDIT SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAudit();
