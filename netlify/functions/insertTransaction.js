// netlify/functions/insertTransaction.js

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const payload = JSON.parse(event.body);

    // Minimal required field check
    const requiredFields = ['transaction_id', 'customer_email', 'amount_charged'];
    const missing = requiredFields.filter((field) => !payload[field]);

    if (missing.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Missing fields: ${missing.join(', ')}` }),
      };
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([payload]);

    if (error) {
      console.error('Supabase insert error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Insert failed', details: error.message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, inserted: data }),
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unexpected error', details: err.message }),
    };
  }
};
