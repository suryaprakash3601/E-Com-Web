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
import StarIcon from '@mui/icons-material/Star';
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

// Format helpers
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

const getCardBrand = (num) => {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'VISA';
  if (/^5[1-5]/.test(n)) return 'MASTERCARD';
  if (/^3[47]/.test(n)) return 'AMEX';
  return null;
};

const CardLogos = ({ active }) => (
  <Stack direction="row" spacing={0.8} alignItems="center">
    {['VISA', 'MASTERCARD', 'AMEX'].map((brand) => (
      <Box
        key={brand}
        sx={{
          px: 1,
          py: 0.4,
          border: '1.5px solid',
          borderColor: active === brand ? 'secondary.main' : 'grey.300',
          borderRadius: 2,
          opacity: active && active !== brand ? 0.35 : 1,
          transition: 'all 0.2s',
          bgcolor: 'white',
          fontSize: '9px',
          fontWeight: 800,
          color: brand === 'VISA' ? '#1A1F71' : brand === 'MASTERCARD' ? '#EB001B' : '#2E77BC',
          letterSpacing: 0.5,
          minWidth: 40,
          textAlign: 'center',
        }}
      >
        {brand === 'MASTERCARD' ? 'MC' : brand}
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
  const [orderReceipt, setOrderReceipt] = useState(null);

  // Card form state (for dev mode premium UI)
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardErrors, setCardErrors] = useState({});

  const userId = isAuthenticated() && isAuthenticated().user._id;
  const token = isAuthenticated() && isAuthenticated().token;
  const brand = getCardBrand(cardNumber);

  // Fetch payment token
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

  // Save order details to DB
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
          setOrderReceipt({
            transactionId: paymentResponse.transaction.id,
            amount: paymentResponse.transaction.amount,
            address: data.address,
            products: [...products],
            date: new Date().toLocaleDateString('en-US', { dateStyle: 'long' }),
          });
          setData({ loading: false, success: true, clientToken: data.clientToken, instance: {}, address: '', error: '' });
        });
      })
      .catch(() => setData((p) => ({ ...p, loading: false, error: 'Order could not be saved. Please contact support.' })));
  };

  // Dev mode credit card checkout validations
  const validateCard = () => {
    const errs = {};
    if (!cardName.trim()) errs.cardName = 'Cardholder name is required';
    if (cardNumber.replace(/\s/g, '').length < 16) errs.cardNumber = 'Enter a valid 16-digit card number';
    const [mm] = expiry.replace(' ', '').split('/');
    if (!expiry || expiry.replace(/\s|\/|\//g, '').length < 4 || parseInt(mm) > 12 || parseInt(mm) < 1)
      errs.expiry = 'Enter expiry (MM / YY)';
    if (cvv.length < 3) errs.cvv = 'CVV must be 3-4 digits';
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

  // Real Braintree payment
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

  // Visual Interactive Credit Card Preview
  const renderVisualCreditCard = () => {
    return (
      <Box
        sx={{
          width: '100%',
          height: 180,
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: 4,
          p: 3,
          color: 'white',
          position: 'relative',
          mb: 3,
          boxShadow: '0 8px 24px -8px rgba(15, 23, 42, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Background details */}
        <Box sx={{ position: 'absolute', right: -25, top: -25, width: 130, height: 130, borderRadius: '50%', bgcolor: 'rgba(255,153,0,0.1)' }} />
        <Box sx={{ position: 'absolute', left: -30, bottom: -30, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)' }} />
        
        {/* Card branding */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ zIndex: 1 }}>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.6, letterSpacing: 1.5, textTransform: 'uppercase', fontSize: '0.65rem' }}>Secure Checkout</Typography>
            <Typography variant="h6" fontWeight={800} sx={{ mt: -0.5, color: 'secondary.main', fontSize: '1rem' }}>ShopZone Pay</Typography>
          </Box>
          <Typography variant="h6" fontWeight={900} sx={{ fontStyle: 'italic', opacity: 0.95 }}>
            {brand || 'SECURE'}
          </Typography>
        </Stack>

        {/* Golden Contactless Chip */}
        <Box sx={{ width: 34, height: 26, bgcolor: '#ffaa00', borderRadius: 1.2, zIndex: 1, position: 'relative', display: 'flex', border: '1px solid rgba(0,0,0,0.15)' }}>
          <Box sx={{ flex: 1, borderRight: '1px solid rgba(0,0,0,0.2)' }} />
          <Box sx={{ flex: 1, borderRight: '1px solid rgba(0,0,0,0.2)' }} />
          <Box sx={{ flex: 1 }} />
        </Box>

        {/* Spaced Card Number */}
        <Typography
          variant="h5"
          fontWeight={600}
          sx={{
            fontFamily: 'Courier New, monospace',
            letterSpacing: 2.5,
            zIndex: 1,
            my: 1,
            textAlign: 'center',
            fontSize: '1.25rem'
          }}
        >
          {cardNumber || '•••• •••• •••• ••••'}
        </Typography>

        {/* Card Holder & Expiry details */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ zIndex: 1 }}>
          <Box sx={{ maxWidth: '70%', overflow: 'hidden' }}>
            <Typography variant="caption" sx={{ opacity: 0.5, fontSize: '0.6rem', textTransform: 'uppercase' }}>Card Holder</Typography>
            <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ textTransform: 'uppercase', mt: -0.5, fontSize: '0.8rem' }}>
              {cardName || 'YOUR NAME'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ opacity: 0.5, fontSize: '0.6rem', textTransform: 'uppercase' }}>Expires</Typography>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mt: -0.5, fontSize: '0.8rem' }}>
              {expiry || 'MM / YY'}
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  };

  // Visual Card Payment Form (Dev Test Mode)
  const showDevPaymentForm = () =>
    isDevMode && !!data.clientToken && products.length > 0 && (
      <Box sx={{ mt: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={800} color="text.primary">
            Card Details
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <LockIcon sx={{ fontSize: 13, color: 'success.main' }} />
            <Typography variant="caption" color="success.main" fontWeight={700}>
              Encrypted SSL
            </Typography>
          </Stack>
        </Stack>

        {/* Render Card Preview */}
        {renderVisualCreditCard()}

        {/* Card Logos */}
        <Box sx={{ mb: 2.5 }}>
          <CardLogos active={brand} />
        </Box>

        {/* Card Number Input */}
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
                <CreditCardIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Cardholder Name Input */}
        <TextField
          label="Cardholder Name"
          fullWidth
          value={cardName}
          onChange={(e) => {
            setCardName(e.target.value);
            setCardErrors((p) => ({ ...p, cardName: '' }));
          }}
          placeholder="Name on Credit Card"
          error={!!cardErrors.cardName}
          helperText={cardErrors.cardName}
          sx={{ mb: 2 }}
        />

        {/* Expiry + CVV */}
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
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

        <Divider sx={{ my: 2.5 }} />

        {/* Delivery Address */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="subtitle2" fontWeight={700}>Delivery Address</Typography>
        </Stack>
        <TextField
          label="Full Delivery Address"
          placeholder="Apartment/House no., Street name, City, State, PIN code"
          fullWidth
          multiline
          minRows={2.5}
          value={data.address}
          onChange={(e) => {
            handleAddress(e);
            setCardErrors((p) => ({ ...p, address: '' }));
          }}
          error={!!cardErrors.address}
          helperText={cardErrors.address}
          sx={{ mb: 3 }}
        />

        {/* Order Summary banner */}
        <Paper
          variant="outlined"
          sx={{ px: 2.5, py: 2, mb: 2.5, borderRadius: 3, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Total Items ({products.length})
            </Typography>
            <Typography variant="subtitle1" fontWeight={800} color="primary.main">
              Total: ${getTotal().toFixed(2)}
            </Typography>
          </Stack>
        </Paper>

        {/* Secure checkout pay action button */}
        <Button
          onClick={devBuy}
          variant="contained"
          color="secondary"
          fullWidth
          disabled={data.loading}
          size="large"
          sx={{
            py: 1.8,
            fontSize: '1rem',
            fontWeight: 800,
            borderRadius: 3,
            color: 'white',
          }}
        >
          {data.loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <Stack direction="row" alignItems="center" spacing={1}>
              <LockIcon sx={{ fontSize: 18 }} />
              <span>Pay ${getTotal().toFixed(2)} Securely</span>
            </Stack>
          )}
        </Button>

        {/* PCI DSS labels */}
        <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <ShieldIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" fontWeight={500}>256-bit SSL</Typography>
          </Stack>
          <Typography variant="caption" color="text.disabled">|</Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <LockIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" fontWeight={500}>PCI Compliant</Typography>
          </Stack>
        </Stack>
      </Box>
    );

  // Real Braintree Drop-In
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
            mt: 2, py: 1.8, fontSize: '1rem', fontWeight: 800, borderRadius: 3,
          }}
        >
          {data.loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <Stack direction="row" alignItems="center" spacing={1}>
              <LockIcon sx={{ fontSize: 18 }} />
              <span>Pay ${getTotal().toFixed(2)} Securely</span>
            </Stack>
          )}
        </Button>
      </Box>
    );

  // Success Screen / Confetti Emojis / Receipt Invoice
  const showSuccess = () =>
    data.success && (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        {/* Animated Checked Circle Backdrop */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'success.light',
            color: 'success.dark',
            mb: 3,
            boxShadow: '0 8px 24px -4px rgba(46, 125, 50, 0.25)',
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 44 }} />
        </Box>

        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: 'success.dark' }}>
          🎉 Thank You for Your Order! 🙏💖
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 450, mx: 'auto', lineHeight: 1.6 }}>
          Your payment was processed successfully. 🚀 Your cart has been emptied, and our dispatch team is already preparing your package! 📦💨
        </Typography>

        {orderReceipt && (
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 4,
              borderColor: 'grey.300',
              textAlign: 'left',
              bgcolor: 'grey.50',
              maxWidth: 500,
              mx: 'auto',
              mb: 4,
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            }}
          >
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
              🧾 Billing Receipt
            </Typography>

            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block">TRANSACTION ID</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ wordBreak: 'break-all' }}>{orderReceipt.transactionId}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" display="block">DATE</Typography>
                <Typography variant="body2" fontWeight={700}>{orderReceipt.date}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" display="block">TOTAL PAID</Typography>
                <Typography variant="body2" fontWeight={700} color="secondary.main">${orderReceipt.amount.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" display="block">SHIPPING ADDRESS</Typography>
                <Typography variant="body2" fontWeight={700}>{orderReceipt.address}</Typography>
              </Grid>
            </Grid>

            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>ITEMS PURCHASED</Typography>
            <Stack spacing={1}>
              {orderReceipt.products.map((p, idx) => (
                <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center" sx={{ bgcolor: 'white', px: 1.5, py: 1, borderRadius: 2, border: '1px solid', borderColor: 'grey.100' }}>
                  <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: '75%' }}>
                    {p.name} <Typography variant="caption" color="text.secondary">x{p.count}</Typography>
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    ${(p.price * p.count).toFixed(2)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        )}

        <Button
          component={Link}
          to="/shop"
          variant="contained"
          color="primary"
          size="large"
          sx={{
            py: 1.8,
            px: 4,
            fontWeight: 800,
            borderRadius: 3,
            boxShadow: '0 8px 24px -6px rgba(15,23,42,0.3)',
          }}
        >
          Continue Shopping
        </Button>
      </Box>
    );

  // Main Render
  return (
    <Box>
      {/* Header */}
      {!data.success && (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={800}>
              Order Summary
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <LockIcon sx={{ fontSize: 13, color: 'success.main' }} />
              <Typography variant="caption" color="success.main" fontWeight={700}>
                Secure Checkout
              </Typography>
            </Stack>
          </Stack>
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
            <Typography variant="body2" fontWeight={700}>${getTotal().toFixed(2)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Shipping</Typography>
            <Typography variant="body2" color="success.main" fontWeight={700}>FREE</Typography>
          </Stack>
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={800}>Total</Typography>
            <Typography variant="subtitle1" fontWeight={800} color="secondary.main">
              ${getTotal().toFixed(2)}
            </Typography>
          </Stack>
        </>
      )}

      {/* Token loading */}
      {tokenLoading && (
        <Stack alignItems="center" sx={{ my: 4 }}>
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Initialising secure payment gateway...
          </Typography>
        </Stack>
      )}

      {/* Error */}
      {data.error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {data.error}
        </Alert>
      )}

      {/* Checkout Forms / Success Screen */}
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
          state={{ from: '/cart' }}
          variant="contained"
          fullWidth
          size="large"
          sx={{ mt: 2, py: 1.5, borderRadius: 3, fontWeight: 700 }}
        >
          Sign in to Checkout
        </Button>
      )}
    </Box>
  );
};

export default Checkout;
