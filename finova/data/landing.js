import {
  BarChart3,
  Receipt,
  PieChart,
  RefreshCw,
  Shield,
  Zap,
  UserPlus,
  PlusCircle,
  LineChart,
} from "lucide-react";

export const statsData = [
  { value: "50K+", label: "Active Users" },
  { value: "$2B+", label: "Transactions Tracked" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9/5", label: "User Rating" },
];

export const featuresData = [
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    title: "Advanced Analytics",
    description:
      "Get detailed insights into your spending patterns with interactive charts and comprehensive financial reports.",
  },
  {
    icon: <Receipt className="h-8 w-8 text-blue-600" />,
    title: "Smart Receipt Scanner",
    description:
      "AI-powered receipt scanning automatically extracts transaction details, saving you time on manual data entry.",
  },
  {
    icon: <PieChart className="h-8 w-8 text-blue-600" />,
    title: "Budget Planning",
    description:
      "Set and track budgets across different categories to stay in control of your monthly spending.",
  },
  {
    icon: <RefreshCw className="h-8 w-8 text-blue-600" />,
    title: "Recurring Transactions",
    description:
      "Automate your regular income and expenses with smart recurring transaction scheduling.",
  },
  {
    icon: <Shield className="h-8 w-8 text-blue-600" />,
    title: "Secure Platform",
    description:
      "Bank-level security with end-to-end encryption keeps your financial data safe and private.",
  },
  {
    icon: <Zap className="h-8 w-8 text-blue-600" />,
    title: "Real-time Updates",
    description:
      "Instant transaction updates and live balance tracking so you always know where your money stands.",
  },
];

export const howItWorksData = [
  {
    icon: <UserPlus className="h-8 w-8 text-blue-600" />,
    title: "Create Your Account",
    description:
      "Sign up in seconds and set up your financial accounts to start tracking your money immediately.",
  },
  {
    icon: <PlusCircle className="h-8 w-8 text-blue-600" />,
    title: "Add Your Transactions",
    description:
      "Manually add transactions or use our AI scanner to capture receipts and log expenses automatically.",
  },
  {
    icon: <LineChart className="h-8 w-8 text-blue-600" />,
    title: "Analyze and Optimize",
    description:
      "Review your financial reports, identify trends, and make smarter decisions about your spending.",
  },
];

export const testimonialsData = [
  {
    quote:
      "Finova completely transformed how I manage my finances. The AI receipt scanner alone saves me hours every month.",
    author: "James Mitchell",
    role: "Software Engineer",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    quote:
      "The budget tracking features are incredibly intuitive. I finally feel in control of my spending habits.",
    author: "Sarah Thompson",
    role: "Marketing Director",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    quote:
      "I love how Finova gives me a complete picture of my financial health. The analytics are detailed yet easy to understand.",
    author: "David Chen",
    role: "Small Business Owner",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
  },
];
