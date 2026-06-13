const braintree = require('braintree');
const { v1: uuidv1 } = require('uuid');
require('dotenv').config();

// ─── DEV MODE DETECTION ──────────────────────────────────────────────────────
// If credentials are still dummy/placeholder, run in Test Mode
// Real Braintree is only used when actual credentials are configured
const isDummyCredentials =
  !process.env.BRAINTREE_MERCHANT_ID ||
  process.env.BRAINTREE_MERCHANT_ID === 'dummy_merchant_id' ||
  process.env.BRAINTREE_MERCHANT_ID === 'your_merchant_id';

const DEV_MODE = isDummyCredentials;

if (DEV_MODE) {
  console.log(
    '⚠️  [Braintree] Running in DEV TEST MODE — no real payment processing.'
  );
  console.log(
    '   To enable real payments, update BRAINTREE_* keys in your .env file.'
  );
} else {
  console.log('✅ [Braintree] Real sandbox credentials detected.');
}

// Only create gateway if we have real credentials
const gateway = DEV_MODE
  ? null
  : new braintree.BraintreeGateway({
      environment: braintree.Environment.Sandbox,
      merchantId: process.env.BRAINTREE_MERCHANT_ID,
      publicKey: process.env.BRAINTREE_PUBLIC_KEY,
      privateKey: process.env.BRAINTREE_PRIVATE_KEY,
    });

// ─── GENERATE TOKEN ──────────────────────────────────────────────────────────
exports.generateToken = (req, res) => {
  if (DEV_MODE) {
    // Return a special dev token so frontend knows to use test mode
    return res.json({
      clientToken: 'dev-test-mode-token',
      devMode: true,
    });
  }

  gateway.clientToken.generate({}, function (err, response) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(response);
    }
  });
};

// ─── PROCESS PAYMENT ─────────────────────────────────────────────────────────
exports.processPayment = (req, res) => {
  if (DEV_MODE) {
    // Simulate a successful Braintree transaction response
    const fakeTransactionId = 'TEST-' + uuidv1().replace(/-/g, '').slice(0, 8).toUpperCase();
    return res.json({
      success: true,
      devMode: true,
      transaction: {
        id: fakeTransactionId,
        amount: req.body.amount,
        status: 'submitted_for_settlement',
        type: 'sale',
        currencyIsoCode: 'USD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }

  gateway.transaction.sale(
    {
      amount: req.body.amount,
      paymentMethodNonce: req.body.paymentMethodNonce,
      options: {
        submitForSettlement: true,
      },
    },
    (error, result) => {
      if (error) {
        res.status(500).json(error);
      } else {
        res.json(result);
      }
    }
  );
};
