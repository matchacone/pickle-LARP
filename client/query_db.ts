import { db } from './lib/db/index';
import { invoice, booking } from './lib/db/schema';
import { desc } from 'drizzle-orm';

async function main() {
  const latestInvoices = await db.select().from(invoice).orderBy(desc(invoice.createdAt)).limit(5);
  console.log('Latest Invoices:');
  console.log(latestInvoices);
  
  const latestBookings = await db.select().from(booking).orderBy(desc(booking.createdAt)).limit(5);
  console.log('Latest Bookings:');
  console.log(latestBookings);
  
  process.exit(0);
}

main().catch(console.error);
