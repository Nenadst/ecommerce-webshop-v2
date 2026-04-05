'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/shared/contexts/CartContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import Spinner from '@/shared/components/spinner/Spinner';
import Button from '@/shared/components/elements/Button';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  checkoutValidationSchema,
  type CheckoutFormData,
} from '@/shared/validation/checkout.validation';

const inputClass = (hasError: boolean) =>
  `w-full px-4 py-3 border rounded-xl text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
    hasError ? 'border-red-400 bg-red-50' : 'border-slate-200'
  }`;

const Checkout = () => {
  const { cartItems, total, itemCount, loading, mounted } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validatedSteps, setValidatedSteps] = useState<Set<number>>(new Set());

  const nameParts = user?.name?.split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const {
    register,
    formState: { errors },
    trigger,
    getValues,
    reset,
    watch,
    clearErrors,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutValidationSchema),
    defaultValues: {
      email: user?.email || '',
      phone: '',
      firstName,
      lastName,
      address: '',
      city: '',
      postalCode: '',
      country: 'Portugal',
      paymentMethod: 'card',
    },
    mode: 'onBlur',
  });

  const formData = watch();
  const selectedCountry = watch('country');

  const postalCodePlaceholders: Record<string, string> = {
    Portugal: '1234-567',
    Belgium: '1234',
  };

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        firstName,
        lastName,
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Portugal',
        paymentMethod: 'card',
      });
    }
  }, [user, firstName, lastName, reset]);

  useEffect(() => {
    const postalCodeValue = getValues('postalCode');
    if (postalCodeValue) {
      trigger('postalCode');
    } else {
      clearErrors('postalCode');
    }
  }, [selectedCountry, clearErrors, trigger, getValues]);

  const handleNextStep = async () => {
    const isValid = await trigger();
    if (isValid) {
      setValidatedSteps((prev) => new Set(prev).add(currentStep));
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    } else {
      toast.error('Please fill in all required fields correctly');
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePlaceOrder = async () => {
    const isValid = await trigger();
    if (!isValid) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsProcessing(true);

    try {
      const formValues = getValues();
      const items = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      const shippingInfo = {
        email: formValues.email,
        phone: formValues.phone,
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        address: formValues.address,
        city: formValues.city,
        postalCode: formValues.postalCode,
        country: formValues.country,
      };

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shippingInfo, userId: user?.id || null }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout session');
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to start checkout. Please try again.';
      toast.error(message);
      setIsProcessing(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-slate-100 p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
            <svg
              className="w-9 h-9 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-slate-900 text-xl font-bold mb-2">Your Cart is Empty</h2>
          <p className="text-slate-500 text-sm mb-6">
            Add some items to your cart before checkout.
          </p>
          <Link href="/products">
            <Button className="bg-amber-500 hover:bg-amber-400 text-white px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-amber-500/30">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const shippingCost = 0;
  const tax = total * 0.23;
  const orderTotal = total + shippingCost + tax;

  const steps = [
    { num: 1, label: 'Shipping' },
    { num: 2, label: 'Payment' },
    { num: 3, label: 'Review' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Page header */}
      <div className="bg-slate-900 border-b border-slate-800/60">
        <div className="container mx-auto px-4 lg:px-16 py-8">
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-1">
            Checkout
          </p>
          <h1 className="text-white text-2xl font-bold">Complete Your Order</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-16 py-8">
        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => {
            const isAccessible = step.num <= currentStep || validatedSteps.has(step.num - 1);
            const isDone = currentStep > step.num;
            const isActive = currentStep === step.num;
            return (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!isAccessible) return;
                      if (step.num > currentStep) {
                        const isValid = await trigger();
                        if (isValid) {
                          setValidatedSteps((prev) => new Set(prev).add(currentStep));
                          setCurrentStep(step.num);
                        } else {
                          toast.error('Please fill in all required fields correctly');
                        }
                      } else {
                        setCurrentStep(step.num);
                      }
                    }}
                    disabled={!isAccessible}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-110'
                        : isDone
                          ? 'bg-green-500 text-white cursor-pointer hover:scale-110'
                          : isAccessible
                            ? 'bg-amber-500/20 text-amber-600 border border-amber-300 cursor-pointer hover:bg-amber-500 hover:text-white'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isDone ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.num
                    )}
                  </button>
                  <span
                    className={`mt-1.5 text-xs font-semibold ${isActive ? 'text-amber-600' : isDone ? 'text-green-600' : 'text-slate-400'}`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={`w-20 h-0.5 mx-2 mb-5 transition-all ${isDone || validatedSteps.has(step.num) ? 'bg-green-400' : 'bg-slate-200'}`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8">
              {/* Step 1: Shipping */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-slate-900 text-lg font-bold mb-6">Shipping Information</h2>

                  <div className="space-y-6">
                    {/* Contact */}
                    <div>
                      <h3 className="text-slate-700 text-sm font-bold uppercase tracking-wider mb-4">
                        Contact
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            {...register('email')}
                            className={inputClass(!!errors.email)}
                            placeholder="your@email.com"
                          />
                          {errors.email && (
                            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            {...register('phone')}
                            className={inputClass(!!errors.phone)}
                            placeholder="+351123456789"
                          />
                          {errors.phone && (
                            <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <h3 className="text-slate-700 text-sm font-bold uppercase tracking-wider mb-4">
                        Shipping Address
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                              First Name *
                            </label>
                            <input
                              type="text"
                              {...register('firstName')}
                              className={inputClass(!!errors.firstName)}
                            />
                            {errors.firstName && (
                              <p className="mt-1 text-xs text-red-500">
                                {errors.firstName.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                              Last Name *
                            </label>
                            <input
                              type="text"
                              {...register('lastName')}
                              className={inputClass(!!errors.lastName)}
                            />
                            {errors.lastName && (
                              <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            {...register('address')}
                            className={inputClass(!!errors.address)}
                            placeholder="123 Main Street"
                          />
                          {errors.address && (
                            <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                              City *
                            </label>
                            <input
                              type="text"
                              {...register('city')}
                              className={inputClass(!!errors.city)}
                            />
                            {errors.city && (
                              <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                              Postal Code *
                            </label>
                            <input
                              type="text"
                              {...register('postalCode')}
                              className={inputClass(!!errors.postalCode)}
                              placeholder={postalCodePlaceholders[selectedCountry] || '1234-567'}
                            />
                            {errors.postalCode && (
                              <p className="mt-1 text-xs text-red-500">
                                {errors.postalCode.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                              Country *
                            </label>
                            <select
                              {...register('country')}
                              className={inputClass(!!errors.country)}
                            >
                              <option value="Portugal">Portugal</option>
                              <option value="Belgium">Belgium</option>
                            </select>
                            {errors.country && (
                              <p className="mt-1 text-xs text-red-500">{errors.country.message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isAuthenticated && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="saveInfo"
                          id="saveInfo"
                          className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-sm text-slate-600">
                          Save this information for next time
                        </span>
                      </label>
                    )}
                  </div>

                  <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-100">
                    <Link href="/cart">
                      <Button className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors flex items-center gap-1">
                        ← Back to Cart
                      </Button>
                    </Link>
                    <Button
                      onClick={handleNextStep}
                      className="bg-amber-500 hover:bg-amber-400 text-white px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-amber-500/30"
                    >
                      Continue to Payment →
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-slate-900 text-lg font-bold mb-6">Payment Method</h2>

                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-amber-200">
                          <svg
                            className="w-6 h-6 text-amber-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 mb-1">
                            Secure Payment via Stripe
                          </h3>
                          <p className="text-slate-600 text-sm mb-3">
                            You&apos;ll be redirected to Stripe&apos;s secure checkout to enter your
                            payment details.
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <svg
                                className="w-3.5 h-3.5 text-green-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              PCI-DSS Compliant
                            </span>
                            <span className="flex items-center gap-1">
                              <svg
                                className="w-3.5 h-3.5 text-green-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              SSL Encrypted
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        Accepted Cards
                      </p>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-semibold">
                          Visa
                        </span>
                        <span className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-semibold">
                          Mastercard
                        </span>
                        <span className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-semibold">
                          Amex
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-100">
                    <Button
                      onClick={handlePreviousStep}
                      className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
                    >
                      ← Back
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      className="bg-amber-500 hover:bg-amber-400 text-white px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-amber-500/30"
                    >
                      Review Order →
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-slate-900 text-lg font-bold mb-6">Review Your Order</h2>

                  <div className="space-y-4">
                    {/* Shipping summary */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-slate-700 text-sm font-bold">Shipping To</h3>
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="text-amber-500 hover:text-amber-600 text-xs font-semibold transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="text-slate-600 text-sm leading-relaxed">
                        <p className="font-medium text-slate-900">
                          {formData.firstName} {formData.lastName}
                        </p>
                        <p>{formData.address}</p>
                        <p>
                          {formData.city}, {formData.postalCode} · {formData.country}
                        </p>
                        <p className="mt-1 text-slate-500">
                          {formData.email} · {formData.phone}
                        </p>
                      </div>
                    </div>

                    {/* Payment summary */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-slate-700 text-sm font-bold">Payment Method</h3>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="text-amber-500 hover:text-amber-600 text-xs font-semibold transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-slate-600 text-sm">Stripe Secure Checkout</p>
                    </div>

                    {/* Items */}
                    <div>
                      <h3 className="text-slate-700 text-sm font-bold mb-3">Order Items</h3>
                      <div className="space-y-2">
                        {cartItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-xl p-3"
                          >
                            <div className="w-14 h-14 bg-white rounded-xl border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              <Image
                                src={item.product?.images?.[0] || '/assets/img/no-product.png'}
                                alt={item.product?.name || 'Product'}
                                width={56}
                                height={56}
                                className="object-contain p-1"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-slate-900 text-sm font-medium truncate">
                                {item.product?.name}
                              </p>
                              <p className="text-slate-400 text-xs mt-0.5">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-slate-900 font-bold text-sm whitespace-nowrap">
                              €{((item.product?.price || 0) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-100">
                    <Button
                      onClick={handlePreviousStep}
                      className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
                    >
                      ← Back
                    </Button>
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="bg-green-500 hover:bg-green-400 text-white px-6 py-2.5 text-sm font-bold rounded-xl transition-colors shadow-sm shadow-green-500/30 disabled:opacity-60"
                    >
                      {isProcessing ? 'Redirecting to Stripe...' : `Pay €${orderTotal.toFixed(2)}`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-24">
              <h2 className="text-slate-900 text-base font-bold mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                {cartItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm py-1.5">
                    <span className="text-slate-600 truncate mr-3">
                      <span className="font-semibold text-slate-900">{item.quantity}×</span>{' '}
                      {item.product?.name}
                    </span>
                    <span className="font-semibold text-slate-900 whitespace-nowrap">
                      €{((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                {cartItems.length > 3 && (
                  <p className="text-xs text-slate-400 italic">
                    +{cartItems.length - 3} more {cartItems.length - 3 === 1 ? 'item' : 'items'}
                  </p>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2.5">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-medium text-slate-700">€{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>VAT (23%)</span>
                  <span className="font-medium text-slate-700">€{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-xl text-slate-900">€{orderTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                {[
                  { icon: '🔒', text: 'SSL Encrypted Checkout' },
                  { icon: '🚚', text: 'Free shipping on this order' },
                  { icon: '↩️', text: 'Easy 30-day returns' },
                ].map((badge) => (
                  <div key={badge.text} className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{badge.icon}</span>
                    <span>{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
