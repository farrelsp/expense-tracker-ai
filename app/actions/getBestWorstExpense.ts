"use server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

async function getBestWorstExpense(): Promise<{
  bestExpense?: number;
  worstExpense?: number;
  error?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { error: "User not found" };
  }

  try {
    const records = await db.record.findMany({
      where: { userId },
      select: { amount: true }, // Fetch only the `amount` field
    });

    if (!records || records.length === 0) {
      return { bestExpense: 0, worstExpense: 0 }; // Return 0 if no records found
    }

    const amounts = records.map((record) => record.amount);
    const bestExpense = Math.max(...amounts);
    const worstExpense = Math.min(...amounts);

    return { bestExpense, worstExpense };
  } catch (error) {
    console.error("❌ Error fetching records:", error);
    return { error: "Database error" };
  }
}

export default getBestWorstExpense;
