import { db } from "../src/lib/db";
import { checkAndUnlockAchievements } from "../src/lib/achievements";

/**
 * One-off script: retroactively evaluate & unlock achievements for all users.
 * Run after adding the achievement auto-unlock logic so existing progress is recognized.
 */
async function main() {
  const users = await db.user.findMany({ select: { id: true, name: true } });
  console.log(`Evaluating achievements for ${users.length} users...`);

  let totalUnlocked = 0;
  for (const u of users) {
    const result = await checkAndUnlockAchievements(u.id);
    if (result.unlocked.length > 0) {
      console.log(`  ${u.name}: +${result.unlocked.length} achievements`);
      for (const a of result.unlocked) {
        console.log(`    • ${a.icon} ${a.titleBn}`);
      }
      totalUnlocked += result.unlocked.length;
    }
  }

  console.log(`\n✅ Done. Unlocked ${totalUnlocked} achievements across ${users.length} users.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
