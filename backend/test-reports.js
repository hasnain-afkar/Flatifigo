const http = require('http');

function apiReq(method, path, body, token) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    const r = http.request({ hostname: 'localhost', port: 5000, path, method, headers }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { resolve({ raw: b }); } });
    });
    if (data) r.write(data);
    r.end();
  });
}

async function login(email) {
  const r = await apiReq('POST', '/api/auth/login', { email, password: 'pass123' });
  return r.token;
}

(async () => {
  let pass = 0, fail = 0;
  function check(name, condition) {
    if (condition) { pass++; console.log(`  ✅ ${name}`); }
    else { fail++; console.log(`  ❌ ${name}`); }
  }

  // 1. Setup tokens
  console.log('\n=== Setup ===');
  const adminToken = await login('admin@demo.com');
  const ownerToken = await login('ali.owner@demo.com');
  const user1Token = await login('hasnain@demo.com');
  const user2Token = await login('talal@demo.com');
  const user3Token = await login('humayl@demo.com');
  check('All logins succeeded', adminToken && ownerToken && user1Token && user2Token && user3Token);

  // 2. Owner creates a listing (pending)
  console.log('\n=== Setup: Create Test Listing ===');
  const cl = await apiReq('POST', '/api/listings', {
    title: 'Test Report Target', description: 'Testing report system', rent: 20000,
    rooms: 2, city: 'islamabad', area: 'G-10', amenities: ['wifi'],
    contactName: 'Ali', contactPhone: '0300'
  }, ownerToken);
  const listingId = cl.listing?.id;
  check('Test listing created', !!listingId);

  // Get owner user ID for user-report test
  const adminUsers = await apiReq('GET', '/api/admin/users', null, adminToken);
  const ownerUser = adminUsers.users.find(u => u.email === 'ali.owner@demo.com');

  // === REPORT CREATION (USER) ===
  console.log('\n=== POST /api/reports — User Reports ===');

  // 3. User reports a listing via POST /api/reports
  const r1 = await apiReq('POST', '/api/reports', {
    targetType: 'listing', targetId: listingId, reason: 'fake', description: 'Looks suspicious'
  }, user1Token);
  check('User 1 reports listing successfully', r1.success);

  // 4. User reports same listing — duplicate prevented
  const r1dup = await apiReq('POST', '/api/reports', {
    targetType: 'listing', targetId: listingId, reason: 'scam'
  }, user1Token);
  check('Duplicate report prevented', !r1dup.success && r1dup.message.includes('already reported'));

  // 5. User 2 reports same listing
  const r2 = await apiReq('POST', '/api/reports', {
    targetType: 'listing', targetId: listingId, reason: 'scam'
  }, user2Token);
  check('User 2 reports listing successfully', r2.success);

  // 6. User 3 reports same listing → triggers auto-flag (3rd report)
  const r3 = await apiReq('POST', '/api/reports', {
    targetType: 'listing', targetId: listingId, reason: 'inappropriate'
  }, user3Token);
  check('User 3 reports listing (auto-flag triggered)', r3.success);

  // 7. User reports a user via POST /api/reports
  const rUser = await apiReq('POST', '/api/reports', {
    targetType: 'user', targetId: ownerUser.id, reason: 'scam', description: 'Fake owner profile'
  }, user1Token);
  check('User reports another user successfully', rUser.success);

  // 8. User cannot report themselves
  const rSelf = await apiReq('POST', '/api/reports', {
    targetType: 'user', targetId: ownerUser.id, reason: 'fake'
  }, ownerToken);
  // ownerToken user has different ID check
  // Actually ownerToken IS ali.owner, and targetId is ali.owner, so should fail
  check('Self-report prevented', !rSelf.success);

  // 9. Empty reason rejected
  const rNoReason = await apiReq('POST', '/api/reports', {
    targetType: 'listing', targetId: listingId, reason: ''
  }, user1Token);
  check('Empty reason rejected', !rNoReason.success);

  // 10. Invalid reason rejected
  const rBadReason = await apiReq('POST', '/api/reports', {
    targetType: 'listing', targetId: listingId, reason: 'nonsense'
  }, user1Token);
  check('Invalid reason rejected', !rBadReason.success);

  // 11. Unauthenticated user cannot report
  const rUnauth = await apiReq('POST', '/api/reports', {
    targetType: 'listing', targetId: listingId, reason: 'fake'
  });
  check('Unauthenticated user denied', !rUnauth.success);

  // === USER CANNOT ACCESS ADMIN REPORT ENDPOINTS ===
  console.log('\n=== Access Control: User cannot manage reports ===');

  const viewReports = await apiReq('GET', '/api/admin/reports', null, user1Token);
  check('User cannot GET all reports', !viewReports.success);

  const resolveReport = await apiReq('PATCH', '/api/admin/reports/000000000000000000000000/resolve', {}, user1Token);
  check('User cannot resolve reports', !resolveReport.success);

  // === ADMIN CAN MANAGE REPORTS ===
  console.log('\n=== Admin: GET /admin/reports & PATCH /admin/reports/:id/resolve ===');

  const allReports = await apiReq('GET', '/api/admin/reports', null, adminToken);
  check('Admin sees all reports', allReports.success && allReports.reports.length >= 4);
  console.log(`  Reports found: ${allReports.reports.length}`);

  // Find a pending report to resolve
  const pendingReport = allReports.reports.find(r => r.status === 'pending');
  check('Found pending report', !!pendingReport);

  if (pendingReport) {
    const resolve = await apiReq('PATCH', '/api/admin/reports/' + pendingReport.id + '/resolve', {}, adminToken);
    check('Admin resolves report', resolve.success);
  }

  // === FLAGGED LISTINGS ===
  console.log('\n=== Admin: Flagged Listings (auto-flagged at 3 reports) ===');

  const flagged = await apiReq('GET', '/api/admin/flagged', null, adminToken);
  check('Admin sees flagged listings', flagged.success && flagged.listings.length > 0);
  if (flagged.listings.length > 0) {
    check('Listing has 3+ reports', flagged.listings[0].reportCount >= 3);
  }

  // Cleanup: delete test listing
  await apiReq('DELETE', '/api/admin/flagged/' + listingId, null, adminToken);

  // Summary
  console.log(`\n${'='.repeat(44)}`);
  console.log(`  Report System Tests: ${pass} passed, ${fail} failed`);
  console.log(`${'='.repeat(44)}\n`);
  process.exit(fail > 0 ? 1 : 0);
})();
