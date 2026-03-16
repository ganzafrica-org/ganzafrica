-- Make user_id optional (some employees may not yet be in the system)
ALTER TABLE "payrolls" ALTER COLUMN "user_id" DROP NOT NULL;

-- Make basic_salary, gross_salary, net_salary_before_cbhi optional (not all formats have them)
ALTER TABLE "payrolls" ALTER COLUMN "basic_salary" DROP NOT NULL;
ALTER TABLE "payrolls" ALTER COLUMN "gross_salary" DROP NOT NULL;
ALTER TABLE "payrolls" ALTER COLUMN "net_salary_before_cbhi" DROP NOT NULL;

-- Add payroll format type
-- Values: 'rwf' | 'rwf_usd' | 'wop_usd' | 'xof' | 'rwf_wop'
ALTER TABLE "payrolls" ADD COLUMN IF NOT EXISTS "payroll_type" text DEFAULT 'rwf';

-- Currency displayed on the payslip (RWF, USD, XOF)
ALTER TABLE "payrolls" ADD COLUMN IF NOT EXISTS "currency" text DEFAULT 'RWF';

-- Format 2 (WOP/USD international): gross in USD, withholding in USD and RWF, net in USD
ALTER TABLE "payrolls" ADD COLUMN IF NOT EXISTS "gross_usd" numeric(15, 2);
ALTER TABLE "payrolls" ADD COLUMN IF NOT EXISTS "wop_usd" numeric(15, 2);
ALTER TABLE "payrolls" ADD COLUMN IF NOT EXISTS "wop_rwf" numeric(15, 2);

-- Format 3 (Burkina Faso XOF): housing, function, transport allowances
ALTER TABLE "payrolls" ADD COLUMN IF NOT EXISTS "housing_allowance" numeric(15, 2);
ALTER TABLE "payrolls" ADD COLUMN IF NOT EXISTS "function_allowance" numeric(15, 2);
ALTER TABLE "payrolls" ADD COLUMN IF NOT EXISTS "transport_allowance" numeric(15, 2);
