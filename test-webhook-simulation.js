// Webhook simulation test
console.log('Testing webhook credit addition simulation...');

// Simulate successful $60 SWMS Pack payment
const webhookData = {
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_simulation_123',
      amount_total: 6000, // $60 in cents
      metadata: {
        userId: '999',
        type: 'one-off'
      }
    }
  }
};

fetch('/api/stripe-webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(webhookData)
})
.then(response => response.json())
.then(data => {
  console.log('Webhook simulation result:', data);
  
  // Check credits after webhook
  return fetch('/api/user/billing');
})
.then(response => response.json())
.then(billing => {
  console.log('Credits after $60 payment:', billing);
})
.catch(error => {
  console.error('Webhook test error:', error);
});