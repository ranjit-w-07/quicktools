import "./shared-tools.css";
import "./EmiCalculator.css";
import { useMemo, useState } from "react";

const EmiCalculator = () => {
  const [loanAmount, setLoanAmount] = useState("1000000");
  const [interestRate, setInterestRate] = useState("8.5");
  const [loanTenure, setLoanTenure] = useState("5");
  const [tenureType, setTenureType] = useState("Years");
  const [errorMessage, setErrorMessage] = useState("");

  const calculation = useMemo(() => {
    const principal = Number(loanAmount);
    const annualRate = Number(interestRate);
    const tenureValue = Number(loanTenure);

    if (
      !Number.isFinite(principal) ||
      !Number.isFinite(annualRate) ||
      !Number.isFinite(tenureValue) ||
      principal <= 0 ||
      annualRate < 0 ||
      tenureValue <= 0
    ) {
      return null;
    }

    const months =
      tenureType === "Years"
        ? Math.round(tenureValue * 12)
        : Math.round(tenureValue);

    if (months <= 0) {
      return null;
    }

    const monthlyRate = annualRate / 12 / 100;

    let emi;

    if (monthlyRate === 0) {
      emi = principal / months;
    } else {
      const factor = Math.pow(
        1 + monthlyRate,
        months
      );

      emi =
        (principal * monthlyRate * factor) /
        (factor - 1);
    }

    const totalPayment = emi * months;
    const totalInterest =
      totalPayment - principal;

    return {
      emi,
      totalPayment,
      totalInterest,
      principal,
      months,
      annualRate,
    };
  }, [
    loanAmount,
    interestRate,
    loanTenure,
    tenureType,
  ]);

  const formatCurrency = (value) => {
    if (!Number.isFinite(value)) {
      return "₹0";
    }

    return `₹${Math.round(value).toLocaleString(
      "en-IN"
    )}`;
  };

  const handleCalculate = () => {
    const principal = Number(loanAmount);
    const annualRate = Number(interestRate);
    const tenureValue = Number(loanTenure);

    if (
      !Number.isFinite(principal) ||
      principal <= 0
    ) {
      setErrorMessage(
        "Please enter a valid loan amount."
      );
      return;
    }

    if (
      !Number.isFinite(annualRate) ||
      annualRate < 0
    ) {
      setErrorMessage(
        "Please enter a valid interest rate."
      );
      return;
    }

    if (
      !Number.isFinite(tenureValue) ||
      tenureValue <= 0
    ) {
      setErrorMessage(
        "Please enter a valid loan tenure."
      );
      return;
    }

    setErrorMessage("");
  };

  const resetCalculator = () => {
    setLoanAmount("1000000");
    setInterestRate("8.5");
    setLoanTenure("5");
    setTenureType("Years");
    setErrorMessage("");
  };

  return (
    <section className="converter-section">
      <div className="converter-container">
        {/* HEADER */}
        <div className="converter-header">
          <p className="hero-label">FINANCE TOOL</p>

          <h1>
            EMI <span>Calculator</span>
          </h1>

          <p>
            Calculate your monthly EMI, total interest and
            total loan repayment instantly.
          </p>
        </div>

        {/* CALCULATOR */}
        <div className="settings-panel emi-calculator-panel">
          <div className="settings-heading">
            <p className="hero-label">LOAN DETAILS</p>
            <h2>Enter Loan Information</h2>
          </div>

          <div className="emi-input-grid">
            <div className="compressor-option">
              <label htmlFor="emi-loan-amount">
                Loan Amount (₹)
              </label>

              <input
                id="emi-loan-amount"
                type="number"
                min="1"
                value={loanAmount}
                onChange={(event) => {
                  setLoanAmount(event.target.value);
                  setErrorMessage("");
                }}
                placeholder="1000000"
              />
            </div>

            <div className="compressor-option">
              <label htmlFor="emi-interest-rate">
                Interest Rate (% per year)
              </label>

              <input
                id="emi-interest-rate"
                type="number"
                min="0"
                step="0.01"
                value={interestRate}
                onChange={(event) => {
                  setInterestRate(event.target.value);
                  setErrorMessage("");
                }}
                placeholder="8.5"
              />
            </div>

            <div className="compressor-option">
              <label htmlFor="emi-loan-tenure">
                Loan Tenure
              </label>

              <input
                id="emi-loan-tenure"
                type="number"
                min="1"
                step="1"
                value={loanTenure}
                onChange={(event) => {
                  setLoanTenure(event.target.value);
                  setErrorMessage("");
                }}
                placeholder="5"
              />
            </div>

            <div className="compressor-option">
              <label htmlFor="emi-tenure-type">
                Tenure Type
              </label>

              <select
                id="emi-tenure-type"
                value={tenureType}
                onChange={(event) => {
                  setTenureType(event.target.value);
                  setErrorMessage("");
                }}
              >
                <option value="Years">Years</option>
                <option value="Months">Months</option>
              </select>
            </div>
          </div>

          {errorMessage && (
            <div className="tool-error">
              ⚠️ {errorMessage}
            </div>
          )}

          <div className="emi-button-row">
            <button
              type="button"
              className="convert-button"
              onClick={handleCalculate}
            >
              Calculate EMI
            </button>

            <button
              type="button"
              className="clear-all-button"
              onClick={resetCalculator}
            >
              Reset
            </button>
          </div>
        </div>

        {/* RESULTS */}
        {calculation && !errorMessage && (
          <div className="emi-results">
            <div className="emi-main-result">
              <span>Monthly EMI</span>

              <strong>
                {formatCurrency(calculation.emi)}
              </strong>

              <small>
                for {calculation.months} months
              </small>
            </div>

            <div className="emi-summary-grid">
              <div className="emi-summary-card">
                <span>Principal Amount</span>

                <strong>
                  {formatCurrency(
                    calculation.principal
                  )}
                </strong>
              </div>

              <div className="emi-summary-card">
                <span>Total Interest</span>

                <strong>
                  {formatCurrency(
                    calculation.totalInterest
                  )}
                </strong>
              </div>

              <div className="emi-summary-card">
                <span>Total Payment</span>

                <strong>
                  {formatCurrency(
                    calculation.totalPayment
                  )}
                </strong>
              </div>

              <div className="emi-summary-card">
                <span>Interest Rate</span>

                <strong>
                  {calculation.annualRate}%
                </strong>
              </div>
            </div>

            <div className="emi-breakdown">
              <div className="emi-breakdown-header">
                <h2>Payment Breakdown</h2>

                <span>
                  Principal + Interest
                </span>
              </div>

              <div className="emi-bar">
                <div
                  className="emi-principal-bar"
                  style={{
                    width: `${
                      (calculation.principal /
                        calculation.totalPayment) *
                      100
                    }%`,
                  }}
                />

                <div
                  className="emi-interest-bar"
                  style={{
                    width: `${
                      (calculation.totalInterest /
                        calculation.totalPayment) *
                      100
                    }%`,
                  }}
                />
              </div>

              <div className="emi-legend">
                <div>
                  <span className="emi-dot principal" />
                  <span>Principal</span>
                  <strong>
                    {formatCurrency(
                      calculation.principal
                    )}
                  </strong>
                </div>

                <div>
                  <span className="emi-dot interest" />
                  <span>Interest</span>
                  <strong>
                    {formatCurrency(
                      calculation.totalInterest
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default EmiCalculator;