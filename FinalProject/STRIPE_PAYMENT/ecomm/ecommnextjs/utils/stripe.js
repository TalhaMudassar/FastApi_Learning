import { loadStripe } from "@stripe/stripe-js";

/**
 * Singleton Stripe client loader.
 * Ensures loadStripe is called only once per browser session.
 */
let stripePromise = null;

export const getStripe = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.error(
      "Stripe Error: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined in environment variables."
    );
    return null;
  }

  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

/**
 * Modern, high-end Stripe Elements appearance configuration.
 * Styled to look sleek, secure, and professional like real-world premium checkout portals.
 */
export const stripeElementsAppearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#4f46e5", // Indigo-600
    colorBackground: "#ffffff",
    colorText: "#1e293b", // Slate-800
    colorDanger: "#ef4444", // Red-500
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    spacingUnit: "4px",
    borderRadius: "10px",
    fontSizeBase: "15px",
    colorTextPlaceholder: "#94a3b8", // Slate-400
  },
  rules: {
    ".Input": {
      padding: "12px 14px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    },
    ".Input:focus": {
      borderColor: "#6366f1",
      boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.15)",
    },
    ".Input--invalid": {
      borderColor: "#ef4444",
      boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.1)",
    },
    ".Label": {
      fontWeight: "500",
      fontSize: "13px",
      color: "#475569",
      marginBottom: "6px",
      letterSpacing: "0.01em",
    },
    ".Tab": {
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      padding: "10px 14px",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
    },
    ".Tab:hover": {
      borderColor: "#cbd5e1",
      backgroundColor: "#f8fafc",
    },
    ".Tab--selected": {
      borderColor: "#6366f1",
      backgroundColor: "#f5f3ff",
      color: "#4f46e5",
      boxShadow: "0 0 0 1px #6366f1",
    },
    ".Block": {
      borderRadius: "10px",
    },
    ".ErrorMessage": {
      fontSize: "13px",
      color: "#ef4444",
      marginTop: "6px",
    },
  },
};

export default getStripe;
