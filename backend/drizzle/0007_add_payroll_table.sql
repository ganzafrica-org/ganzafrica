-- Create payrolls table
CREATE TABLE IF NOT EXISTS "payrolls" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "payroll_period" text NOT NULL,
  "date_of_payment" date NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "staff_fellow_number" text,
  "employee_tin_number" text,
  "employee_id" text,
  "employee_rssb_no" text,
  "program" text,
  "basic_salary" numeric(15, 2) NOT NULL,
  "other" numeric(15, 2) DEFAULT '0',
  "gross_salary" numeric(15, 2) NOT NULL,
  "medical_employer" numeric(15, 2) DEFAULT '0',
  "csr_employer" numeric(15, 2) DEFAULT '0',
  "maternity_employer" numeric(15, 2) DEFAULT '0',
  "total_employer_expenditure" numeric(15, 2) DEFAULT '0',
  "medical_employee" numeric(15, 2) DEFAULT '0',
  "csr_employee" numeric(15, 2) DEFAULT '0',
  "maternity_employee" numeric(15, 2) DEFAULT '0',
  "tpr" numeric(15, 2) DEFAULT '0',
  "net_salary_before_cbhi" numeric(15, 2) NOT NULL,
  "cbhi" numeric(15, 2) DEFAULT '0',
  "net_salary" numeric(15, 2) NOT NULL,
  "total_rra_rssb_cost" numeric(15, 2) DEFAULT '0',
  "bnr_exchange_rate_date" date,
  "exchange_rate_used" numeric(10, 4),
  "net_salary_usd" numeric(15, 2),
  "difference_due_to_exchange" numeric(15, 2),
  "difference_in_rwf" numeric(15, 2),
  "basic_salary_adjustment" numeric(15, 2),
  "payslip_file_url" text,
  "payslip_file_key" text,
  "email_sent" boolean DEFAULT false NOT NULL,
  "email_sent_at" timestamp,
  "email_error" text,
  "uploaded_by" integer NOT NULL,
  "source_filename" text,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add foreign key constraints
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "payrolls_user_id_idx" ON "payrolls" ("user_id");
CREATE INDEX IF NOT EXISTS "payrolls_payroll_period_idx" ON "payrolls" ("payroll_period");
CREATE INDEX IF NOT EXISTS "payrolls_email_sent_idx" ON "payrolls" ("email_sent");
CREATE INDEX IF NOT EXISTS "payrolls_date_of_payment_idx" ON "payrolls" ("date_of_payment");
CREATE INDEX IF NOT EXISTS "payrolls_email_idx" ON "payrolls" ("email");
