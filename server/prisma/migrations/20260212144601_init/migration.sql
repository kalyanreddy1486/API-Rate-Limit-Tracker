-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apis" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "api_key_encrypted" TEXT NOT NULL,
    "rate_limit" INTEGER NOT NULL,
    "rate_limit_period" TEXT NOT NULL,
    "current_usage" INTEGER NOT NULL DEFAULT 0,
    "last_reset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_history" (
    "id" TEXT NOT NULL,
    "api_id" TEXT NOT NULL,
    "requests_count" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "period" TEXT NOT NULL,

    CONSTRAINT "usage_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "api_id" TEXT NOT NULL,
    "threshold_percentage" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_triggered" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "apis_user_id_idx" ON "apis"("user_id");

-- CreateIndex
CREATE INDEX "usage_history_api_id_timestamp_idx" ON "usage_history"("api_id", "timestamp");

-- CreateIndex
CREATE INDEX "alerts_user_id_idx" ON "alerts"("user_id");

-- CreateIndex
CREATE INDEX "alerts_api_id_idx" ON "alerts"("api_id");

-- AddForeignKey
ALTER TABLE "apis" ADD CONSTRAINT "apis_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_history" ADD CONSTRAINT "usage_history_api_id_fkey" FOREIGN KEY ("api_id") REFERENCES "apis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_api_id_fkey" FOREIGN KEY ("api_id") REFERENCES "apis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
