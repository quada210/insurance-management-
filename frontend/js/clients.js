let clients = [];
let editingClientId = null;

// Load all clients
async function loadClients() {
  try {
    clients = await apiRequest('/clients');
    renderClients();
  } catch (error) {
    alert('Failed to load clients: ' + error.message);
  }
}

// Render clients table
function renderClients() {
  const tbody = document.getElementById('clientTableBody');
  tbody.innerHTML = clients.map(client => `
    <tr>
      <td>${client.first_name} ${client.last_name}</td>
      <td>${client.email}</td>
      <td>${client.phone}</td>
      <td>${client.city}, ${client.state}</td>
      <td>${new Date(client.date_of_birth).toLocaleDateString()}</td>
      <td>
        <button class="btn-neon" style="padding: 6px 12px; font-size: 12px;" onclick="editClient('${client.client_id}')">Edit</button>
        <button class="btn-neon" style="padding: 6px 12px; font-size: 12px; border-color: var(--neon-pink);" onclick="deleteClient('${client.client_id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

// Show add client form
function showAddClientForm() {
  document.getElementById('formTitle').textContent = 'Add New Client';
  document.getElementById('clientFormElement').reset();
  document.getElementById('clientId').value = '';
  document.getElementById('clientForm').style.display = 'block';
  editingClientId = null;
}

// Hide form
function hideClientForm() {
  document.getElementById('clientForm').style.display = 'none';
  editingClientId = null;
}

// Edit client
function editClient(clientId) {
  const client = clients.find(c => c.client_id === clientId);
  if (!client) return;

  document.getElementById('formTitle').textContent = 'Edit Client';
  document.getElementById('clientId').value = client.client_id;
  document.getElementById('firstName').value = client.first_name;
  document.getElementById('lastName').value = client.last_name;
  document.getElementById('email').value = client.email;
  document.getElementById('phone').value = client.phone;
  document.getElementById('dateOfBirth').value = client.date_of_birth;
  document.getElementById('addressLine1').value = client.address_line1;
  document.getElementById('addressLine2').value = client.address_line2 || '';
  document.getElementById('city').value = client.city;
  document.getElementById('state').value = client.state;
  document.getElementById('zipCode').value = client.zip_code;
  
  document.getElementById('clientForm').style.display = 'block';
  editingClientId = clientId;
}

// Delete client
async function deleteClient(clientId) {
  if (!confirm('Are you sure you want to delete this client?')) return;

  try {
    await apiRequest(`/clients/${clientId}`, 'DELETE');
    alert('Client deleted successfully');
    loadClients();
  } catch (error) {
    alert('Failed to delete client: ' + error.message);
  }
}

// Form submit handler
document.getElementById('clientFormElement').addEventListener('submit', async (e) => {
  e.preventDefault();

  const clientData = {
    first_name: document.getElementById('firstName').value,
    last_name: document.getElementById('lastName').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    date_of_birth: document.getElementById('dateOfBirth').value,
    address_line1: document.getElementById('addressLine1').value,
    address_line2: document.getElementById('addressLine2').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    zip_code: document.getElementById('zipCode').value
  };

  try {
    if (editingClientId) {
      await apiRequest(`/clients/${editingClientId}`, 'PUT', clientData);
      alert('Client updated successfully');
    } else {
      await apiRequest('/clients', 'POST', clientData);
      alert('Client added successfully');
    }
    hideClientForm();
    loadClients();
  } catch (error) {
    alert('Failed to save client: ' + error.message);
  }
});

// Load clients on page load
loadClients();