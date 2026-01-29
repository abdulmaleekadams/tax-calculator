import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Calculator, Check, Info, Wallet, X } from "lucide-react";
import { useMemo, useState } from "react";

export default function NGATaxCalculator() {
  const [salary, setSalary] = useState({
    basic: 253680,
    housing: 190260,
    transport: 126840,
    other: 22220,
  });

  const [deductions, setDeductions] = useState({
    rentRelief: 300000,
    nhf: 0,
    nhis: 0,
    lifeInsurance: 0,
    housingLoanInterest: 0,
  });

  const [showInfo, setShowInfo] = useState(false);

  const calculations = useMemo(() => {
    const monthlyGross =
      salary.basic + salary.housing + salary.transport + salary.other;
    const annualGross = monthlyGross * 12;
    const annualBasic = salary.basic * 12;
    const annualHousing = salary.housing * 12;
    const annualTransport = salary.transport * 12;

    const pensionableAmount = annualBasic + annualHousing + annualTransport;
    const annualPension = pensionableAmount * 0.08;
    const monthlyPension = annualPension / 12;

    // NEW LAW CALCULATION
    const newLawTaxableIncome =
      annualGross -
      annualPension -
      deductions.rentRelief -
      deductions.nhf -
      deductions.nhis -
      deductions.lifeInsurance -
      deductions.housingLoanInterest;

    const newLawBrackets = [
      { name: "First ₦800,000 @ 0%", limit: 800000, rate: 0, previous: 0 },
      {
        name: "Next ₦2,200,000 @ 15%",
        limit: 3000000,
        rate: 0.15,
        previous: 800000,
      },
      {
        name: "Next ₦12,000,000 @ 18%",
        limit: 15000000,
        rate: 0.18,
        previous: 3000000,
      },
      {
        name: "Next ₦10,000,000 @ 21%",
        limit: 25000000,
        rate: 0.21,
        previous: 15000000,
      },
      {
        name: "Next ₦25,000,000 @ 23%",
        limit: 50000000,
        rate: 0.23,
        previous: 25000000,
      },
      {
        name: "Above ₦50,000,000 @ 25%",
        limit: Infinity,
        rate: 0.25,
        previous: 50000000,
      },
    ];

    let newLawTax = 0;
    const newLawBreakdown = [];

    for (const bracket of newLawBrackets) {
      const taxableInBracket = Math.max(
        0,
        Math.min(newLawTaxableIncome, bracket.limit) - bracket.previous,
      );
      const taxInBracket = taxableInBracket * bracket.rate;

      newLawBreakdown.push({
        name: bracket.name,
        taxableAmount: taxableInBracket,
        tax: taxInBracket,
      });

      newLawTax += taxInBracket;
      if (newLawTaxableIncome <= bracket.limit) break;
    }

    // OLD LAW CALCULATION
    const personalRelief = 0.2 * annualGross;
    const consolidatedReliefAllowance = Math.max(200000, 0.01 * annualGross);
    const oldLawTaxableIncome =
      annualGross -
      personalRelief -
      consolidatedReliefAllowance -
      annualPension -
      deductions.nhf -
      deductions.nhis -
      deductions.lifeInsurance -
      deductions.housingLoanInterest;

    const oldLawBrackets = [
      { name: "First ₦300,000 @ 7%", limit: 300000, rate: 0.07, previous: 0 },
      {
        name: "Next ₦300,000 @ 11%",
        limit: 600000,
        rate: 0.11,
        previous: 300000,
      },
      {
        name: "Next ₦500,000 @ 15%",
        limit: 1100000,
        rate: 0.15,
        previous: 600000,
      },
      {
        name: "Next ₦500,000 @ 19%",
        limit: 1600000,
        rate: 0.19,
        previous: 1100000,
      },
      {
        name: "Next ₦1,600,000 @ 21%",
        limit: 3200000,
        rate: 0.21,
        previous: 1600000,
      },
      {
        name: "Above ₦3,200,000 @ 24%",
        limit: Infinity,
        rate: 0.24,
        previous: 3200000,
      },
    ];

    let oldLawTax = 0;
    const oldLawBreakdown = [];

    for (const bracket of oldLawBrackets) {
      const taxableInBracket = Math.max(
        0,
        Math.min(oldLawTaxableIncome, bracket.limit) - bracket.previous,
      );
      const taxInBracket = taxableInBracket * bracket.rate;

      oldLawBreakdown.push({
        name: bracket.name,
        taxableAmount: taxableInBracket,
        tax: taxInBracket,
      });

      oldLawTax += taxInBracket;
      if (oldLawTaxableIncome <= bracket.limit) break;
    }

    const newLawMonthlyTax = newLawTax / 12;
    const oldLawMonthlyTax = oldLawTax / 12;
    const newLawNetPay = monthlyGross - monthlyPension - newLawMonthlyTax;
    const oldLawNetPay = monthlyGross - monthlyPension - oldLawMonthlyTax;
    const newLawEffectiveRate = (newLawTax / annualGross) * 100;
    const oldLawEffectiveRate = (oldLawTax / annualGross) * 100;

    const savings = {
      annualTax: oldLawTax - newLawTax,
      monthlyTax: oldLawMonthlyTax - newLawMonthlyTax,
      effectiveRate: oldLawEffectiveRate - newLawEffectiveRate,
      monthlyNetIncrease: newLawNetPay - oldLawNetPay,
    };

    return {
      monthly: { gross: monthlyGross, pension: monthlyPension },
      annual: { gross: annualGross, pension: annualPension },
      newLaw: {
        taxableIncome: newLawTaxableIncome,
        annualTax: newLawTax,
        monthlyTax: newLawMonthlyTax,
        netPay: newLawNetPay,
        effectiveRate: newLawEffectiveRate,
        breakdown: newLawBreakdown,
      },
      oldLaw: {
        personalRelief,
        consolidatedReliefAllowance,
        taxableIncome: oldLawTaxableIncome,
        annualTax: oldLawTax,
        monthlyTax: oldLawMonthlyTax,
        netPay: oldLawNetPay,
        effectiveRate: oldLawEffectiveRate,
        breakdown: oldLawBreakdown,
      },
      savings,
    };
  }, [salary, deductions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const handleSalaryChange = (field: keyof typeof salary, value: string) => {
    setSalary((prev) => ({ ...prev, [field]: Number.parseFloat(value) || 0 }));
  };

  const handleDeductionChange = (
    field: keyof typeof deductions,
    value: string,
  ) => {
    setDeductions((prev) => ({
      ...prev,
      [field]: Number.parseFloat(value) || 0,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4 md:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        .heading-font { font-family: 'DM Serif Display', serif; }
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }
        .stat-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-left: 4px solid transparent;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12); }
        .stat-card.primary { border-left-color: #059669; background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%); }
        .stat-card.secondary { border-left-color: #0891b2; background: linear-gradient(135deg, #ecfeff 0%, #ffffff 100%); }
        .stat-card.success { border-left-color: #16a34a; background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%); }
        .stat-card.warning { border-left-color: #ea580c; background: linear-gradient(135deg, #ffedd5 0%, #ffffff 100%); }
        .input-field { border: 2px solid #e5e7eb; transition: all 0.2s; }
        .input-field:focus { border-color: #059669; box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1); }
        .comparison-arrow { animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .stagger-1 { animation-delay: 0.1s; } .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; } .stagger-4 { animation-delay: 0.4s; }
        .savings-badge { background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); animation: glow 2s ease-in-out infinite; }
        @keyframes glow { 0%, 100% { box-shadow: 0 4px 20px rgba(22, 163, 74, 0.4); } 50% { box-shadow: 0 4px 30px rgba(22, 163, 74, 0.6); } }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mb-4 shadow-lg">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="heading-font text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Nigerian Tax Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compare Old vs New Tax Law • Calculate Your Savings
          </p>
          <div className="inline-flex items-center gap-3 mt-4">
            <div className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
              Nigeria Tax Act 2025 - Effective from January 1, 2026
            </div>
            <button
              onClick={() => setShowInfo(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold hover:bg-blue-200 transition-colors"
            >
              <Info className="w-4 h-4" />
              How it works
            </button>
          </div>
        </div>

        {showInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  How Tax is Calculated
                </h2>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">Old Law (Current - 2024)</h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p><strong>Step 1: Calculate Gross Income</strong><br />
                      Add all salary components (Basic + Housing + Transport + Other Allowances) × 12 months
                    </p>
                    <p><strong>Step 2: Calculate Consolidated Relief Allowance (CRA)</strong><br />
                      CRA = 20% of Gross Income + Higher of (₦200,000 or 1% of Gross Income)
                    </p>
                    <p><strong>Step 3: Calculate Pension</strong><br />
                      Pension = 8% of (Basic + Housing + Transport) × 12
                    </p>
                    <p><strong>Step 4: Determine Taxable Income</strong><br />
                      Taxable Income = Gross Income - CRA - Pension - Other Deductions
                    </p>
                    <p><strong>Step 5: Apply Tax Brackets</strong></p>
                    <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
                      <div>First ₦300,000 → 7%</div>
                      <div>Next ₦300,000 → 11%</div>
                      <div>Next ₦500,000 → 15%</div>
                      <div>Next ₦500,000 → 19%</div>
                      <div>Next ₦1,600,000 → 21%</div>
                      <div>Above ₦3,200,000 → 24%</div>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div>
                  <h3 className="font-bold text-emerald-700 mb-3 text-lg">New Law (2025 - Effective Jan 2026)</h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p><strong>Step 1: Calculate Gross Income</strong><br />
                      Same as old law - all salary components × 12 months
                    </p>
                    <p><strong>Step 2: Calculate Pension</strong><br />
                      Pension = 8% of (Basic + Housing + Transport) × 12
                    </p>
                    <p><strong>Step 3: Determine Taxable Income</strong><br />
                      Taxable Income = Gross Income - Pension - Rent Relief - Other Deductions<br />
                      <span className="text-emerald-600">(No CRA in new law - replaced by ₦800,000 tax-free threshold)</span>
                    </p>
                    <p><strong>Step 4: Apply Tax Brackets</strong></p>
                    <div className="bg-emerald-50 p-3 rounded-lg text-xs space-y-1">
                      <div className="text-emerald-700 font-semibold">First ₦800,000 → 0% (Tax Free!)</div>
                      <div>Next ₦2,200,000 → 15%</div>
                      <div>Next ₦12,000,000 → 18%</div>
                      <div>Next ₦10,000,000 → 21%</div>
                      <div>Next ₦25,000,000 → 23%</div>
                      <div>Above ₦50,000,000 → 25%</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-2">Key Differences</h4>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>New law has ₦800,000 tax-free threshold (vs CRA in old law)</li>
                    <li>New law includes Rent Relief up to ₦500,000</li>
                    <li>New law has fewer but wider tax brackets</li>
                    <li>Lower earners benefit more from the new law</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {calculations.savings.monthlyTax > 0 && (
          <div className="mb-8 animate-fade-in stagger-1">
            <Card className="savings-badge text-white border-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <Check className="w-8 h-8" />
                    <div>
                      <p className="text-sm font-semibold opacity-90">
                        You'll Save with the New Tax Law!
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(calculations.savings.monthlyTax)} less
                        per month
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Annual Savings</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(calculations.savings.annualTax)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card animate-fade-in stagger-1">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Wallet className="w-5 h-5" />
                  Monthly Salary Breakdown
                </CardTitle>
                <CardDescription className="text-emerald-50">
                  Enter your monthly income components
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                {(["basic", "housing", "transport", "other"] as const).map(
                  (field) => (
                    <div key={field}>
                      <Label
                        htmlFor={field}
                        className="text-sm font-semibold text-gray-700 mb-2 block capitalize"
                      >
                        {field === "other"
                          ? "Other Allowances"
                          : `${field} ${field !== "basic" ? "Allowance" : "Salary"}`}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                          ₦
                        </span>
                        <Input
                          id={field}
                          type="number"
                          value={salary[field]}
                          onChange={(e) =>
                            handleSalaryChange(field, e.target.value)
                          }
                          className="input-field pl-8 h-12 text-lg font-semibold"
                        />
                      </div>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>

            <Card className="glass-card animate-fade-in stagger-2">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg">
                  Tax Deductions & Reliefs
                </CardTitle>
                <CardDescription className="text-xs">
                  Annual amounts (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {(
                  [
                    { key: "rentRelief", label: "Rent Relief (Max ₦500,000)" },
                    { key: "nhf", label: "NHF Contribution" },
                    { key: "nhis", label: "NHIS Contribution" },
                    { key: "lifeInsurance", label: "Life Insurance Premium" },
                    {
                      key: "housingLoanInterest",
                      label: "Housing Loan Interest",
                    },
                  ] as const
                ).map(({ key, label }) => (
                  <div key={key}>
                    <Label
                      htmlFor={key}
                      className="text-sm font-semibold text-gray-700 mb-2 block"
                    >
                      {label}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        ₦
                      </span>
                      <Input
                        id={key}
                        type="number"
                        value={deductions[key]}
                        onChange={(e) =>
                          handleDeductionChange(key, e.target.value)
                        }
                        className="input-field pl-8 h-11 text-base font-semibold"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid md:grid-cols-3 gap-4 animate-fade-in stagger-2">
              <Card className="stat-card warning md:col-span-3">
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-600 mb-2">
                        Monthly Gross Salary
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(calculations.monthly.gross)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-600 mb-2">
                        Pension (8%)
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(calculations.monthly.pension)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-600 mb-2">
                        Annual Gross
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(calculations.annual.gross)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card secondary">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Old Law Tax
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      {formatCurrency(calculations.oldLaw.monthlyTax)}
                    </p>
                    <p className="text-sm text-gray-600">per month</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {calculations.oldLaw.effectiveRate.toFixed(1)}% effective
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-center">
                <ArrowRight className="w-8 h-8 text-emerald-600 comparison-arrow" />
              </div>

              <Card className="stat-card success">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      New Law Tax
                    </p>
                    <p className="text-3xl font-bold text-emerald-700 mb-1">
                      {formatCurrency(calculations.newLaw.monthlyTax)}
                    </p>
                    <p className="text-sm text-gray-600">per month</p>
                    <p className="text-xs text-emerald-700 font-bold mt-2">
                      Save {formatCurrency(calculations.savings.monthlyTax)}/mo
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {(["oldLaw", "newLaw"] as const).map((law) => (
              <Card key={law} className="glass-card animate-fade-in stagger-3">
                <CardHeader
                  className={`border-b border-gray-200 ${law === "newLaw" ? "bg-emerald-50" : "bg-gray-50"}`}
                >
                  <CardTitle className="text-xl">
                    PAYE Calculation -{" "}
                    {law === "newLaw" ? "New Law (2025)" : "Old Law"}
                  </CardTitle>
                  <CardDescription>
                    {law === "newLaw"
                      ? "Nigeria Tax Act 2025"
                      : "Current tax system (2024)"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">
                      Income Breakdown
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">
                          Gross Annual Income
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(calculations.annual.gross)}
                        </span>
                      </div>
                      {law === "oldLaw" && (
                        <>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">
                              Personal Relief
                            </span>
                            <span className="font-semibold text-blue-600">
                              -
                              {formatCurrency(
                                calculations.oldLaw.personalRelief,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">
                              Consolidated Relief
                            </span>
                            <span className="font-semibold text-blue-600">
                              -
                              {formatCurrency(
                                calculations.oldLaw.consolidatedReliefAllowance,
                              )}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Pension</span>
                        <span
                          className={`font-semibold ${law === "newLaw" ? "text-emerald-600" : "text-blue-600"}`}
                        >
                          -{formatCurrency(calculations.annual.pension)}
                        </span>
                      </div>
                      {law === "newLaw" && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Rent Relief</span>
                          <span className="font-semibold text-emerald-600">
                            -{formatCurrency(deductions.rentRelief)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex justify-between py-3 px-2 rounded font-bold ${law === "newLaw" ? "bg-emerald-50" : "bg-gray-50"}`}
                      >
                        <span>Taxable Income</span>
                        <span
                          className={law === "newLaw" ? "text-emerald-700" : ""}
                        >
                          {formatCurrency(calculations[law].taxableIncome)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">
                      Tax Brackets
                    </h3>
                    <div className="space-y-3">
                      {calculations[law].breakdown.map(
                        (bracket: { name: string; taxableAmount: number; tax: number }) =>
                          bracket.taxableAmount > 0 && (
                            <div key={bracket.name}>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  {bracket.name}
                                </span>
                                <span className="font-bold">
                                  {formatCurrency(bracket.tax)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                Taxable: {formatCurrency(bracket.taxableAmount)}
                              </div>
                            </div>
                          ),
                      )}
                      <div
                        className={`flex justify-between py-3 px-3 rounded-lg font-bold border-l-4 mt-4 ${
                          law === "newLaw"
                            ? "bg-emerald-100 border-emerald-600"
                            : "bg-red-50 border-red-500"
                        }`}
                      >
                        <span>Total Annual Tax</span>
                        <span
                          className={
                            law === "newLaw"
                              ? "text-emerald-700"
                              : "text-red-700"
                          }
                        >
                          {formatCurrency(calculations[law].annualTax)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="glass-card animate-fade-in stagger-4">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-xl">
                  Tax Comparison Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Metric
                    </p>
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Old Law
                    </p>
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      New Law
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-xl">
                    <div><p className="font-semibold text-gray-700">Annual Tax</p></div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(calculations.oldLaw.annualTax)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-emerald-700">{formatCurrency(calculations.newLaw.annualTax)}</p>
                      <p className="text-xs text-emerald-600 font-semibold mt-1">{formatCurrency(calculations.savings.annualTax)} less</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-xl">
                    <div><p className="font-semibold text-gray-700">Monthly Tax</p></div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(calculations.oldLaw.monthlyTax)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-emerald-700">{formatCurrency(calculations.newLaw.monthlyTax)}</p>
                      <p className="text-xs text-emerald-600 font-semibold mt-1">{formatCurrency(calculations.savings.monthlyTax)} less</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-xl">
                    <div><p className="font-semibold text-gray-700">Net Monthly Pay</p></div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(calculations.oldLaw.netPay)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-emerald-700">{formatCurrency(calculations.newLaw.netPay)}</p>
                      <p className="text-xs text-emerald-600 font-semibold mt-1">{formatCurrency(calculations.savings.monthlyNetIncrease)} more</p>
                    </div>
                  </div>
                  <div className="p-5 bg-linear-to-r from-emerald-500 to-green-600 rounded-xl text-white text-center">
                    <p className="text-sm font-semibold mb-2">
                      With the New Tax Law, you'll take home:
                    </p>
                    <p className="text-3xl font-bold">
                      {formatCurrency(calculations.savings.monthlyNetIncrease)}{" "}
                      more per month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 animate-fade-in stagger-4">
          <p className="mb-2">
            Based on the Nigeria Tax Act 2025 | Effective from January 1, 2026
          </p>
          <p className="text-xs mb-2">
            Calculator aligned with{" "}
            <a
              href="https://fiscalreforms.ng/index.php/pit-calculator/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline"
            >
              fiscalreforms.ng
            </a>
          </p>
          <p className="text-xs">
            For informational purposes only. Consult a tax professional for
            advice.
          </p>
        </div>
      </div>
    </div>
  );
}
