// Single source of truth for all displayed pricing.
export const PRICING = {
  consultation: {
    india:        { amount: 2500,  currency: '₹',   label: '₹2,500'  },
    international:{ amount: 50,    currency: 'USD', label: '$50' },
  },
  combinedHealings: {
    india: { amount: 5000, currency: '₹', label: '₹5,000' },
    international: { amount: 80, currency: 'USD', label: '$80' },
  },
  treatment: {
    india: {
      firstHour:        { amount: 5000, currency: '₹', label: '₹5,000' },
      subsequentHourly: { amount: 3000, currency: '₹', label: '₹3,000' },
    },
    international: {
      firstHour:        { amount: 110, currency: 'USD', label: '$110' },
      subsequentHourly: { amount: 70,  currency: 'USD', label: '$70'  },
    },
  },
};
