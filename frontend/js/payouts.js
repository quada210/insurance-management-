let payouts = [];
let claims = [];
let editingPayoutId = null;

// Load all payouts
async function loadPayouts() {
  try {
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('payoutTableContainer').style.display = 'none';

    payouts = await apiRequest('/payouts');
    claims = await apiRequest('/claims');
    
    populateClaimDropdown();
    renderPayouts();
    
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('payoutTableContainer').style.display = 'block';
  } catch (error) {
    console.error('Error loading payouts:', error);
    alert('Failed to load payouts: ' + error.message);
    document.getElementById('loadingSpinner').style.display = 'none';
  }
}

// Populate claim dropdown
function populateClaimDropdown() {
  const claimSelect = document.getElementById('claimId');
  claimSelect.innerHTML = '<option value="">Select Claim</option>' +
    claims.map(claim => {
      const clientName = claim.policy?.client 
        ? `${claim.policy.client.first_name} ${claim.policy.client.last_name}`
        : 'Unknown';
      return `<option value="${claim.claim_id}">${claim.claim_number} - ${clientName} - $${claim.claim_amount}</option>`;
    }).join('');
}

// Render payouts table
function renderPayouts() {
  const tbody = document.getElementById('payoutTableBody');
  tbody.innerHTML = payouts.map(payout => {
    const claimNumber = payout.claim?.claim_number || 'N/A';
    const clientName = payout.claim?.policy?.client 
      ? `${payout.claim.policy.client.first_name} ${payout.claim.policy.client.last_name}`
      : 'N/A';

    return `
      <tr>
        <td>${claimNumber}</td>
        <td>${clientName}</td>
        <td>$${parseFloat(payout.payout_amount).toLocaleString()}</td>
        <td>${new Date(payout.payout_date).toLocaleDateString()}</td>
        <td>${payout.payment_method}</td>
        <td>${payout.transaction_reference || 'N/A'}</td>
        <td><span class="status-badge status-${payout.status}">${payout.status}</span></td>
        <td>
          <button class="btn-neon" style="padding: 6px 12px; font-size: 12px;" onclick="editPayout('${payout.payout_id}')">Edit</button>
          ${payout.status !== 'completed' ? `<button class="btn-neon" style="padding: 6px 12px; font-size: 12px; border-color: var(--neon-green);" onclick="completePayout('${payout.payout_id}')">Complete</button>` : ''}
          <button class="btn-neon" style="padding: 6px 12px; font-size: 12px; border-color: var(--neon-pink);" onclick="deletePayout('${payout.payout_id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Show add payout form
function showAddPayoutForm() {
  document.getElementById('formTitle').textContent = 'Add New Payout';
  document.getElementById('payoutFormElement').reset();
  document.getElementById('payoutId').value = '';
  document.getElementById('payoutDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('payoutForm').style.display = 'block';
  editingPayoutId = null;
}

// Hide form
function hidePayoutForm() {
  document.getElementById('payoutForm').style.display = 'none';
  editingPayoutId = null;
}

// Edit payout
function editPayout(payoutId) {
  const payout = payouts.find(p => p.payout_id === payoutId);
  if (!payout) return;

  document.getElementById('formTitle').textContent = 'Edit Payout';
  document.getElementById('payoutId').value = payout.payout_id;
  document.getElementById('claimId').value = payout.claim_id;
  document.getElementById('payoutAmount').value = payout.payout_amount;
  document.getElementById('payoutDate').value = payout.payout_date;
  document.getElementById('paymentMethod').value = payout.payment_method;
  document.getElementById('transactionReference').value = payout.transaction_reference || '';
  document.getElementById('status').value = payout.status;
  
  document.getElementById('payoutForm').style.display = 'block';
  editingPayoutId = payoutId;
}

// Complete payout (triggers claim status update via trigger)
async function completePayout(payoutId) {
  if (!confirm('Mark this payout as completed? This will automatically approve the claim.')) return;

  try {
    await apiRequest(`/payouts/${payoutId}/complete`, 'PUT');
    alert('Payout completed successfully! The related claim has been approved.');
    loadPayouts();
  } catch (error) {
    alert('Failed to complete payout: ' + error.message);
  }
}

// Delete payout
async function deletePayout(payoutId) {
  if (!confirm('Are you sure you want to delete this payout?')) return;

  try {
    await apiRequest(`/payouts/${payoutId}`, 'DELETE');
    alert('Payout deleted successfully');
    loadPayouts();
  } catch (error) {
    alert('Failed to delete payout: ' + error.message);
  }
}

// Form submit handler
document.getElementById('payoutFormElement').addEventListener('submit', async (e) => {
  e.preventDefault();

  const payoutData = {
    claim_id: document.getElementById('claimId').value,
    payout_amount: parseFloat(document.getElementById('payoutAmount').value),
    payout_date: document.getElementById('payoutDate').value,
    payment_method: document.getElementById('paymentMethod').value,
    transaction_reference: document.getElementById('transactionReference').value,
    status: document.getElementById('status').value
  };

  try {
    if (editingPayoutId) {
      await apiRequest(`/payouts/${editingPayoutId}`, 'PUT', payoutData);
      alert('Payout updated successfully');
    } else {
      await apiRequest('/payouts', 'POST', payoutData);
      alert('Payout added successfully');
    }
    hidePayoutForm();
    loadPayouts();
  } catch (error) {
    alert('Failed to save payout: ' + error.message);
  }
});

// Load payouts on page load
loadPayouts();