const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from the database directory
dotenv.config({ path: path.join(__dirname, '.env') });

// Also try loading from parent directory (backend folder)
if (!process.env.SUPABASE_URL) {
  dotenv.config({ path: path.join(__dirname, '../backend/.env') });
}

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Error: Missing environment variables!');
  console.error('Please create a .env file with:');
  console.error('  SUPABASE_URL=your_supabase_url');
  console.error('  SUPABASE_ANON_KEY=your_anon_key');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

console.log('🔌 Connected to Supabase:', process.env.SUPABASE_URL);

async function checkTableExists(tableName) {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    return !error || !error.message.includes('does not exist');
  } catch (e) {
    return false;
  }
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  // Check if tables exist
  const tables = ['policy_type', 'agent', 'client', 'policy', 'claim', 'payout'];
  console.log('🔍 Checking for required tables...');

  for (const table of tables) {
    const exists = await checkTableExists(table);
    if (!exists) {
      console.error(`❌ Table '${table}' does not exist!`);
      console.error('\n📋 Please run the SQL schema first in Supabase SQL Editor.');
      console.error('   Go to: https://supabase.com/dashboard → SQL Editor');
      console.error('   Then run the schema.sql file.\n');
      process.exit(1);
    }
    console.log(`✅ Table '${table}' found`);
  }

  console.log('\n📝 All tables found! Starting to seed data...\n');

  try {
    // 1. Seed Policy Types (using upsert to avoid duplicates)
    console.log('📝 Seeding policy types...');
    const { data: policyTypes, error: ptError } = await supabase
      .from('policy_type')
      .upsert([
        {
          type_name: 'Auto Insurance',
          description: 'Comprehensive vehicle coverage',
          base_premium: 1200.00,
          coverage_amount: 50000.00
        },
        {
          type_name: 'Home Insurance',
          description: 'Property and liability protection',
          base_premium: 1800.00,
          coverage_amount: 250000.00
        },
        {
          type_name: 'Life Insurance',
          description: 'Term life coverage',
          base_premium: 500.00,
          coverage_amount: 500000.00
        },
        {
          type_name: 'Health Insurance',
          description: 'Medical expense coverage',
          base_premium: 3000.00,
          coverage_amount: 100000.00
        }
      ], { onConflict: 'type_name' })
      .select();

    if (ptError) {
      console.error('Policy Types Error:', ptError);
      throw ptError;
    }
    console.log(`✅ Seeded ${policyTypes.length} policy types`);

    // 2. Seed Agents (using upsert)
    console.log('📝 Seeding agents...');
    const { data: agents, error: agentError } = await supabase
      .from('agent')
      .upsert([
        {
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@insurance.com',
          phone: '555-0101',
          commission_rate: 12.5,
          status: 'active'
        },
        {
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah.johnson@insurance.com',
          phone: '555-0102',
          commission_rate: 15.0,
          status: 'active'
        },
        {
          first_name: 'Michael',
          last_name: 'Williams',
          email: 'michael.williams@insurance.com',
          phone: '555-0103',
          commission_rate: 10.0,
          status: 'active'
        }
      ], { onConflict: 'email' })
      .select();

    if (agentError) {
      console.error('Agents Error:', agentError);
      throw agentError;
    }
    console.log(`✅ Seeded ${agents.length} agents`);

    // 3. Seed Clients (using upsert)
    console.log('📝 Seeding clients...');
    const { data: clients, error: clientError } = await supabase
      .from('client')
      .upsert([
        {
          first_name: 'Emma',
          last_name: 'Davis',
          email: 'emma.davis@email.com',
          phone: '555-1001',
          date_of_birth: '1985-03-15',
          address_line1: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip_code: '10001'
        },
        {
          first_name: 'James',
          last_name: 'Wilson',
          email: 'james.wilson@email.com',
          phone: '555-1002',
          date_of_birth: '1990-07-22',
          address_line1: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zip_code: '90001'
        },
        {
          first_name: 'Olivia',
          last_name: 'Brown',
          email: 'olivia.brown@email.com',
          phone: '555-1003',
          date_of_birth: '1988-11-30',
          address_line1: '789 Pine Rd',
          city: 'Chicago',
          state: 'IL',
          zip_code: '60601'
        }
      ], { onConflict: 'email' })
      .select();

    if (clientError) {
      console.error('Clients Error:', clientError);
      throw clientError;
    }
    console.log(`✅ Seeded ${clients.length} clients`);

    // 4. Seed Policies (using upsert)
    console.log('📝 Seeding policies...');
    const { data: policies, error: policyError } = await supabase
      .from('policy')
      .upsert([
        {
          policy_number: 'POL-2024-001',
          client_id: clients[0].client_id,
          agent_id: agents[0].agent_id,
          policy_type_id: policyTypes[0].policy_type_id,
          start_date: '2024-01-01',
          end_date: '2025-01-01',
          premium_amount: 1200.00,
          coverage_amount: 50000.00,
          status: 'active'
        },
        {
          policy_number: 'POL-2024-002',
          client_id: clients[1].client_id,
          agent_id: agents[1].agent_id,
          policy_type_id: policyTypes[1].policy_type_id,
          start_date: '2024-02-01',
          end_date: '2025-02-01',
          premium_amount: 1800.00,
          coverage_amount: 250000.00,
          status: 'active'
        },
        {
          policy_number: 'POL-2024-003',
          client_id: clients[2].client_id,
          agent_id: agents[2].agent_id,
          policy_type_id: policyTypes[2].policy_type_id,
          start_date: '2024-03-01',
          end_date: '2025-03-01',
          premium_amount: 500.00,
          coverage_amount: 500000.00,
          status: 'active'
        }
      ], { onConflict: 'policy_number' })
      .select();

    if (policyError) {
      console.error('Policies Error:', policyError);
      throw policyError;
    }
    console.log(`✅ Seeded ${policies.length} policies`);

    // 5. Seed Claims (using upsert)
    console.log('📝 Seeding claims...');
    const { data: claims, error: claimError } = await supabase
      .from('claim')
      .upsert([
        {
          claim_number: 'CLM-2024-001',
          policy_id: policies[0].policy_id,
          claim_date: '2024-06-15',
          incident_date: '2024-06-10',
          claim_amount: 5000.00,
          incident_details: {
            type: 'Vehicle Collision',
            location: '5th Ave & 42nd St, New York, NY',
            description: 'Rear-end collision at traffic light',
            witnesses: ['Jane Doe', 'Bob Smith'],
            police_report_number: 'NYPD-2024-12345',
            weather_conditions: 'Clear',
            photos: ['photo1.jpg', 'photo2.jpg']
          },
          status: 'approved'
        },
        {
          claim_number: 'CLM-2024-002',
          policy_id: policies[1].policy_id,
          claim_date: '2024-07-20',
          incident_date: '2024-07-18',
          claim_amount: 15000.00,
          incident_details: {
            type: 'Water Damage',
            location: 'Kitchen - 456 Oak Ave, Los Angeles, CA',
            description: 'Burst pipe caused flooding',
            affected_areas: ['Kitchen', 'Living Room'],
            damage_assessment: 'Moderate to severe',
            emergency_services_called: true
          },
          status: 'pending'
        }
      ], { onConflict: 'claim_number' })
      .select();

    if (claimError) {
      console.error('Claims Error:', claimError);
      throw claimError;
    }
    console.log(`✅ Seeded ${claims.length} claims`);

    // 6. Seed Payouts (using regular insert instead of upsert)
    console.log('📝 Seeding payouts...');
    // First check if payout already exists for the claim
    const { data: existingPayouts, error: checkError } = await supabase
      .from('payout')
      .select('*')
      .eq('claim_id', claims[0].claim_id);

    if (checkError) {
      console.error('Error checking existing payouts:', checkError);
      throw checkError;
    }

    // Only insert if payout doesn't exist
    if (existingPayouts.length === 0) {
      const { data: payouts, error: payoutError } = await supabase
        .from('payout')
        .insert([
          {
            claim_id: claims[0].claim_id,
            payout_amount: 5000.00,
            payout_date: '2024-06-25',
            payment_method: 'bank_transfer',
            transaction_reference: 'TXN-20240625-001',
            status: 'completed'
          }
        ])
        .select();

      if (payoutError) {
        console.error('Payouts Error:', payoutError);
        throw payoutError;
      }
      console.log(`✅ Seeded ${payouts.length} payouts`);
    } else {
      console.log('⚠️ Payout already exists for claim, skipping');
    }

    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('\n📊 Summary:');
    console.log(`   - Policy Types: ${policyTypes.length}`);
    console.log(`   - Agents: ${agents.length}`);
    console.log(`   - Clients: ${clients.length}`);
    console.log(`   - Policies: ${policies.length}`);
    console.log(`   - Claims: ${claims.length}`);
    console.log(`   - Payouts: ${existingPayouts.length > 0 ? existingPayouts.length : 1}`);

  } catch (error) {
    console.error('\n❌ Seeding error:', error.message);
    if (error.details) console.error('Details:', error.details);
    if (error.hint) console.error('Hint:', error.hint);
    process.exit(1);
  }
}

seedDatabase();