import { db } from "../src/lib/db";

/**
 * One-off fix: update English unit descriptions to Bengali.
 */
async function main() {
  const units = await db.unit.findMany();
  let updated = 0;
  for (const u of units) {
    let newDesc: string | null = null;
    if (u.description === "Begin here") newDesc = "এখান থেকে শুরু করুন";
    else if (u.description === "Keep going") newDesc = "এগিয়ে যান";
    else if (u.description === "Master the basics") newDesc = "ভিত্তি আয়ত্ত করুন";
    if (newDesc) {
      await db.unit.update({ where: { id: u.id }, data: { description: newDesc } });
      updated++;
    }
  }
  console.log(`✅ Updated ${updated} unit descriptions to Bengali.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
