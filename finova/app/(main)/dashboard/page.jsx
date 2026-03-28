import { Suspense } from "react";
import { BarLoader } from "react-spinners";
import { getUserAccounts } from "@/actions/dashboard";
import { getDashboardData } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import AccountCard from "./_components/account-card";
import BudgetProgress from "./_components/budget-progress";
import DashboardOverview from "./_components/transaction-overview";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const accounts = await getUserAccounts();
  const transactions = await getDashboardData();

  const defaultAccount = accounts?.find((account) => account.isDefault);

  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <div className="space-y-8">
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses ?? 0}
        />
      )}

      <Suspense fallback={<BarLoader width="100%" color="#6366f1" />}>
        <DashboardOverview
          accounts={accounts}
          transactions={transactions || []}
        />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5 pb-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts?.length > 0 &&
          accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
      </div>
    </div>
  );
}
