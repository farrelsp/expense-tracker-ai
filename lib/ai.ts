import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExpenseRecord {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export async function categorizeExpense(description: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "o4-mini-2025-04-16",
      messages: [
        {
          role: "system",
          content:
            "You are an expense categorization AI. Categorize expenses into one of these categories: Food, Transportation, Entertainment, Shopping, Bills, Healthcare, Other. Respond with only the category name.",
        },
        {
          role: "user",
          content: `Categorize this expense: ${description}`,
        },
      ],
    });

    const category = completion.choices[0].message.content?.trim();

    const validCategories = [
      "Food",
      "Transportation",
      "Entertainment",
      "Shopping",
      "Bills",
      "Healthcare",
      "Other",
    ];

    const finalCategory = validCategories.includes(category || "")
      ? category!
      : "Other";

    return finalCategory;
  } catch (error) {
    console.error("❌ Error categorizing expense:", error);
    return "Other";
  }
}
