import "./shared-tools.css";
import "./UnitConverter.css";
import { useMemo, useState } from "react";

const UNIT_GROUPS = {
  Length: {
    units: {
      Meter: 1,
      Kilometer: 1000,
      Centimeter: 0.01,
      Millimeter: 0.001,
      Mile: 1609.344,
      Yard: 0.9144,
      Foot: 0.3048,
      Inch: 0.0254,
    },
  },

  Weight: {
    units: {
      Kilogram: 1,
      Gram: 0.001,
      Milligram: 0.000001,
      Tonne: 1000,
      Pound: 0.45359237,
      Ounce: 0.028349523125,
    },
  },

  Area: {
    units: {
      "Square Meter": 1,
      "Square Kilometer": 1000000,
      "Square Foot": 0.09290304,
      "Square Yard": 0.83612736,
      "Square Mile": 2589988.110336,
      Acre: 4046.8564224,
      Hectare: 10000,
    },
  },

  Volume: {
    units: {
      Liter: 1,
      Milliliter: 0.001,
      "Cubic Meter": 1000,
      "Cubic Centimeter": 0.001,
      Gallon: 3.785411784,
      Quart: 0.946352946,
      Pint: 0.473176473,
      Cup: 0.2365882365,
    },
  },

  Speed: {
    units: {
      "Kilometers per Hour": 1,
      "Meters per Second": 3.6,
      "Miles per Hour": 1.609344,
      Knot: 1.852,
    },
  },

  Data: {
    units: {
      Byte: 1,
      Kilobyte: 1024,
      Megabyte: 1024 ** 2,
      Gigabyte: 1024 ** 3,
      Terabyte: 1024 ** 4,
    },
  },
};

const TEMPERATURE_UNITS = [
  "Celsius",
  "Fahrenheit",
  "Kelvin",
];

const UnitConverter = () => {
  const [category, setCategory] = useState("Length");
  const [amount, setAmount] = useState("1");
  const [fromUnit, setFromUnit] = useState("Meter");
  const [toUnit, setToUnit] = useState("Kilometer");
  const [errorMessage, setErrorMessage] = useState("");

  const unitOptions = useMemo(() => {
    if (category === "Temperature") {
      return TEMPERATURE_UNITS;
    }

    return Object.keys(UNIT_GROUPS[category].units);
  }, [category]);

  const convertTemperature = (value, from, to) => {
    let celsius;

    if (from === "Celsius") {
      celsius = value;
    } else if (from === "Fahrenheit") {
      celsius = (value - 32) * (5 / 9);
    } else {
      celsius = value - 273.15;
    }

    if (to === "Celsius") {
      return celsius;
    }

    if (to === "Fahrenheit") {
      return celsius * (9 / 5) + 32;
    }

    return celsius + 273.15;
  };

  const convertedValue = useMemo(() => {
    const numericValue = Number(amount);

    if (!Number.isFinite(numericValue)) {
      return "";
    }

    if (category === "Temperature") {
      return convertTemperature(
        numericValue,
        fromUnit,
        toUnit
      );
    }

    const units = UNIT_GROUPS[category].units;

    return (
      (numericValue * units[fromUnit]) /
      units[toUnit]
    );
  }, [amount, category, fromUnit, toUnit]);

  const formatResult = (value) => {
    if (!Number.isFinite(value)) {
      return "0";
    }

    if (Math.abs(value) >= 1000000000) {
      return value.toExponential(6);
    }

    return Number(value.toFixed(8)).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 8,
      }
    );
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setErrorMessage("");

    if (newCategory === "Temperature") {
      setFromUnit("Celsius");
      setToUnit("Fahrenheit");
      return;
    }

    const units = Object.keys(
      UNIT_GROUPS[newCategory].units
    );

    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
  };

  const handleAmountChange = (event) => {
    const value = event.target.value;

    setAmount(value);

    if (
      value !== "" &&
      !Number.isFinite(Number(value))
    ) {
      setErrorMessage("Please enter a valid number.");
    } else {
      setErrorMessage("");
    }
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <section className="converter-section">
      <div className="converter-container">
        {/* HEADER */}
        <div className="converter-header">
          <p className="hero-label">UTILITY TOOL</p>

          <h1>
            Unit <span>Converter</span>
          </h1>

          <p>
            Convert length, weight, temperature, area, volume,
            speed and data units instantly in your browser.
          </p>
        </div>

        {/* CATEGORY */}
        <div className="unit-category-panel">
          <div className="settings-heading">
            <p className="hero-label">CONVERSION TYPE</p>
            <h2>Select Category</h2>
          </div>

          <div className="unit-category-grid">
            {Object.keys(UNIT_GROUPS)
              .concat("Temperature")
              .map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`unit-category-button ${
                    category === item
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleCategoryChange(item)
                  }
                >
                  {item}
                </button>
              ))}
          </div>
        </div>

        {/* CONVERTER */}
        <div className="settings-panel unit-converter-panel">
          <div className="unit-input-grid">
            <div className="compressor-option">
              <label htmlFor="unit-amount">
                Enter Value
              </label>

              <input
                id="unit-amount"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter value"
              />
            </div>

            <div className="compressor-option">
              <label htmlFor="unit-from">
                From
              </label>

              <select
                id="unit-from"
                value={fromUnit}
                onChange={(event) =>
                  setFromUnit(event.target.value)
                }
              >
                {unitOptions.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div className="unit-swap-wrapper">
              <button
                type="button"
                className="unit-swap-button"
                onClick={swapUnits}
                title="Swap units"
                aria-label="Swap units"
              >
                ⇄
              </button>
            </div>

            <div className="compressor-option">
              <label htmlFor="unit-to">
                To
              </label>

              <select
                id="unit-to"
                value={toUnit}
                onChange={(event) =>
                  setToUnit(event.target.value)
                }
              >
                {unitOptions.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errorMessage && (
            <div className="tool-error">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* RESULT */}
          <div className="unit-result-card">
            <span>Converted Result</span>

            <strong>
              {amount === "" || errorMessage
                ? "—"
                : formatResult(convertedValue)}
            </strong>

            <small>{toUnit}</small>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UnitConverter;