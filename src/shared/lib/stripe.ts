import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!_stripe) {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not defined');
      }
      _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-09-30.clover',
        typescript: true,
      });
    }
    const value = (_stripe as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? value.bind(_stripe) : value;
  },
});
