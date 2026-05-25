import { prisma } from "@/lib/prisma";
import { CuponsManager } from "./CuponsManager";

export default async function CuponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-5xl mx-auto">
      <CuponsManager initialCoupons={coupons} />
    </div>
  );
}
