let agents = [];
let policies = []; // To count policies per agent
let editingAgentId = null;

// Load all agents and their statistics
async function loadAgents() {
  try {
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('agentTableContainer').style.display = 'none';

    // Load agents
    agents = await apiRequest('/agents');
    
    // Load policies to count how many each agent has sold
    try {
      policies = await apiRequest('/policies');
    } catch (e) {
      console.warn('Could not load policies:', e);
      policies = [];
    }

    updateStatistics();
    renderAgents();
    
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('agentTableContainer').style.display = 'block';
  } catch (error) {
    console.error('Error loading agents:', error);
    alert('Failed to load agents: ' + error.message);
    document.getElementById('loadingSpinner').style.display = 'none';
  }
}

// Update statistics cards
function updateStatistics() {
  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status === 'active').length;
  
  const avgCommission = totalAgents > 0
    ? (agents.reduce((sum, a) => sum + parseFloat(a.commission_rate || 0), 0) / totalAgents).toFixed(2)
    : 0;
  
  const totalPoliciesSold = policies.length;

  document.getElementById('totalAgents').textContent = totalAgents;
  document.getElementById('activeAgents').textContent = activeAgents;
  document.getElementById('avgCommission').textContent = avgCommission + '%';
  document.getElementById('totalPoliciesSold').textContent = totalPoliciesSold;
}

// Count policies for a specific agent
function getPolicyCount(agentId) {
  return policies.filter(p => p.agent_id === agentId).length;
}

// Render agents table
function renderAgents() {
  const tbody = document.getElementById('agentTableBody');
  
  if (agents.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">No agents found. Add your first agent to get started!</td></tr>';
    return;
  }

  tbody.innerHTML = agents.map(agent => {
    const policyCount = getPolicyCount(agent.agent_id);
    
    return `
      <tr>
        <td>
          <strong>${agent.first_name} ${agent.last_name}</strong>
        </td>
        <td>${agent.email}</td>
        <td>${agent.phone}</td>
        <td>${new Date(agent.hire_date).toLocaleDateString()}</td>
        <td>
          <span class="commission-badge">${parseFloat(agent.commission_rate).toFixed(2)}%</span>
        </td>
        <td>
          <span class="policies-count">${policyCount} policies</span>
        </td>
        <td>
          <span class="status-badge status-${agent.status}">${agent.status}</span>
        </td>
        <td>
          <button class="btn-neon" style="padding: 6px 12px; font-size: 12px;" onclick="viewAgentDetails('${agent.agent_id}')">View</button>
          <button class="btn-neon" style="padding: 6px 12px; font-size: 12px;" onclick="editAgent('${agent.agent_id}')">Edit</button>
          <button class="btn-neon" style="padding: 6px 12px; font-size: 12px; border-color: var(--neon-pink);" onclick="deleteAgent('${agent.agent_id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

// View agent details in a modal/alert
function viewAgentDetails(agentId) {
  const agent = agents.find(a => a.agent_id === agentId);
  if (!agent) return;

  const policyCount = getPolicyCount(agent.agent_id);
  const agentPolicies = policies.filter(p => p.agent_id === agentId);
  
  const totalPremiums = agentPolicies.reduce((sum, p) => sum + parseFloat(p.premium_amount || 0), 0);
  const estimatedCommission = (totalPremiums * parseFloat(agent.commission_rate) / 100).toFixed(2);

  const details = `
Agent Details:
─────────────────────────────────
Name: ${agent.first_name} ${agent.last_name}
Email: ${agent.email}
Phone: ${agent.phone}
Hire Date: ${new Date(agent.hire_date).toLocaleDateString()}
Commission Rate: ${agent.commission_rate}%
Status: ${agent.status}

Performance:
─────────────────────────────────
Policies Sold: ${policyCount}
Total Premiums: $${totalPremiums.toLocaleString()}
Estimated Commission: $${parseFloat(estimatedCommission).toLocaleString()}

Joined: ${new Date(agent.created_at).toLocaleDateString()}
Last Updated: ${new Date(agent.updated_at).toLocaleDateString()}
  `;

  alert(details);
}

// Show add agent form
function showAddAgentForm() {
  document.getElementById('formTitle').textContent = 'Add New Agent';
  document.getElementById('agentFormElement').reset();
  document.getElementById('agentId').value = '';
  
  // Set default hire date to today
  document.getElementById('hireDate').value = new Date().toISOString().split('T')[0];
  
  document.getElementById('agentForm').style.display = 'block';
  editingAgentId = null;
}

// Hide form
function hideAgentForm() {
  document.getElementById('agentForm').style.display = 'none';
  editingAgentId = null;
}

// Edit agent
function editAgent(agentId) {
  const agent = agents.find(a => a.agent_id === agentId);
  if (!agent) return;

  document.getElementById('formTitle').textContent = 'Edit Agent';
  document.getElementById('agentId').value = agent.agent_id;
  document.getElementById('firstName').value = agent.first_name;
  document.getElementById('lastName').value = agent.last_name;
  document.getElementById('email').value = agent.email;
  document.getElementById('phone').value = agent.phone;
  document.getElementById('hireDate').value = agent.hire_date;
  document.getElementById('commissionRate').value = agent.commission_rate;
  document.getElementById('status').value = agent.status;
  
  document.getElementById('agentForm').style.display = 'block';
  editingAgentId = agentId;
}

// Delete agent
async function deleteAgent(agentId) {
  const agent = agents.find(a => a.agent_id === agentId);
  const policyCount = getPolicyCount(agentId);

  if (policyCount > 0) {
    if (!confirm(`⚠️ Warning: This agent has ${policyCount} active policies.\n\nDeleting this agent may cause issues. Are you sure?`)) {
      return;
    }
  } else {
    if (!confirm(`Are you sure you want to delete ${agent.first_name} ${agent.last_name}?`)) {
      return;
    }
  }

  try {
    await apiRequest(`/agents/${agentId}`, 'DELETE');
    alert('Agent deleted successfully');
    loadAgents();
  } catch (error) {
    alert('Failed to delete agent: ' + error.message);
  }
}

// Form submit handler
document.getElementById('agentFormElement').addEventListener('submit', async (e) => {
  e.preventDefault();

  const agentData = {
    first_name: document.getElementById('firstName').value.trim(),
    last_name: document.getElementById('lastName').value.trim(),
    email: document.getElementById('email').value.trim().toLowerCase(),
    phone: document.getElementById('phone').value.trim(),
    hire_date: document.getElementById('hireDate').value,
    commission_rate: parseFloat(document.getElementById('commissionRate').value),
    status: document.getElementById('status').value
  };

  // Validation
  if (agentData.commission_rate < 0 || agentData.commission_rate > 100) {
    alert('Commission rate must be between 0 and 100');
    return;
  }

  try {
    if (editingAgentId) {
      await apiRequest(`/agents/${editingAgentId}`, 'PUT', agentData);
      alert('Agent updated successfully');
    } else {
      await apiRequest('/agents', 'POST', agentData);
      alert('Agent added successfully');
    }
    hideAgentForm();
    loadAgents();
  } catch (error) {
    alert('Failed to save agent: ' + error.message);
  }
});

// Load agents on page load
loadAgents();