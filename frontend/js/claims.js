let claims = [];
let policies = [];
let editingClaimId = null;

// Load all claims
async function loadClaims() {
  try {
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('claimTableContainer').style.display = 'none';

    claims = await apiRequest('/claims');
    policies = await apiRequest('/policies');
    
    populatePolicyDropdown();
    renderClaims();
    
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('claimTableContainer').style.display = 'block';
  } catch (error) {
    console.error('Error loading claims:', error);
    alert('Failed to load claims: ' + error.message);
    document.getElementById('loadingSpinner').style.display = 'none';
  }
}

// Populate policy dropdown
function populatePolicyDropdown() {
  const policySelect = document.getElementById('policyId');
  policySelect.innerHTML = '<option value="">Select Policy</option>' +
    policies.map(policy => {
      const clientName = policy.client 
        ? `${policy.client.first_name} ${policy.client.last_name}`
        : 'Unknown';
      return `<option value="${policy.policy_id}">${policy.policy_number} - ${clientName}</option>`;
    }).join('');
}

// Render claims table
function renderClaims() {
  const tbody = document.getElementById('claimTableBody');
  tbody.innerHTML = claims.map(claim => {
    const policyNumber = claim.policy?.policy_number || 'N/A';
    const clientName = claim.policy?.client 
      ? `${claim.policy.client.first_name} ${claim.policy.client.last_name}`
      : 'N/A';
    const incidentType = claim.incident_details?.type || 'N/A';

    return `
      <tr>
        <td>${claim.claim_number}</td>
        <td>${policyNumber}</td>
        <td>${clientName}</td>
        <td>${new Date(claim.claim_date).toLocaleDateString()}</td>
        <td>$${parseFloat(claim.claim_amount).toLocaleString()}</td>
        <td>${incidentType}</td>
        <td><span class="status-badge status-${claim.status}">${claim.status}</span></td>
        <td>
          <button class="btn-neon" style="padding: 6px 12px; font-size: 12px;" onclick="viewClaimDetails('${claim.claim_id}')">View</button>
          <button class="btn-neon" style="padding: 6px 12px; font-size: 12px;" onclick="editClaim('${claim.claim_id}')">Edit</button>
          <button class="btn-neon" style="padding: 6px 12px; font-size: 12px; border-color: var(--neon-pink);" onclick="deleteClaim('${claim.claim_id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

// View claim details (JSONB data)
function viewClaimDetails(claimId) {
  const claim = claims.find(c => c.claim_id === claimId);
  if (!claim) return;

  const details = JSON.stringify(claim.incident_details, null, 2);
  alert(`Claim Details (JSONB):\n\n${details}`);
}

// Show add claim form
function showAddClaimForm() {
  document.getElementById('formTitle').textContent = 'Add New Claim';
  document.getElementById('claimFormElement').reset();
  document.getElementById('claimId').value = '';
  document.getElementById('claimDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('claimForm').style.display = 'block';
  editingClaimId = null;
}

// Hide form
function hideClaimForm() {
  document.getElementById('claimForm').style.display = 'none';
  editingClaimId = null;
}

// Edit claim
function editClaim(claimId) {
  const claim = claims.find(c => c.claim_id === claimId);
  if (!claim) return;

  document.getElementById('formTitle').textContent = 'Edit Claim';
  document.getElementById('claimId').value = claim.claim_id;
  document.getElementById('claimNumber').value = claim.claim_number;
  document.getElementById('policyId').value = claim.policy_id;
  document.getElementById('claimDate').value = claim.claim_date;
  document.getElementById('incidentDate').value = claim.incident_date;
  document.getElementById('claimAmount').value = claim.claim_amount;
  document.getElementById('status').value = claim.status;
  
  // Populate JSONB fields
  if (claim.incident_details) {
    document.getElementById('incidentType').value = claim.incident_details.type || '';
    document.getElementById('incidentLocation').value = claim.incident_details.location || '';
    document.getElementById('incidentDescription').value = claim.incident_details.description || '';
  }
  
  document.getElementById('claimForm').style.display = 'block';
  editingClaimId = claimId;
}

// Delete claim
async function deleteClaim(claimId) {
  if (!confirm('Are you sure you want to delete this claim?')) return;

  try {
    await apiRequest(`/claims/${claimId}`, 'DELETE');
    alert('Claim deleted successfully');
    loadClaims();
  } catch (error) {
    alert('Failed to delete claim: ' + error.message);
  }
}

// Form submit handler
document.getElementById('claimFormElement').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Build JSONB incident_details object
  const incidentDetails = {
    type: document.getElementById('incidentType').value,
    location: document.getElementById('incidentLocation').value,
    description: document.getElementById('incidentDescription').value
  };

  // Try to parse additional info as JSON
  const additionalInfo = document.getElementById('additionalInfo').value;
  if (additionalInfo) {
    try {
      const parsed = JSON.parse(additionalInfo);
      Object.assign(incidentDetails, parsed);
    } catch (e) {
      incidentDetails.additional_notes = additionalInfo;
    }
  }

  const claimData = {
    claim_number: document.getElementById('claimNumber').value,
    policy_id: document.getElementById('policyId').value,
    claim_date: document.getElementById('claimDate').value,
    incident_date: document.getElementById('incidentDate').value,
    claim_amount: parseFloat(document.getElementById('claimAmount').value),
    incident_details: incidentDetails,
    status: document.getElementById('status').value
  };

  try {
    if (editingClaimId) {
      await apiRequest(`/claims/${editingClaimId}`, 'PUT', claimData);
      alert('Claim updated successfully');
    } else {
      await apiRequest('/claims', 'POST', claimData);
      alert('Claim added successfully');
    }
    hideClaimForm();
    loadClaims();
  } catch (error) {
    alert('Failed to save claim: ' + error.message);
  }
});

// Load claims on page load
loadClaims();