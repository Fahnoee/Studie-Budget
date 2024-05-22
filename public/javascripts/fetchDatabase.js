const API_ENDPOINTS = {
    fetchBudget: "/api/budget/:budgetID",
    addCustomExpense: "/api/addcustom/expense",
    addCustomIncome: "/api/addcustom/income",
    deleteData: "/api/deletecustom",
    fetchCustomExpensesByMonthAndYear: "/api/customexpenses/:month/:year",
    fetchMonthlyBudget: "/api/monthlybudget/:month/:year", // Added new API endpoint for fetching monthly budget
    updateMonthlyBudget: "/api/update_monthly_budget", // Added new API endpoint for updating monthly budget
    fetchCustomIncomesByMonthAndYear: "/api/customeincomes/:month/:year",
    deleteCategory: "/api/deletecategory",
};

async function fetchDatabase() {
  return fetchData(API_ENDPOINTS.fetchBudget, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

async function fetchData(url, options = {}) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error("Network response was not ok", response);
      };
      return await response.json();
    } catch (error) {
      console.error("Fetch Data error:", error);
      throw error;
    };
};