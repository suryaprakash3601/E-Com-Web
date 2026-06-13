import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Stack,
  Paper,
  Divider,
  InputAdornment,
  Grid,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShieldIcon from '@mui/icons-material/Shield';
import {
  getBraintreeClientToken,
  processPayment,
  createOrder,
} from './apiCore';
import { emptyCart } from './cartHelpers';
import { isAuthenticated } from '../auth';
import { Link } from 'react-router-dom';
import DropIn from 'braintree-web-drop-in-react';

const DEV_TOKEN = 'dev-test-mode-token';

// ─── Utility: format card number with spaces ──────────────────────────────────
const formatCardNumber = (val) =>
  val
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();

const formatExpiry = (val) => {
  const cleaned = val.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length >= 3) return cleaned.slice(0, 2) + ' / ' + cleaned.slice(2);
  return cleaned;
};

// ─── Card brand detector ──────────────────────────────────────────────────────
const getCardBrand = (num) => {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'VISA';
  if (/^5[1-5]/.test(n)) return 'MC';
  if (/^3[47]/.test(n)) return 'AMEX';
  return null;
};

// ─── Visual card brand logos ──────────────────────────────────────────────────
const CardLogos = ({ active }) => (
  <Stack direction="row" spacing={0.8} alignItems="center">
    {['VISA', 'MC', 'AMEX'].map((brand) => (
      <Box
        key={brand}
        sx={{
          px: 0.8,
          py: 0.3,
          border: '1.5px solid',
          borderColor: active === brand ? 'primary.main' : 'grey.300',
          borderRadius: 1,
          opacity: active && active !== brand ? 0.35 : 1,
          transition: 'all 0.2s',
          bgcolor: 'white',
          fontSize: '10px',
          fontWeight: 800,
          color: brand === 'VISA' ? '#1A1F71' : brand === 'MC' ? '#EB001B' : '#2E77BC',
          letterSpacing: 0.5,
          minWidth: 34,
          textAlign: 'center',
        }}
      >
        {brand}
      </Box>
    ))}
  </Stack>
);

const Checkout = ({ products, setRun = (f) => f, run = undefined }) => {
  const [data, setData] = useState({
    loading: false,
    success: false,
    clientToken: null,
    error: '',
    instance: {},
    address: '',
  });

  const [tokenLoading, setTokenLoading] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);

  // Card form state (for dev mode premium UI)
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardErrors, setCardErrors] = useState({});

  const userId = isAuthenticated() && isAuthenticated().user._id;
  const token = isAuthenticated() && isAuthenticated().token;
  const brand = getCardBrand(cardNumber);

  // ─── Fetch payment token ────────────────────────────────────────────────────
  const getToken = (userId, token) => {
    setTokenLoading(true);
    getBraintreeClientToken(userId, token)
      .then((res) => {
        setTokenLoading(false);
        if (!res) {
          setData((p) => ({ ...p, error: 'Could not connect to payment server. Please try again.' }));
        } else if (res.error) {
          setData((p) => ({ ...p, error: res.error }));
        } else if (!res.clientToken) {
          setData((p) => ({ ...p, error: 'Payment gateway error. Please refresh and try again.' }));
        } else if (res.clientToken === DEV_TOKEN) {
          setIsDevMode(true);
          setData((p) => ({ ...p, clientToken: res.clientToken }));
        } else {
          setIsDevMode(false);
          setData((p) => ({ ...p, clientToken: res.clientToken }));
        }
      })
      .catch(() => {
        setTokenLoading(false);
        setData((p) => ({ ...p, error: 'Failed to load payment form. Please refresh and try again.' }));
      });
  };

  useEffect(() => {
    getToken(userId, token);
  }, []);

  const handleAddress = (e) => setData({ ...data, address: e.target.value });

  const getTotal = () =>
    products.reduce((total, item) => total + item.count * item.price, 0);

  // ─── Shared: create order in DB after any payment ───────────────────────────
  const handleOrderCreation = (paymentResponse) => {
    const createOrderData = {
      products,
      transaction_id: paymentResponse.transaction.id,
      amount: paymentResponse.transaction.amount,
      address: data.address,
    };
    createOrder(userId, token, createOrderData)
      .then(() => {
        emptyCart(() => {
          setRun(!run);
          setData({ loading: false, success: true, clientToken: data.clientToken, instance: {}, address: '', error: '' });
        });
      })
      .catch(() => setData((p) => ({ ...p, loading: false, error: 'Order could not be saved. Please contact support.' })));
  };

  // ─── Dev Mode: validate card form then submit ───────────────────────────────
  const validateCard = () => {
    const errs = {};
    if (!cardName.trim()) errs.cardName = 'Cardholder name is required';
    if (cardNumber.replace(/\s/g, '').length < 16) errs.cardNumber = 'Enter a valid 16-digit card number';
    const [mm] = expiry.replace(' ', '').split('/');
    if (!expiry || expiry.replace(/\s|\/|\//g, '').length < 4 || parseInt(mm) > 12 || parseInt(mm) < 1)
      errs.expiry = 'Enter a valid expiry (MM / YY)';
    if (cvv.length < 3) errs.cvv = 'CVV must be 3 digits';
    if (!data.address.trim()) errs.address = 'Delivery address is required';
    return errs;
  };

  const devBuy = () => {
    const errs = validateCard();
    if (Object.keys(errs).length > 0) {
      setCardErrors(errs);
      return;
    }
    setCardErrors({});
    setData((p) => ({ ...p, loading: true, error: '' }));

    processPayment(userId, token, { paymentMethodNonce: 'dev-secure-nonce', amount: getTotal(products) })
      .then((response) => {
        if (!response || !response.transaction) {
          setData((p) => ({ ...p, loading: false, error: 'Payment could not be processed. Please try again.' }));
          return;
        }
        handleOrderCreation(response);
      })
      .catch(() => setData((p) => ({ ...p, loading: false, error: 'Payment failed. Please try again.' })));
  };

  // ─── Real Braintree payment ─────────────────────────────────────────────────
  const buy = () => {
    setData((p) => ({ ...p, loading: true, error: '' }));
    if (!data.instance || typeof data.instance.requestPaymentMethod !== 'function') {
      setData((p) => ({ ...p, loading: false, error: 'Payment form is not ready. Please wait and try again.' }));
      return;
    }
    try {
      data.instance.requestPaymentMethod()
        .then((res) => {
          processPayment(userId, token, { paymentMethodNonce: res.nonce, amount: getTotal(products) })
            .then((response) => {
              if (!response || response.errors || !response.transaction) {
                setData((p) => ({ ...p, loading: false, error: response?.message || 'Payment failed. Please check your card details.' }));
                return;
              }
              handleOrderCreation(response);
            })
            .catch(() => setData((p) => ({ ...p, loading: false, error: 'Payment processing failed. Please try again.' })));
        })
        .catch((err) => setData((p) => ({ ...p, loading: false, error: err.message || 'Could not process payment. Try again.' })));
    } catch {
      setData((p) => ({ ...p, loading: false, error: 'Payment form error. Please refresh the page.' }));
    }
  };

  // ─── Premium Card Payment UI (dev mode) ────────────────────────────────────
  const showDevPaymentForm = () =>
    isDevMode && !!data.clientToken && products.length > 0 && (
      <Box sx={{ mt: 2 }}>

        {/* Secure Payment Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            Card Details
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <LockIcon sx={{ fontSize: 14, color: 'success.main' }} />
            <Typography variant="caption" color="success.main" fontWeight={600}>
              Secured by SSL
            </Typography>
          </Stack>
        </Stack>

        {/* Card brand logos */}
        <Box sx={{ mb: 2 }}>
          <CardLogos active={brand} />
        </Box>

        {/* Card Number */}
        <TextField
          label="Card Number"
          fullWidth
          value={cardNumber}
          onChange={(e) => {
            setCardNumber(formatCardNumber(e.target.value));
            setCardErrors((p) => ({ ...p, cardNumber: '' }));
          }}
          placeholder="1234 5678 9012 3456"
          error={!!cardErrors.cardNumber}
          helperText={cardErrors.cardNumber}
          inputProps={{ maxLength: 19, inputMode: 'numeric' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CreditCardIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Cardholder Name */}
        <TextField
          label="Cardholder Name"
          fullWidth
          value={cardName}
          onChange={(e) => {
            setCardName(e.target.value);
            setCardErrors((p) => ({ ...p, cardName: '' }));
          }}
          placeholder="Name as on card"
          error={!!cardErrors.cardName}
          helperText={cardErrors.cardName}
          sx={{ mb: 2 }}
        />

        {/* Expiry + CVV */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <TextField
              label="Expiry Date"
              fullWidth
              value={expiry}
              onChange={(e) => {
                setExpiry(formatExpiry(e.target.value));
                setCardErrors((p) => ({ ...p, expiry: '' }));
              }}
              placeholder="MM / YY"
              error={!!cardErrors.expiry}
              helperText={cardErrors.expiry}
              inputProps={{ maxLength: 7, inputMode: 'numeric' }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="CVV"
              fullWidth
              value={cvv}
              onChange={(e) => {
                setCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
                setCardErrors((p) => ({ ...p, cvv: '' }));
              }}
              placeholder="•••"
              type="password"
              error={!!cardErrors.cvv}
              helperText={cardErrors.cvv}
              inputProps={{ maxLength: 4, inputMode: 'numeric' }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Delivery Address */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="subtitle2" fontWeight={600}>Delivery Address</Typography>
        </Stack>
        <TextField
          label="Full Delivery Address"
          placeholder="House no., Street, City, State, PIN"
          fullWidth
          multiline
          minRows={2}
          value={data.address}
          onChange={(e) => {
            handleAddress(e);
            setCardErrors((p) => ({ ...p, address: '' }));
          }}
          error={!!cardErrors.address}
          helperText={cardErrors.address}
          sx={{ mb: 3 }}
        />

        {/* Order Summary Line */}
        <Paper
          variant="outlined"
          sx={{ px: 2, py: 1.5, mb: 2, borderRadius: 2, bgcolor: 'grey.50' }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {products.length} item{products.length > 1 ? 's' : ''}
            </Typography>
            <Typography variant="subtitle1" fontWeight={700}>
              Total: ${getTotal()}
            </Typography>
          </Stack>
        </Paper>

        {/* Pay Button */}
        <Button
          onClick={devBuy}
          variant="contained"
          fullWidth
          disabled={data.loading}
          size="large"
          sx={{
            py: 1.8,
            fontSize: '1rem',
            fontWeight: 700,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)',
            boxShadow: '0 4px 15px rgba(26,115,232,0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1557b0 0%, #0a3880 100%)',
              boxShadow: '0 6px 20px rgba(26,115,232,0.5)',
            },
            letterSpacing: 0.5,
          }}
        >
          {data.loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <Stack direction="row" alignItems="center" spacing={1}>
              <LockIcon sx={{ fontSize: 18 }} />
              <span>Pay ${getTotal()} Securely</span>
            </Stack>
          )}
        </Button>

        {/* Trust badges */}
        <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 2 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <ShieldIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled">256-bit SSL</Typography>
          </Stack>
          <Typography variant="caption" color="text.disabled">|</Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <LockIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled">PCI DSS Compliant</Typography>
          </Stack>
        </Stack>
      </Box>
    );

  // ─── Real Braintree Drop-In UI ──────────────────────────────────────────────
  const showDropIn = () =>
    !isDevMode && !!data.clientToken && products.length > 0 && (
      <Box sx={{ mt: 2 }}>
        <TextField
          label="Full Delivery Address"
          placeholder="House no., Street, City, State, PIN"
          fullWidth
          multiline
          minRows={2}
          value={data.address}
          onChange={handleAddress}
          sx={{ mb: 2 }}
        />
        <DropIn
          options={{ authorization: data.clientToken, paypal: { flow: 'vault' } }}
          onInstance={(instance) => (data.instance = instance)}
        />
        <Button
          onClick={buy}
          variant="contained"
          fullWidth
          disabled={data.loading}
          size="large"
          sx={{
            mt: 2, py: 1.8, fontSize: '1rem', fontWeight: 700, borderRadius: 2,
            background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)',
            boxShadow: '0 4px 15px rgba(26,115,232,0.4)',
            '&:hover': { background: 'linear-gradient(135deg, #1557b0 0%, #0a3880 100%)' },
          }}
        >
          {data.loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <Stack direction="row" alignItems="center" spacing={1}>
              <LockIcon sx={{ fontSize: 18 }} />
              <span>Pay ${getTotal()} Securely</span>
            </Stack>
          )}
        </Button>
      </Box>
    );

  // ─── Success Screen ─────────────────────────────────────────────────────────
  const showSuccess = () =>
    data.success && (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 72, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Payment Successful!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Your order has been confirmed and will be delivered to your address.
        </Typography>
        <Alert severity="success" variant="filled" sx={{ borderRadius: 2, textAlign: 'left' }}>
          🎉 Thank you for your purchase! You will receive an order confirmation shortly.
        </Alert>
      </Box>
    );

  // ─── Main Render ────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Header */}
      {!data.success && (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              Order Summary
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <LockIcon sx={{ fontSize: 14, color: 'success.main' }} />
              <Typography variant="caption" color="success.main" fontWeight={600}>
                Secure Checkout
              </Typography>
            </Stack>
          </Stack>
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
            <Typography variant="body2">${getTotal()}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Shipping</Typography>
            <Typography variant="body2" color="success.main" fontWeight={600}>FREE</Typography>
          </Stack>
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
            <Typography variant="subtitle1" fontWeight={700} color="primary.main">
              ${getTotal()}
            </Typography>
          </Stack>
        </>
      )}

      {/* Token loading */}
      {tokenLoading && (
        <Stack alignItems="center" sx={{ my: 4 }}>
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Initialising secure payment...
          </Typography>
        </Stack>
      )}

      {/* Error */}
      {data.error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {data.error}
        </Alert>
      )}

      {/* Payment / Success */}
      {data.success ? (
        showSuccess()
      ) : isAuthenticated() ? (
        <>
          {showDevPaymentForm()}
          {showDropIn()}
        </>
      ) : (
        <Button
          component={Link}
          to="/signin"
          variant="contained"
          fullWidth
          size="large"
          sx={{ mt: 2, py: 1.5, borderRadius: 2 }}
        >
          Sign in to Checkout
        </Button>
      )}
    </Box>
  );
};

export default Checkout;
