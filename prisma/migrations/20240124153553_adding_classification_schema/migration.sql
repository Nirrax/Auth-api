-- CreateTable
CREATE TABLE "classifications" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileName" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "genreDistribution" JSONB NOT NULL,
    "genreSequence" TEXT[],
    "userId" INTEGER NOT NULL,

    CONSTRAINT "classifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "classifications" ADD CONSTRAINT "classifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
