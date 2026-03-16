-- Migration 0009: Align payroll schema strictly with CSV source formats
-- Removes unused columns, adds missing ones (occupational_hazards, gross_rwf, date_rate)

-- Add new columns (safe with IF NOT EXISTS)
ALTER TABLE payrolls ADD COLUMN IF NOT EXISTS occupational_hazards DECIMAL(15,2);
ALTER TABLE payrolls ADD COLUMN IF NOT EXISTS date_rate DATE;
ALTER TABLE payrolls ADD COLUMN IF NOT EXISTS gross_rwf DECIMAL(15,2);

-- Remove columns that are not in any CSV format
ALTER TABLE payrolls DROP COLUMN IF EXISTS other;
ALTER TABLE payrolls DROP COLUMN IF EXISTS medical_employer;
ALTER TABLE payrolls DROP COLUMN IF EXISTS medical_employee;
ALTER TABLE payrolls DROP COLUMN IF EXISTS total_employer_expenditure;
ALTER TABLE payrolls DROP COLUMN IF EXISTS total_rra_rssb_cost;
ALTER TABLE payrolls DROP COLUMN IF EXISTS employee_rssb_no;
ALTER TABLE payrolls DROP COLUMN IF EXISTS employee_tin_number;
ALTER TABLE payrolls DROP COLUMN IF EXISTS difference_due_to_exchange;
ALTER TABLE payrolls DROP COLUMN IF EXISTS difference_in_rwf;
ALTER TABLE payrolls DROP COLUMN IF EXISTS basic_salary_adjustment;

-- Remove DEFAULT constraints so these fields can be NULL for non-Format-1 records
ALTER TABLE payrolls ALTER COLUMN csr_employer DROP DEFAULT;
ALTER TABLE payrolls ALTER COLUMN maternity_employer DROP DEFAULT;
ALTER TABLE payrolls ALTER COLUMN csr_employee DROP DEFAULT;
ALTER TABLE payrolls ALTER COLUMN maternity_employee DROP DEFAULT;
ALTER TABLE payrolls ALTER COLUMN tpr DROP DEFAULT;
ALTER TABLE payrolls ALTER COLUMN cbhi DROP DEFAULT;
