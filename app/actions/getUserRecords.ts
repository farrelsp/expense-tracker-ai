"use server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

async function getUserRecords(): Promise<{
  totalAmount?: number;
  daysWithRecords?: number;
  error?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { error: "User not found" };
  }

  try {
    const records = await db.record.findMany({
      where: { userId },
    });

    const totalAmount = records.reduce((sum, record) => sum + record.amount, 0);
    const daysWithRecords = new Set(
      records
        .filter((record) => record.amount > 0)
        .map((record) => new Date(record.date).toISOString().split("T")[0]) // get YYYY-MM-DD
    ).size;

    return { totalAmount, daysWithRecords };
  } catch (error) {
    console.error("Error fetching user record:", error); // Log the error
    return { error: "Database error" };
  }
}

export default getUserRecords;
