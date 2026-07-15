CREATE TABLE "payslip_access_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"payroll_id" integer NOT NULL,
	"token_hash" char(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_accessed_at" timestamp with time zone,
	"access_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "payslip_access_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "payslip_access_tokens" ADD CONSTRAINT "payslip_access_tokens_payroll_id_payrolls_id_fk" FOREIGN KEY ("payroll_id") REFERENCES "public"."payrolls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payslip_tokens_payroll_idx" ON "payslip_access_tokens" USING btree ("payroll_id");