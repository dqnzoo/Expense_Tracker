/**
 * Cash-Flow - Salary & Expense Tracker Dashboard
 * Vanilla JavaScript Implementation
 * Sprint 02 Deliverable
 */

(() => {
  'use strict';

  // ==========================================================================
  // 1. Constants & Application State
  // ==========================================================================

  const STORAGE_KEY = 'sprint02_expenses';
  const SALARY_STORAGE_KEY = 'sprint02_salary';
  const CURRENCY_STORAGE_KEY = 'sprint02_currency';
  const THEME_STORAGE_KEY = 'spendwise_theme';

  // Supported Currency Configurations
  const CURRENCY_CONFIG = {
    USD: { symbol: '$', locale: 'en-US' },
    INR: { symbol: '₹', locale: 'en-IN' },
    EUR: { symbol: '€', locale: 'de-DE' },
    GBP: { symbol: '£', locale: 'en-GB' },
    JPY: { symbol: '¥', locale: 'ja-JP' },
    CAD: { symbol: 'CA$', locale: 'en-CA' },
    AUD: { symbol: 'A$', locale: 'en-AU' }
  };

  // Category Configuration (Names, Icons, Colors)
  const CATEGORY_META = {
    'Food & Dining': { icon: '🍔', color: '#f97316', bg: '#ffedd5', darkBg: 'rgba(249, 115, 22, 0.2)' },
    'Transportation': { icon: '🚗', color: '#3b82f6', bg: '#dbeafe', darkBg: 'rgba(59, 130, 246, 0.2)' },
    'Utilities & Bills': { icon: '💡', color: '#eab308', bg: '#fef9c3', darkBg: 'rgba(234, 179, 8, 0.2)' },
    'Entertainment': { icon: '🎬', color: '#ec4899', bg: '#fce7f3', darkBg: 'rgba(236, 72, 153, 0.2)' },
    'Shopping': { icon: '🛍️', color: '#8b5cf6', bg: '#ede9fe', darkBg: 'rgba(139, 92, 246, 0.2)' },
    'Healthcare': { icon: '💊', color: '#14b8a6', bg: '#ccfbf1', darkBg: 'rgba(20, 184, 166, 0.2)' },
    'Education': { icon: '📚', color: '#06b6d4', bg: '#cffafe', darkBg: 'rgba(6, 182, 212, 0.2)' },
    'Housing & Rent': { icon: '🏠', color: '#64748b', bg: '#f1f5f9', darkBg: 'rgba(100, 116, 139, 0.2)' },
    'Other': { icon: '📦', color: '#78716c', bg: '#f5f5f4', darkBg: 'rgba(120, 113, 108, 0.2)' }
  };

  // Payment Method Badges
  const PAYMENT_ICONS = {
    'Credit Card': '💳',
    'Debit Card': '💳',
    'UPI': '📱',
    'Cash': '💵',
    'Net Banking': '🏦',
    'Other': '🪙'
  };

  // Single Source of Truth
  let totalSalary = 0;
  let expenses = [];
  let expenseChart = null;
  let editingExpenseId = null;
  let chartMode = 'balance'; // 'balance' (Remaining Balance vs Expenses) or 'category'
  let currentCurrency = 'USD';
  let searchQuery = '';
  let selectedCategoryFilter = 'ALL';
  let selectedSortOption = 'date-desc';

  // Currency Formatter Factory
  function getCurrencyFormatter(currCode) {
    const config = CURRENCY_CONFIG[currCode] || CURRENCY_CONFIG.USD;
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  let currencyFormatter = getCurrencyFormatter('USD');

  // Date Formatter
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // ==========================================================================
  // 2. DOM Elements Cache
  // ==========================================================================

  const DOM = {
    // Header & System
    currentDateText: document.getElementById('current-date-text'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    themeIcon: document.getElementById('theme-icon'),
    toastContainer: document.getElementById('toast-container'),

    // Critical Threshold Alert
    thresholdAlertBanner: document.getElementById('threshold-alert-banner'),

    // Salary Form
    salaryForm: document.getElementById('salary-form'),
    totalSalaryInput: document.getElementById('total-salary-input'),
    salaryError: document.getElementById('salary-error'),
    setSalaryBtn: document.getElementById('set-salary-btn'),
    appCurrencySelect: document.getElementById('app-currency-select'),
    salaryCurrencySymbol: document.getElementById('salary-currency-symbol'),

    // Summary Metric Cards
    totalSalaryValue: document.getElementById('total-salary-value'),
    totalSalarySubtext: document.getElementById('total-salary-subtext'),
    totalExpensesValue: document.getElementById('total-expenses-value'),
    totalExpensesSubtext: document.getElementById('total-expenses-subtext'),
    remainingBalanceValue: document.getElementById('remaining-balance-value'),
    remainingBalanceSubtext: document.getElementById('remaining-balance-subtext'),
    cardBalance: document.querySelector('.card-balance'),
    expenseCountValue: document.getElementById('expense-count-value'),
    expenseCountSubtext: document.getElementById('expense-count-subtext'),

    // Expense Form
    expenseForm: document.getElementById('expense-form'),
    formHeading: document.getElementById('form-heading'),
    editingIndicator: document.getElementById('editing-indicator'),
    expenseIdInput: document.getElementById('expense-id-input'),
    expenseTitleInput: document.getElementById('expense-title-input'),
    expenseAmountInput: document.getElementById('expense-amount-input'),
    expenseCurrencySymbol: document.getElementById('expense-currency-symbol'),
    expenseCurrencySymbolLabel: document.getElementById('expense-currency-symbol-label'),
    expenseCategoryInput: document.getElementById('expense-category-input'),
    expenseDateInput: document.getElementById('expense-date-input'),
    expensePaymentInput: document.getElementById('expense-payment-input'),
    submitExpenseBtn: document.getElementById('submit-expense-btn'),
    submitBtnText: document.getElementById('submit-btn-text'),
    cancelEditBtn: document.getElementById('cancel-edit-btn'),

    // Form Error Labels
    titleError: document.getElementById('title-error'),
    amountError: document.getElementById('amount-error'),
    categoryError: document.getElementById('category-error'),
    dateError: document.getElementById('date-error'),

    // Chart Panel & Tabs
    chartMainTitle: document.getElementById('chart-main-title'),
    chartMainSubtitle: document.getElementById('chart-main-subtitle'),
    chartTabBalance: document.getElementById('chart-tab-balance'),
    chartTabCategory: document.getElementById('chart-tab-category'),
    chartCanvas: document.getElementById('expenseChart'),
    chartCanvasContainer: document.getElementById('chart-canvas-container'),
    chartEmptyState: document.getElementById('chart-empty-state'),

    // Currency Converter
    currencyForm: document.getElementById('currency-converter-form'),
    converterAmountInput: document.getElementById('converter-amount-input'),
    converterFromSelect: document.getElementById('converter-from-select'),
    converterToSelect: document.getElementById('converter-to-select'),
    converterSwapBtn: document.getElementById('converter-swap-btn'),
    convertCurrencyBtn: document.getElementById('convert-currency-btn'),
    convertBtnSpinner: document.getElementById('convert-btn-spinner'),
    convertBtnText: document.getElementById('convert-btn-text'),
    converterResultBox: document.getElementById('converter-result-box'),
    converterUseTotalBtn: document.getElementById('converter-use-total-btn'),

    // Table & Actions
    searchExpenseInput: document.getElementById('search-expense-input'),
    filterCategorySelect: document.getElementById('filter-category-select'),
    sortExpenseSelect: document.getElementById('sort-expense-select'),
    expenseTable: document.getElementById('expense-table'),
    expenseTableBody: document.getElementById('expense-table-body'),
    tableEmptyState: document.getElementById('table-empty-state'),
    emptyStateTitle: document.getElementById('empty-state-title'),
    emptyStateDesc: document.getElementById('empty-state-desc'),
    filteredCountText: document.getElementById('filtered-count-text'),
    exportPdfBtn: document.getElementById('export-pdf-btn'),
    clearAllBtn: document.getElementById('clear-all-btn')
  };

  // ==========================================================================
  // 3. Storage & Data Persistence
  // ==========================================================================

  /**
   * Safely loads salary from localStorage.
   * @returns {number} Salary value
   */
  function loadSalary() {
    try {
      const raw = localStorage.getItem(SALARY_STORAGE_KEY);
      if (!raw) return 0;
      const num = Number(raw);
      return Number.isFinite(num) && num >= 0 ? num : 0;
    } catch (e) {
      console.error('Could not load salary from storage:', e);
      return 0;
    }
  }

  function saveSalary(salary) {
    try {
      localStorage.setItem(SALARY_STORAGE_KEY, salary.toString());
    } catch (e) {
      console.error('Failed to save salary to storage:', e);
    }
  }

  function loadCurrency() {
    try {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
      return saved && CURRENCY_CONFIG[saved] ? saved : 'USD';
    } catch {
      return 'USD';
    }
  }

  function updateCurrencyUI(curr) {
    const config = CURRENCY_CONFIG[curr] || CURRENCY_CONFIG.USD;
    currencyFormatter = getCurrencyFormatter(curr);

    if (DOM.salaryCurrencySymbol) DOM.salaryCurrencySymbol.textContent = config.symbol;
    if (DOM.expenseCurrencySymbol) DOM.expenseCurrencySymbol.textContent = config.symbol;
    if (DOM.expenseCurrencySymbolLabel) DOM.expenseCurrencySymbolLabel.textContent = config.symbol;
    if (DOM.appCurrencySelect) DOM.appCurrencySelect.value = curr;
    if (DOM.converterFromSelect) DOM.converterFromSelect.value = curr;
  }

  /**
   * Switches the active currency format without mutating base numeric amounts,
   * completely eliminating floating-point rounding errors on repeated toggling.
   * @param {string} newCurrency
   */
  function changeCurrency(newCurrency) {
    if (!CURRENCY_CONFIG[newCurrency] || newCurrency === currentCurrency) return;

    currentCurrency = newCurrency;
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    } catch (e) {
      console.error(e);
    }

    updateCurrencyUI(newCurrency);
    renderSummary();
    renderExpenses();
    renderChart();

    showToast(`Currency changed to ${newCurrency} (${CURRENCY_CONFIG[newCurrency].symbol})`, 'info');
  }

  /**
   * Safely loads expenses from localStorage.
   * Handles malformed JSON and validates individual items.
   * @returns {Array} Array of valid expense objects
   */
  function loadExpenses() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        console.warn('Stored data is not an array, initializing with empty list.');
        return [];
      }

      // Sanitize and validate loaded entries
      return parsed.filter(item => {
        return (
          item &&
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          typeof item.title === 'string' &&
          Number.isFinite(Number(item.amount)) &&
          Number(item.amount) > 0 &&
          typeof item.category === 'string' &&
          typeof item.date === 'string'
        );
      }).map(item => ({
        ...item,
        amount: Number(item.amount) // Ensure numeric type
      }));
    } catch (error) {
      console.error('Could not load saved expenses from localStorage:', error);
      showToast('Notice: Could not load saved records due to data corruption. Starting fresh.', 'error');
      return [];
    }
  }

  /**
   * Persists expenses array to localStorage as a JSON string.
   * @param {Array} data
   */
  function saveExpenses(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save expenses to localStorage:', error);
      showToast('Error: Unable to save records to browser storage.', 'error');
    }
  }

  // ==========================================================================
  // 4. Calculations & Derived State
  // ==========================================================================

  /**
   * Recalculates all derived metrics directly from the source array.
   * Total Salary - Total Expenses = Remaining Balance.
   * Strictly avoids string concatenation (10 + 10 = 20, never "1010").
   */
  function calculateMetrics(data) {
    const count = data.length;
    let totalExpenses = 0;
    let largest = null;
    const categoryTotals = {};

    for (let i = 0; i < count; i++) {
      const item = data[i];
      const amt = Number(item.amount); // Explicit numeric type check

      if (Number.isFinite(amt) && amt > 0) {
        totalExpenses += amt;

        if (!largest || amt > largest.amount) {
          largest = item;
        }

        const cat = item.category || 'Other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
      }
    }

    const remainingBalance = totalSalary - totalExpenses;
    const average = count > 0 ? totalExpenses / count : 0;

    return {
      totalSalary,
      totalExpenses,
      remainingBalance,
      count,
      largest,
      average,
      categoryTotals
    };
  }

  // ==========================================================================
  // 5. User Interface Rendering
  // ==========================================================================

  /**
   * Renders the summary cards and triggers critical threshold alert if balance < 10% of salary.
   */
  function renderSummary() {
    const metrics = calculateMetrics(expenses);

    // 1. Total Salary
    DOM.totalSalaryValue.textContent = currencyFormatter.format(metrics.totalSalary);
    DOM.totalSalarySubtext.textContent = metrics.totalSalary > 0 
      ? 'Configured base income' 
      : 'Set salary above to begin tracking';

    // 2. Total Expenses
    DOM.totalExpensesValue.textContent = currencyFormatter.format(metrics.totalExpenses);
    DOM.totalExpensesSubtext.textContent = metrics.count > 0 
      ? `Across ${metrics.count} recorded transaction${metrics.count === 1 ? '' : 's'}`
      : 'No spending recorded yet';

    // 3. Remaining Balance
    DOM.remainingBalanceValue.textContent = currencyFormatter.format(metrics.remainingBalance);
    DOM.remainingBalanceSubtext.textContent = `${currencyFormatter.format(metrics.totalSalary)} - ${currencyFormatter.format(metrics.totalExpenses)}`;

    // 4. Total Records Count
    DOM.expenseCountValue.textContent = metrics.count.toString();
    DOM.expenseCountSubtext.textContent = metrics.count === 1 ? '1 active transaction' : `${metrics.count} active transactions`;

    // 5. Threshold Alerts (Requirement: If Remaining Balance drops below 10% of Total Salary, trigger critical UI warning)
    const isCritical = metrics.totalSalary > 0 && metrics.remainingBalance < (metrics.totalSalary * 0.10);

    if (isCritical) {
      DOM.thresholdAlertBanner.classList.remove('hidden');
      DOM.remainingBalanceValue.classList.add('text-danger-warning');
      if (DOM.cardBalance) DOM.cardBalance.classList.add('is-warning');
    } else {
      DOM.thresholdAlertBanner.classList.add('hidden');
      DOM.remainingBalanceValue.classList.remove('text-danger-warning');
      if (DOM.cardBalance) DOM.cardBalance.classList.remove('is-warning');
    }
  }

  /**
   * Filters and sorts the expense records based on current user controls.
   */
  function getFilteredAndSortedExpenses() {
    return expenses.filter(item => {
      // Category filter
      if (selectedCategoryFilter !== 'ALL' && item.category !== selectedCategoryFilter) {
        return false;
      }

      // Search query filter (title, category, or payment)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = item.title.toLowerCase().includes(query);
        const catMatch = item.category.toLowerCase().includes(query);
        const payMatch = (item.paymentMethod || '').toLowerCase().includes(query);
        if (!titleMatch && !catMatch && !payMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      switch (selectedSortOption) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'amount-asc':
          return Number(a.amount) - Number(b.amount);
        case 'amount-desc':
          return Number(b.amount) - Number(a.amount);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
  }

  /**
   * Renders the expenses table rows using safe DOM methods.
   * Associated trash icon for deleting each expense.
   */
  function renderExpenses() {
    const filteredList = getFilteredAndSortedExpenses();

    // Clear existing rows
    DOM.expenseTableBody.textContent = '';

    if (filteredList.length === 0) {
      DOM.expenseTable.classList.add('hidden');
      DOM.tableEmptyState.classList.remove('hidden');

      if (expenses.length === 0) {
        DOM.emptyStateTitle.textContent = 'No expenses recorded yet';
        DOM.emptyStateDesc.textContent = 'Use the form above to add your first expense and start tracking your cash flow!';
      } else {
        DOM.emptyStateTitle.textContent = 'No matching expenses found';
        DOM.emptyStateDesc.textContent = 'Try adjusting your search query or category filter criteria.';
      }
    } else {
      DOM.expenseTable.classList.remove('hidden');
      DOM.tableEmptyState.classList.add('hidden');

      const fragment = document.createDocumentFragment();

      filteredList.forEach(expense => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', expense.id);

        // 1. Date cell
        const tdDate = document.createElement('td');
        tdDate.className = 'expense-date-cell';
        try {
          const dateObj = new Date(expense.date + 'T00:00:00');
          tdDate.textContent = isNaN(dateObj.getTime()) ? expense.date : dateFormatter.format(dateObj);
        } catch {
          tdDate.textContent = expense.date;
        }
        tr.appendChild(tdDate);

        // 2. Title cell
        const tdTitle = document.createElement('td');
        tdTitle.className = 'expense-title-cell';
        tdTitle.textContent = expense.title; // Safe textContent
        tr.appendChild(tdTitle);

        // 3. Category cell with badge
        const tdCat = document.createElement('td');
        const catBadge = document.createElement('span');
        catBadge.className = 'badge-category';
        const catMeta = CATEGORY_META[expense.category] || CATEGORY_META['Other'];
        
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        catBadge.style.backgroundColor = isDark ? catMeta.darkBg : catMeta.bg;
        catBadge.style.color = catMeta.color;
        catBadge.textContent = `${catMeta.icon} ${expense.category}`;
        tdCat.appendChild(catBadge);
        tr.appendChild(tdCat);

        // 4. Payment method cell
        const tdPay = document.createElement('td');
        const payBadge = document.createElement('span');
        payBadge.className = 'badge-payment';
        const payIcon = PAYMENT_ICONS[expense.paymentMethod] || '💳';
        payBadge.textContent = `${payIcon} ${expense.paymentMethod || 'Other'}`;
        tdPay.appendChild(payBadge);
        tr.appendChild(tdPay);

        // 5. Amount cell
        const tdAmount = document.createElement('td');
        tdAmount.className = 'expense-amount-cell text-right';
        tdAmount.textContent = currencyFormatter.format(expense.amount);
        tr.appendChild(tdAmount);

        // 6. Action buttons cell
        const tdActions = document.createElement('td');
        tdActions.className = 'text-center';

        const actionWrap = document.createElement('div');
        actionWrap.className = 'action-buttons-wrap';

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn-action btn-action-edit';
        editBtn.title = 'Edit this expense';
        editBtn.setAttribute('aria-label', `Edit expense ${expense.title}`);
        editBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        `;
        editBtn.addEventListener('click', () => startEditingExpense(expense.id));

        // Trash Icon Delete button (Explicitly requested in Phase 2)
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn-action btn-action-delete';
        deleteBtn.title = 'Delete this expense';
        deleteBtn.setAttribute('aria-label', `Delete expense ${expense.title}`);
        deleteBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        `;
        deleteBtn.addEventListener('click', () => deleteExpense(expense.id));

        actionWrap.appendChild(editBtn);
        actionWrap.appendChild(deleteBtn);
        tdActions.appendChild(actionWrap);
        tr.appendChild(tdActions);

        fragment.appendChild(tr);
      });

      DOM.expenseTableBody.appendChild(fragment);
    }

    DOM.filteredCountText.textContent = `Showing ${filteredList.length} of ${expenses.length} transaction${expenses.length === 1 ? '' : 's'}`;
  }

  // ==========================================================================
  // 6. Chart.js Lifecycle & Visualization
  // ==========================================================================

  /**
   * Renders or updates the Chart.js Pie/Doughnut Chart.
   * Mode 1: Remaining Balance vs. Total Expenses (Phase 2 core requirement)
   * Mode 2: Spending by Category
   */
  function renderChart() {
    const metrics = calculateMetrics(expenses);

    // Check if Chart library is loaded
    if (typeof window.Chart === 'undefined') {
      console.warn('Chart.js CDN is unavailable or blocked.');
      return;
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#f8fafc' : '#0f172a';

    let labels = [];
    let dataValues = [];
    let backgroundColors = [];

    if (chartMode === 'balance') {
      DOM.chartMainTitle.textContent = 'Remaining Balance vs. Expenses';
      DOM.chartMainSubtitle.textContent = 'Proportional distribution of your income';

      // If neither salary nor expenses are set, show empty state
      if (metrics.totalSalary === 0 && metrics.totalExpenses === 0) {
        if (expenseChart) {
          expenseChart.destroy();
          expenseChart = null;
        }
        DOM.chartCanvasContainer.classList.add('hidden');
        DOM.chartEmptyState.classList.remove('hidden');
        return;
      }

      DOM.chartCanvasContainer.classList.remove('hidden');
      DOM.chartEmptyState.classList.add('hidden');

      const positiveBalance = Math.max(0, metrics.remainingBalance);
      labels = ['Remaining Balance', 'Total Expenses'];
      dataValues = [Number(positiveBalance.toFixed(2)), Number(metrics.totalExpenses.toFixed(2))];
      backgroundColors = ['#10b981', '#6366f1']; // Emerald & Indigo
    } else {
      DOM.chartMainTitle.textContent = 'Spending by Category';
      DOM.chartMainSubtitle.textContent = 'Visual distribution across categories';

      const categoryEntries = Object.entries(metrics.categoryTotals);
      if (categoryEntries.length === 0 || metrics.totalExpenses === 0) {
        if (expenseChart) {
          expenseChart.destroy();
          expenseChart = null;
        }
        DOM.chartCanvasContainer.classList.add('hidden');
        DOM.chartEmptyState.classList.remove('hidden');
        return;
      }

      DOM.chartCanvasContainer.classList.remove('hidden');
      DOM.chartEmptyState.classList.add('hidden');

      labels = categoryEntries.map(([category]) => category);
      dataValues = categoryEntries.map(([, total]) => Number(total.toFixed(2)));
      backgroundColors = labels.map(label => (CATEGORY_META[label] ? CATEGORY_META[label].color : '#78716c'));
    }

    // If chart instance exists, update data and redraw
    if (expenseChart) {
      expenseChart.data.labels = labels;
      expenseChart.data.datasets[0].data = dataValues;
      expenseChart.data.datasets[0].backgroundColor = backgroundColors;
      expenseChart.options.plugins.legend.labels.color = textColor;
      expenseChart.update();
      return;
    }

    // Otherwise instantiate a clean new Chart instance
    const ctx = DOM.chartCanvas.getContext('2d');
    expenseChart = new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderColor: isDark ? '#111827' : '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              padding: 14,
              color: textColor,
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 11.5,
                weight: '600'
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const val = context.raw || 0;
                const grandTotal = dataValues.reduce((a, b) => a + b, 0);
                const percent = grandTotal > 0 ? ((val / grandTotal) * 100).toFixed(1) : 0;
                return ` ${label}: ${currencyFormatter.format(val)} (${percent}%)`;
              }
            }
          }
        },
        cutout: '62%'
      }
    });
  }

  // ==========================================================================
  // 7. Salary Management
  // ==========================================================================

  function handleSalarySubmit(e) {
    e.preventDefault();
    DOM.salaryError.textContent = '';
    DOM.totalSalaryInput.classList.remove('is-invalid');

    const rawSalary = DOM.totalSalaryInput.value.trim();
    const parsed = Number(rawSalary);

    if (rawSalary === '' || !Number.isFinite(parsed) || parsed <= 0) {
      DOM.salaryError.textContent = 'Please enter a valid positive salary amount.';
      DOM.totalSalaryInput.classList.add('is-invalid');
      return;
    }

    totalSalary = parsed;
    saveSalary(totalSalary);

    renderSummary();
    renderChart();

    showToast(`Total Salary updated to ${currencyFormatter.format(totalSalary)}`, 'success');
  }

  // ==========================================================================
  // 8. Add / Edit / Delete Operations
  // ==========================================================================

  /**
   * Resets the form errors and styling.
   */
  function clearFormValidation() {
    DOM.titleError.textContent = '';
    DOM.amountError.textContent = '';
    DOM.categoryError.textContent = '';
    DOM.dateError.textContent = '';

    DOM.expenseTitleInput.classList.remove('is-invalid');
    DOM.expenseAmountInput.classList.remove('is-invalid');
    DOM.expenseCategoryInput.classList.remove('is-invalid');
    DOM.expenseDateInput.classList.remove('is-invalid');
  }

  /**
   * Sets the form to default state (Add Expense mode).
   */
  function resetForm() {
    DOM.expenseForm.reset();
    DOM.expenseIdInput.value = '';
    editingExpenseId = null;

    DOM.formHeading.textContent = 'Add New Expense';
    DOM.submitBtnText.textContent = 'Add Expense';
    DOM.editingIndicator.classList.add('hidden');
    DOM.cancelEditBtn.classList.add('hidden');

    // Default date to today (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    DOM.expenseDateInput.value = today;

    clearFormValidation();
  }

  /**
   * Enters Edit Mode for an existing expense.
   * @param {string} id
   */
  function startEditingExpense(id) {
    const expense = expenses.find(item => item.id === id);
    if (!expense) return;

    editingExpenseId = id;
    DOM.expenseIdInput.value = expense.id;
    DOM.expenseTitleInput.value = expense.title;
    DOM.expenseAmountInput.value = expense.amount;
    DOM.expenseCategoryInput.value = expense.category;
    DOM.expenseDateInput.value = expense.date;
    DOM.expensePaymentInput.value = expense.paymentMethod || 'Credit Card';

    DOM.formHeading.textContent = 'Edit Expense Record';
    DOM.submitBtnText.textContent = 'Update Expense';
    DOM.editingIndicator.classList.remove('hidden');
    DOM.cancelEditBtn.classList.remove('hidden');

    clearFormValidation();

    const formPanel = document.getElementById('expense-form-panel');
    if (formPanel) {
      formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    DOM.expenseTitleInput.focus();
  }

  /**
   * Handles Form Submission (Add or Update).
   */
  function handleFormSubmit(e) {
    e.preventDefault();
    clearFormValidation();

    let isValid = true;

    // 1. Validate Title
    const titleVal = DOM.expenseTitleInput.value.trim();
    if (!titleVal) {
      DOM.titleError.textContent = 'Expense title is required.';
      DOM.expenseTitleInput.classList.add('is-invalid');
      isValid = false;
    }

    // 2. Validate Amount (Mandatory numeric check: finite, > 0)
    const rawAmount = DOM.expenseAmountInput.value.trim();
    const amountVal = Number(rawAmount);

    if (rawAmount === '' || !Number.isFinite(amountVal) || amountVal <= 0) {
      DOM.amountError.textContent = 'Please enter a valid positive number greater than 0.';
      DOM.expenseAmountInput.classList.add('is-invalid');
      isValid = false;
    }

    // 3. Validate Category
    const categoryVal = DOM.expenseCategoryInput.value;
    if (!categoryVal) {
      DOM.categoryError.textContent = 'Please select an expense category.';
      DOM.expenseCategoryInput.classList.add('is-invalid');
      isValid = false;
    }

    // 4. Validate Date
    const dateVal = DOM.expenseDateInput.value;
    if (!dateVal) {
      DOM.dateError.textContent = 'Please select a valid transaction date.';
      DOM.expenseDateInput.classList.add('is-invalid');
      isValid = false;
    }

    if (!isValid) return;

    const paymentMethodVal = DOM.expensePaymentInput.value || 'Credit Card';

    if (editingExpenseId) {
      // UPDATE EXISTING RECORD (Does NOT create a duplicate record)
      const index = expenses.findIndex(item => item.id === editingExpenseId);
      if (index !== -1) {
        expenses[index] = {
          id: editingExpenseId,
          title: titleVal,
          amount: amountVal, // Typed numeric
          category: categoryVal,
          date: dateVal,
          paymentMethod: paymentMethodVal
        };
        saveExpenses(expenses);
        showToast('Expense updated successfully.', 'success');
      }
    } else {
      // ADD NEW RECORD
      const newExpense = {
        id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        title: titleVal,
        amount: amountVal, // Typed numeric
        category: categoryVal,
        date: dateVal,
        paymentMethod: paymentMethodVal
      };
      expenses.unshift(newExpense);
      saveExpenses(expenses);
      showToast('Expense added successfully.', 'success');
    }

    // Recalculate and re-render everything
    resetForm();
    renderSummary();
    renderExpenses();
    renderChart();
  }

  /**
   * Deletes an expense by its unique ID.
   * Updates DOM, localStorage, and recalculates Remaining Balance instantly.
   * @param {string} id
   */
  function deleteExpense(id) {
    const expense = expenses.find(item => item.id === id);
    const title = expense ? expense.title : 'Record';

    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    expenses = expenses.filter(item => item.id !== id);
    saveExpenses(expenses);

    if (editingExpenseId === id) {
      resetForm();
    }

    // Recalculate and update views instantly
    renderSummary();
    renderExpenses();
    renderChart();

    showToast(`Deleted "${title}"`, 'info');
  }

  /**
   * Clears all local expenses with confirmation.
   */
  function clearAllExpenses() {
    if (expenses.length === 0) {
      showToast('No expenses to clear.', 'info');
      return;
    }

    if (!confirm('Are you sure you want to delete ALL expense records? This action cannot be undone.')) {
      return;
    }

    expenses = [];
    saveExpenses(expenses);
    resetForm();
    renderSummary();
    renderExpenses();
    renderChart();

    showToast('All expense records cleared.', 'info');
  }

  // ==========================================================================
  // 9. Currency Converter (Frankfurter Free API)
  // ==========================================================================

  /**
   * Converts currency using Frankfurter free keyless API endpoint.
   * Handles network errors, same currency conversion, and input validation.
   */
  async function handleCurrencyConversion(e) {
    if (e) e.preventDefault();

    const rawAmount = DOM.converterAmountInput.value.trim();
    const amount = Number(rawAmount);

    if (rawAmount === '' || !Number.isFinite(amount) || amount <= 0) {
      displayConverterError('Please enter a valid numeric amount greater than 0.');
      return;
    }

    const fromCurrency = DOM.converterFromSelect.value;
    const toCurrency = DOM.converterToSelect.value;

    if (!fromCurrency || !toCurrency) {
      displayConverterError('Please select both source and target currencies.');
      return;
    }

    // Handle identical currencies cleanly without redundant network hit
    if (fromCurrency === toCurrency) {
      displayConverterSuccess(amount, 1, fromCurrency, toCurrency, new Date().toISOString().split('T')[0]);
      return;
    }

    // Set Loading State
    setConverterLoading(true);

    try {
      const paramStr = `from=${encodeURIComponent(fromCurrency)}&to=${encodeURIComponent(toCurrency)}`;
      let response = null;

      try {
        response = await fetch(`https://api.frankfurter.dev/v1/latest?${paramStr}`);
      } catch (devErr) {
        // Fallback to .app endpoint
        response = await fetch(`https://api.frankfurter.app/latest?${paramStr}`);
      }

      if (!response || !response.ok) {
        // Try fallback if dev endpoint returned non-ok
        response = await fetch(`https://api.frankfurter.app/latest?${paramStr}`);
      }

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.rates || typeof data.rates[toCurrency] !== 'number') {
        throw new Error('Exchange rate data unavailable for this pair.');
      }

      const rate = data.rates[toCurrency];
      const rateDate = data.date || new Date().toISOString().split('T')[0];

      displayConverterSuccess(amount, rate, fromCurrency, toCurrency, rateDate);
    } catch (err) {
      console.error('Currency conversion failed:', err);
      displayConverterError('Exchange rate lookup failed. Please check your internet connection and try again.');
    } finally {
      setConverterLoading(false);
    }
  }

  function setConverterLoading(isLoading) {
    if (isLoading) {
      DOM.convertBtnSpinner.classList.remove('hidden');
      DOM.convertBtnText.textContent = 'Converting...';
      DOM.convertCurrencyBtn.disabled = true;
    } else {
      DOM.convertBtnSpinner.classList.add('hidden');
      DOM.convertBtnText.textContent = 'Convert';
      DOM.convertCurrencyBtn.disabled = false;
    }
  }

  function displayConverterSuccess(amount, rate, from, to, date) {
    const converted = amount * rate;
    const formattedInput = new Intl.NumberFormat('en-US', { style: 'currency', currency: from }).format(amount);
    const formattedResult = new Intl.NumberFormat('en-US', { style: 'currency', currency: to }).format(converted);

    DOM.converterResultBox.className = 'converter-result-box is-success';
    DOM.converterResultBox.innerHTML = `
      <div>
        <div class="conversion-main-text">${formattedInput} = ${formattedResult}</div>
        <div class="conversion-rate-text">Exchange Rate: 1 ${from} = ${rate.toFixed(4)} ${to}</div>
      </div>
      <div class="conversion-disclaimer">
        Rates provided by Frankfurter API (${date}). Official market rates may vary from bank/card provider rates.
      </div>
    `;
  }

  function displayConverterError(message) {
    DOM.converterResultBox.className = 'converter-result-box is-error';
    DOM.converterResultBox.innerHTML = `
      <div class="conversion-error-text">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>${message}</span>
      </div>
    `;
  }

  /**
   * Populates converter amount with current total expenses.
   */
  function handleUseTotalExpenses() {
    const metrics = calculateMetrics(expenses);
    if (metrics.totalExpenses <= 0) {
      showToast('No expenses recorded yet to convert.', 'info');
      return;
    }
    DOM.converterAmountInput.value = metrics.totalExpenses.toFixed(2);
    DOM.converterAmountInput.focus();
    handleCurrencyConversion();
  }

  /**
   * Swaps from and to currency selections.
   */
  function handleSwapCurrencies() {
    const fromVal = DOM.converterFromSelect.value;
    const toVal = DOM.converterToSelect.value;
    DOM.converterFromSelect.value = toVal;
    DOM.converterToSelect.value = fromVal;
    handleCurrencyConversion();
  }

  // ==========================================================================
  // 10. PDF Export (jsPDF + autoTable)
  // ==========================================================================

  /**
   * Generates and downloads a clean, professional PDF report of expenses and balance.
   * Exports: Total Salary, Total Expenses, Final Remaining Balance, and full expense list.
   */
  function exportExpensesToPDF() {
    if (expenses.length === 0 && totalSalary === 0) {
      showToast('No salary or expenses to export.', 'info');
      return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
      showToast('PDF generator library is not loaded. Please verify your connection.', 'error');
      return;
    }

    try {
      showToast('Generating Cash-Flow Report...', 'info');

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const metrics = calculateMetrics(expenses);
      const generatedDate = new Date().toLocaleString();

      // Brand Title Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229); // Primary Indigo
      doc.text('Cash-Flow Financial Report', 40, 50);

      // Subtitle
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on: ${generatedDate} | Client-Side Local Storage`, 40, 68);

      // Divider Line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(1);
      doc.line(40, 78, 555, 78);

      // Summary Cards Block (Total Salary, Total Expenses, Remaining Balance)
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(40, 90, 515, 65, 6, 6, 'F');

      // Total Salary
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('TOTAL SALARY', 55, 112);
      doc.setFontSize(13);
      doc.setTextColor(59, 130, 246);
      doc.text(currencyFormatter.format(metrics.totalSalary), 55, 134);

      // Total Expenses
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('TOTAL EXPENSES', 225, 112);
      doc.setFontSize(13);
      doc.setTextColor(99, 102, 241);
      doc.text(currencyFormatter.format(metrics.totalExpenses), 225, 134);

      // Remaining Balance
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('REMAINING BALANCE', 395, 112);
      doc.setFontSize(13);
      const balanceColor = metrics.remainingBalance < 0 ? [239, 68, 68] : [16, 185, 129];
      doc.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2]);
      doc.text(currencyFormatter.format(metrics.remainingBalance), 395, 134);

      // Table of Records
      const tableData = expenses.map(item => {
        let formattedDate = item.date;
        try {
          const d = new Date(item.date + 'T00:00:00');
          if (!isNaN(d.getTime())) formattedDate = dateFormatter.format(d);
        } catch {
          // fallback
        }
        return [
          formattedDate,
          item.title,
          item.category,
          item.paymentMethod || 'Other',
          currencyFormatter.format(item.amount)
        ];
      });

      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          startY: 175,
          head: [['Date', 'Description', 'Category', 'Payment Method', 'Amount']],
          body: tableData,
          theme: 'striped',
          headStyles: {
            fillColor: [79, 70, 229],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9.5
          },
          bodyStyles: {
            fontSize: 9,
            textColor: [15, 23, 42]
          },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 150 },
            2: { cellWidth: 110 },
            3: { cellWidth: 95 },
            4: { cellWidth: 80, halign: 'right' }
          },
          margin: { left: 40, right: 40 },
          didDrawPage: (data) => {
            // Footer on each page
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(
              `Cash-Flow Salary & Expense Report  •  Page ${data.pageNumber} of ${pageCount}`,
              40,
              doc.internal.pageSize.height - 25
            );
          }
        });
      } else {
        let yPos = 185;
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text('Expense Transactions:', 40, yPos);
        yPos += 20;

        expenses.forEach((item, idx) => {
          if (yPos > doc.internal.pageSize.height - 40) {
            doc.addPage();
            yPos = 40;
          }
          doc.text(
            `${idx + 1}. [${item.date}] ${item.title} (${item.category}) - ${currencyFormatter.format(item.amount)}`,
            40,
            yPos
          );
          yPos += 18;
        });
      }

      const todayStr = new Date().toISOString().split('T')[0];
      doc.save(`cash-flow-report-${todayStr}.pdf`);
      showToast('Report downloaded successfully.', 'success');
    } catch (err) {
      console.error('Error generating PDF report:', err);
      showToast('Failed to generate PDF. Check console for details.', 'error');
    }
  }

  // ==========================================================================
  // 11. Theme Toggle (Dark / Light)
  // ==========================================================================

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    applyTheme(initialTheme);
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      DOM.themeIcon.textContent = '☀️';
      DOM.themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
    } else {
      document.documentElement.removeAttribute('data-theme');
      DOM.themeIcon.textContent = '🌙';
      DOM.themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    if (expenseChart) {
      renderChart();
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(isDark ? 'light' : 'dark');
  }

  // ==========================================================================
  // 12. Toast Notifications
  // ==========================================================================

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconMap = {
      success: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `,
      error: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      `,
      info: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `
    };

    const iconSpan = document.createElement('span');
    iconSpan.innerHTML = iconMap[type] || iconMap.info;

    const textSpan = document.createElement('span');
    textSpan.textContent = message;

    toast.appendChild(iconSpan);
    toast.appendChild(textSpan);
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3200);
  }

  // ==========================================================================
  // 13. Event Listeners & Initialization
  // ==========================================================================

  function bindEvents() {
    // Salary form
    DOM.salaryForm.addEventListener('submit', handleSalarySubmit);
    DOM.totalSalaryInput.addEventListener('input', () => {
      DOM.salaryError.textContent = '';
      DOM.totalSalaryInput.classList.remove('is-invalid');
    });

    // Chart mode toggle
    DOM.chartTabBalance.addEventListener('click', () => {
      chartMode = 'balance';
      DOM.chartTabBalance.classList.add('active');
      DOM.chartTabBalance.setAttribute('aria-selected', 'true');
      DOM.chartTabCategory.classList.remove('active');
      DOM.chartTabCategory.setAttribute('aria-selected', 'false');
      renderChart();
    });

    DOM.chartTabCategory.addEventListener('click', () => {
      chartMode = 'category';
      DOM.chartTabCategory.classList.add('active');
      DOM.chartTabCategory.setAttribute('aria-selected', 'true');
      DOM.chartTabBalance.classList.remove('active');
      DOM.chartTabBalance.setAttribute('aria-selected', 'false');
      renderChart();
    });

    // Form events
    DOM.expenseForm.addEventListener('submit', handleFormSubmit);
    DOM.cancelEditBtn.addEventListener('click', resetForm);

    // Search & Filter
    DOM.searchExpenseInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderExpenses();
    });

    DOM.filterCategorySelect.addEventListener('change', (e) => {
      selectedCategoryFilter = e.target.value;
      renderExpenses();
    });

    DOM.sortExpenseSelect.addEventListener('change', (e) => {
      selectedSortOption = e.target.value;
      renderExpenses();
    });

    // Clear All & PDF Export
    DOM.clearAllBtn.addEventListener('click', clearAllExpenses);
    DOM.exportPdfBtn.addEventListener('click', exportExpensesToPDF);

    // Currency Converter
    DOM.currencyForm.addEventListener('submit', handleCurrencyConversion);
    DOM.converterSwapBtn.addEventListener('click', handleSwapCurrencies);
    DOM.converterUseTotalBtn.addEventListener('click', handleUseTotalExpenses);

    // Currency Selector
    if (DOM.appCurrencySelect) {
      DOM.appCurrencySelect.addEventListener('change', (e) => {
        changeCurrency(e.target.value);
      });
    }

    // Theme Toggle
    DOM.themeToggleBtn.addEventListener('click', toggleTheme);

    // Clear input errors on user typing
    DOM.expenseTitleInput.addEventListener('input', () => {
      DOM.titleError.textContent = '';
      DOM.expenseTitleInput.classList.remove('is-invalid');
    });

    DOM.expenseAmountInput.addEventListener('input', () => {
      DOM.amountError.textContent = '';
      DOM.expenseAmountInput.classList.remove('is-invalid');
    });

    DOM.expenseCategoryInput.addEventListener('change', () => {
      DOM.categoryError.textContent = '';
      DOM.expenseCategoryInput.classList.remove('is-invalid');
    });

    DOM.expenseDateInput.addEventListener('input', () => {
      DOM.dateError.textContent = '';
      DOM.expenseDateInput.classList.remove('is-invalid');
    });
  }

  function initHeaderDate() {
    const now = new Date();
    DOM.currentDateText.textContent = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Application Entry Point
   */
  function init() {
    initTheme();
    initHeaderDate();

    // 1. Load initial data from localStorage
    currentCurrency = loadCurrency();
    updateCurrencyUI(currentCurrency);

    totalSalary = loadSalary();
    expenses = loadExpenses();

    // 2. Setup initial inputs
    if (totalSalary > 0) {
      DOM.totalSalaryInput.value = totalSalary;
    }
    const today = new Date().toISOString().split('T')[0];
    DOM.expenseDateInput.value = today;

    // 3. Render initial views
    renderSummary();
    renderExpenses();
    renderChart();

    // 4. Attach event listeners
    bindEvents();

    console.log('Cash-Flow Module initialized successfully.');
  }

  // Run on DOM Content Loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
