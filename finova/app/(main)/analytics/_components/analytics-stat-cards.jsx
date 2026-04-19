"use client";

import { TrendingUp, TrendingDown, PiggyBank, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrency } from "@/components/currency-provider";

export default function AnalyticsStatCards({ data }) {
  const { formatCurrency } = useCurrency();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <Card>
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Income (90d)</span>
            <div className="bg-green-100 p-2 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-4">
            {formatCurrency(data.totalIncome)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Expenses (90d)</span>
            <div className="bg-red-100 p-2 rounded-full">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-4">
            {formatCurrency(data.totalExpenses)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Savings Rate</span>
            <div className="bg-blue-100 p-2 rounded-full">
              <PiggyBank className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-4">{data.savingsRate}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Transactions Processed</span>
            <div className="bg-purple-100 p-2 rounded-full">
              <Activity className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-4">{data.transactionCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}
