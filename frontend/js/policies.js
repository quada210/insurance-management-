let policies = [];
let clients = [];
let agents = [];
let policyTypes = [];
let editingPolicyId = null;

// Load all required data
async function loadAllData() {
  try {
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('policyTableContainer').style.display = 'none';

    // Load policies with related data
    policies = await apiRequest('/policies');
    
    // Load reference data for dropdowns
    clients = await apiRequest('/clients');
    agents = await apiRequest('/agents');
    
    // Get policy types from the first policy or fetch separately
    const policyTypesResponse = await fetch('http://localhost:5000/api/policy-types');
    if (policyTypesResponse.ok) {
      const data = await policyTypesResponse.json();
      policyTypes = data.data || data;
    } else {
      // Fallback: extract from policies
      policyTypes = [...new Set(policies.map(p => p.policy_type))].map((type, i) => ({
        policy_type_id: i,
        type_name: type
      }));
    }

    populateDropdowns();
    renderPolicies();
    
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('policyTableContainer').style.display = 'block';
  } catch (error) {
    console.error('Error loading data:', error);
    alert('Failed to load policies: ' + error.message);
    document.getElementById('loadingSpinner').style.display = 'none';
  }
}

// Populate dropdown selects
function populateDropdowns() {
  // Populate clients
  const clientSelect = document.getElementById('clientId');
  clientSelect.innerHTML = '<option value="">Select Client</option>' +
    clients.map(client => 
      `<option value="${client.client_id}">${client.first_name} ${client.last_name}</option>`
    ).join('');

  // Populate agents
  const agentSelect = document.getElementById('agentId');
  agentSelect.innerHTML = '<option value="">Select Agent</option>' +
    agents.map(agent => 
      `<option value="${agent.agent_id}">${agent.first_name} ${agent.last_name}</option>`
    ).join('');

  // Populate policy types
  const typeSelect = document.getElementById('policyTypeId');
  typeSelect.innerHTML = '<option value="">Select Policy Type</option>' +
    policyTypes.map(type => 
      `<option value="${type.policy_type_id}">${type.type_name}</option>`
    ).join('');
}

// Render policies table
function renderPolicies() {
  const tbody = document.getElementById('policyTableBody');
  tbody.innerHTML = policies.map(policy => {
    const clientName = policy.client 
      ? `${policy.client.first_name} ${policy.client.last_name}`
      : 'N/A';
    const agentName = policy.agent 
      ? `${policy.agent.first_name} ${policy.agent.last_name}`
      : 'N/A';
    const policyType = policy.policy_type?.type_name || 'N/A';

    return `
      <tr>
        <td>${policy.policy_number}</td>
        <td>${clientName}</td>
        <td>${agentName}</td>
        <td>${policyType}</td>
        <td>$${parseFloat(policy.premium_amount).toLocaleString()}</td>
        <td>$${parseFloat(policy.coverage_amount).toLocaleString()}</td>
        <td>${new Date(policy.start_date).toLocaleDateString()}</td>
        <td>${new Date(policy.end_date).toLocaleDateString()}</td>
        <td><span class="status-badge status-${policy.status}">${policy.status}</span></td>
        <td>
          <button class="btn-neon" style="padding: 6px 12px; font-size: 12px;" onclick="editPolicy('${policy.policy_id}')">Edit</button>
          <button class="btn-neon" style="padding: 6px 12px; font-size: 12px; border-color: var(--neon-pink);" onclick="deletePolicy('${policy.policy_id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Show add policy form
function showAddPolicyForm() {
  document.getElementById('formTitle').textContent = 'Add New Policy';
  document.getElementById('policyFormElement').reset();
  document.getElementById('policyId').value = '';
  document.getElementById('policyForm').style.display = 'block';
  editingPolicyId = null;
}

// Hide form
function hidePolicyForm() {
  document.getElementById('policyForm').style.display = 'none';
  editingPolicyId = null;
}

// Edit policy
function editPolicy(policyId) {
  const policy = policies.find(p => p.policy_id === policyId);
  if (!policy) return;

  document.getElementById('formTitle').textContent = 'Edit Policy';
  document.getElementById('policyId').value = policy.policy_id;
  document.getElementById('policyNumber').value = policy.policy_number;
  document.getElementById('clientId').value = policy.client_id;
  document.getElementById('agentId').value = policy.agent_id;
  document.getElementById('policyTypeId').value = policy.policy_type_id;
  document.getElementById('startDate').value = policy.start_date;
  document.getElementById('endDate').value = policy.end_date;
  document.getElementById('premiumAmount').value = policy.premium_amount;
  document.getElementById('coverageAmount').value = policy.coverage_amount;
  document.getElementById('status').value = policy.status;
  
  document.getElementById('policyForm').style.display = 'block';
  editingPolicyId = policyId;
}

// Delete policy
async function deletePolicy(policyId) {
  if (!confirm('Are you sure you want to delete this policy?')) return;

  try {
    await apiRequest(`/policies/${policyId}`, 'DELETE');
    alert('Policy deleted successfully');
    loadAllData();
  } catch (error) {
    alert('Failed to delete policy: ' + error.message);
  }
}

// Form submit handler
document.getElementById('policyFormElement').addEventListener('submit', async (e) => {
  e.preventDefault();

  const policyData = {
    policy_number: document.getElementById('policyNumber').value,
    client_id: document.getElementById('clientId').value,
    agent_id: document.getElementById('agentId').value,
    policy_type_id: document.getElementById('policyTypeId').value,
    start_date: document.getElementById('startDate').value,
    end_date: document.getElementById('endDate').value,
    premium_amount: parseFloat(document.getElementById('premiumAmount').value),
    coverage_amount: parseFloat(document.getElementById('coverageAmount').value),
    status: document.getElementById('status').value
  };

  try {
    if (editingPolicyId) {
      await apiRequest(`/policies/${editingPolicyId}`, 'PUT', policyData);
      alert('Policy updated successfully');
    } else {
      await apiRequest('/policies', 'POST', policyData);
      alert('Policy added successfully');
    }
    hidePolicyForm();
    loadAllData();
  } catch (error) {
    alert('Failed to save policy: ' + error.message);
  }
});

// Load data on page load
loadAllData();