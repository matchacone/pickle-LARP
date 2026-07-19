import { db } from './lib/db/index';
import { invoice, booking, profiles, court } from './lib/db/schema';
import { eq } from 'drizzle-orm';
import { getInvoiceForPayment } from './lib/db/queries/paymentQueries';
import { createBookingWithInvoice } from './lib/db/queries/bookingQueries';

async function run() {
  console.log("Starting test...");
  const user = await db.select().from(profiles).limit(1);
  const c = await db.select().from(court).limit(1);
  
  if (!user[0] || !c[0]) {
    console.log("Missing user or court");
    return;
  }
  
  const startAt = new Date();
  startAt.setHours(startAt.getHours() + 24);
  const endAt = new Date(startAt);
  endAt.setHours(endAt.getHours() + 1);

  console.log("Creating booking...");
  const res = await createBookingWithInvoice({
    userId: user[0].id,
    courtId: c[0].id,
    startAt,
    endAt,
    paymentMethod: "Credit Card"
  });
  
  console.log("Created invoice ID:", res.invoice.id);
  
  const fetched = await getInvoiceForPayment(res.invoice.id);
  console.log("Fetched via getInvoiceForPayment:", fetched);
  
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
