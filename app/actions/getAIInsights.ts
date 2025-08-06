"use server";

import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { generateExpenseInsights, AIInsight, ExpenseRecord } from "@/lib/ai";

export async function getAIInsights(): Promise<AIInsight[]> {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not found");
    }

    // Get user's recent expenses (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expenses = await db.record.findMany({
      where: {
        userId: user.clerkUserId,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    if (expenses.length === 0) {
      // Default insights for new users
      return [
        {
          id: "welcome-1",
          type: "info",
          title: "Welcome to ExpenseTracker AI!",
          message:
            "Start adding your expenses to get personalized AI insights about your spending patterns.",
          action: "Add your first expense",
          confidence: 1.0,
        },
        {
          id: "welcome-2",
          type: "tip",
          title: "Track Regularly",
          message:
            "For best results, try to log expenses daily. This helps our AI provide more accurate insights.",
          action: "Set daily reminders",
          confidence: 1.0,
        },
      ];
    }

    // Convert to format expected by AI
    const expenseData: ExpenseRecord[] = expenses.map((expense) => ({
      id: expense.id,
      amount: expense.amount,
      category: expense.category || "Other",
      description: expense.text,
      date: expense.date.toISOString(),
    }));

    // Generate AI insights
    const insights = await generateExpenseInsights(expenseData);
    return insights;
  } catch (error) {
    console.error("Error generating AI insights:", error);

    // Return fallback insights
    return [
      {
        id: "error-1",
        type: "warning",
        title: "Insights Temporarily Unavailable",
        message:
          "We're having trouble analyzing your expenses right now. Please try again in a few minutes.",
        action: "Retry analysis",
        confidence: 0.5,
      },
    ];
  }
}
