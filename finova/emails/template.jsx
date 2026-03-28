import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Section,
} from "@react-email/components";

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  title: {
    color: "#1a1a2e",
    fontSize: "32px",
    fontWeight: "bold",
    textAlign: "center",
    margin: "0 0 20px",
  },
  heading: {
    color: "#1a1a2e",
    fontSize: "20px",
    fontWeight: "600",
    margin: "0 0 10px",
  },
  text: {
    color: "#4a4a4a",
    fontSize: "16px",
    margin: "0 0 16px",
  },
  statsContainer: {
    margin: "32px 0",
    padding: "20px",
    backgroundColor: "#f8fafc",
    borderRadius: "5px",
    border: "1px solid #e2e8f0",
  },
  statRow: {
    marginBottom: "12px",
    padding: "12px",
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
};

export default function EmailTemplate({
  userName = "",
  type = "budget-alert",
  data = {},
}) {
  if (type === "monthly-report") {
    return (
      <Html>
        <Head />
        <Preview>Your Monthly Financial Report</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>Monthly Financial Report</Heading>
            <Text style={styles.text}>Hello {userName},</Text>
            <Text style={styles.text}>
              Here is your financial summary for {data.month}.
            </Text>

            <Section style={styles.statsContainer}>
              <Heading style={styles.heading}>Summary</Heading>
              <div style={styles.statRow}>
                <Text style={styles.text}>
                  Total Income: ${data.stats?.totalIncome?.toFixed(2)}
                </Text>
              </div>
              <div style={styles.statRow}>
                <Text style={styles.text}>
                  Total Expenses: ${data.stats?.totalExpenses?.toFixed(2)}
                </Text>
              </div>
              <div style={styles.statRow}>
                <Text style={styles.text}>
                  Net:{" "}
                  $
                  {(
                    (data.stats?.totalIncome || 0) -
                    (data.stats?.totalExpenses || 0)
                  ).toFixed(2)}
                </Text>
              </div>
            </Section>

            {data.stats?.byCategory &&
              Object.keys(data.stats.byCategory).length > 0 && (
                <Section style={styles.statsContainer}>
                  <Heading style={styles.heading}>Expenses by Category</Heading>
                  {Object.entries(data.stats.byCategory).map(
                    ([category, amount]) => (
                      <div
                        key={category}
                        style={{
                          ...styles.statRow,
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={styles.text}>{category}</Text>
                        <Text style={styles.text}>${amount.toFixed(2)}</Text>
                      </div>
                    )
                  )}
                </Section>
              )}

            {data.insights && data.insights.length > 0 && (
              <Section style={styles.statsContainer}>
                <Heading style={styles.heading}>Finova AI Insights</Heading>
                {data.insights.map((insight, index) => (
                  <Text key={index} style={styles.text}>
                    &bull; {insight}
                  </Text>
                ))}
              </Section>
            )}
          </Container>
        </Body>
      </Html>
    );
  }

  // Default: budget-alert
  return (
    <Html>
      <Head />
      <Preview>Budget Alert</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.title}>Budget Alert</Heading>
          <Text style={styles.text}>Hello {userName},</Text>
          <Text style={styles.text}>
            You have used {data.percentUsed?.toFixed(1)}% of your monthly
            budget.
          </Text>

          <Section style={styles.statsContainer}>
            <div style={styles.statRow}>
              <Text style={styles.text}>
                Budget Amount: ${data.budgetAmount?.toFixed(2)}
              </Text>
            </div>
            <div style={styles.statRow}>
              <Text style={styles.text}>
                Spent So Far: ${data.totalExpenses?.toFixed(2)}
              </Text>
            </div>
            <div style={styles.statRow}>
              <Text style={styles.text}>
                Remaining: $
                {(
                  (data.budgetAmount || 0) - (data.totalExpenses || 0)
                ).toFixed(2)}
              </Text>
            </div>
          </Section>

          <Text style={styles.text}>
            Consider reviewing your spending to stay on track with your
            financial goals.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
