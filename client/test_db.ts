import { db } from './lib/db/index';
import { createBookingWithInvoice } from './lib/db/queries/bookingQueries';
import { getInvoiceForPayment, confirmPayment } from './lib/db/queries/paymentQueries';
import { profiles, court } from './lib/db/schema';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

async function main() {
  const [user] = await db.select().from(profiles).limit(1);
  const [c] = await db.select().from(court).where(eq(court.status, 'active')).limit(1);

  if (!user || !c) {
    console.log("No user or court found");
    process.exit(0);
  }

  const startAt = new Date();
  startAt.setDate(startAt.getDate() + 2);
  const endAt = new Date(startAt);
  endAt.setHours(endAt.getHours() + 1);

  try {
    const result = await createBookingWithInvoice({
      userId: user.id,
      courtId: c.id,
      startAt,
      endAt,
      paymentMethod: 'Credit Card',
    });
    console.log("Created booking+invoice:", result);
    
    const invoiceId = result.invoice.id;
    console.log("Invoice ID is", invoiceId);

    const inv = await getInvoiceForPayment(invoiceId);
    console.log("Fetched invoice for payment:", inv);
    
    if (!inv) {
      console.log("INVOICE NOT FOUND!");
    } else {
      console.log("Invoice found successfully.");
      await confirmPayment(invoiceId);
      console.log("Payment confirmed.");
    }

  } catch (err) {
    console.error("Error:", err);
  }

  process.exit(0);
}

main().catch(console.error);
