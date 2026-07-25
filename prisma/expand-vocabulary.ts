import { db } from "../src/lib/db";

/**
 * Expand the vocabulary bank from ~31 to 200+ words.
 * Includes authentic Quranic Arabic vocabulary across rich categories.
 * Only inserts words that don't already exist (by arabic text) to avoid duplicates.
 */

type VocabEntry = {
  arabic: string;
  tr: string;
  bn: string;
  en: string;
  pos: string;
  cat: string;
  diff: number;
  exA?: string;
  exB?: string;
};

const newWords: VocabEntry[] = [
  // === Greetings & Politeness (expanded) ===
  { arabic: "السَّلَامُ عَلَيْكُمْ", tr: "as-salāmu ʿalaykum", bn: "আপনার উপর শান্তি বর্ষিত হোক", en: "peace be upon you", pos: "phrase", cat: "greeting", diff: 1 },
  { arabic: "وَعَلَيْكُمُ السَّلَامُ", tr: "wa ʿalaykum as-salām", bn: "আপনার উপরও শান্তি হোক", en: "and peace be upon you too", pos: "phrase", cat: "greeting", diff: 1 },
  { arabic: "أَهْلًا وَسَهْلًا", tr: "ahlan wa sahlan", bn: "স্বাগতম", en: "welcome", pos: "phrase", cat: "greeting", diff: 1 },
  { arabic: "مَرْحَبًا", tr: "marḥaban", bn: "স্বাগতম", en: "hello/welcome", pos: "phrase", cat: "greeting", diff: 1 },
  { arabic: "شُكْرًا", tr: "shukran", bn: "ধন্যবাদ", en: "thank you", pos: "phrase", cat: "greeting", diff: 1 },
  { arabic: "جَزَاكَ اللَّهُ خَيْرًا", tr: "jazāka Allāhu khayran", bn: "আল্লাহ আপনাকে উত্তম প্রতিদান দিন", en: "may Allah reward you with goodness", pos: "phrase", cat: "greeting", diff: 2 },
  { arabic: "عَفْوًا", tr: "ʿafwan", bn: "ক্ষমা করবেন / কিছু না", en: "excuse me / you're welcome", pos: "phrase", cat: "greeting", diff: 1 },
  { arabic: "مَعَ السَّلَامَة", tr: "maʿa as-salāma", bn: "বিদায় / সঙ্গে সঙ্গে শান্তি", en: "goodbye", pos: "phrase", cat: "greeting", diff: 1 },
  { arabic: "بِسْمِ اللَّهِ", tr: "bismi Allāh", bn: "আল্লাহর নামে", en: "in the name of Allah", pos: "phrase", cat: "greeting", diff: 1 },
  { arabic: "الْحَمْدُ لِلَّهِ", tr: "al-ḥamdu lillāh", bn: "সমস্ত প্রশংসা আল্লাহর জন্য", en: "all praise is for Allah", pos: "phrase", cat: "greeting", diff: 1 },
  { arabic: "إِنْ شَاءَ اللَّهُ", tr: "in shāʾa Allāh", bn: "আল্লাহ চাইলে", en: "if Allah wills", pos: "phrase", cat: "greeting", diff: 1 },
  { arabic: "مَا شَاءَ اللَّهُ", tr: "mā shāʾa Allāh", bn: "আল্লাহ যা চেয়েছেন", en: "what Allah has willed (amazing!)", pos: "phrase", cat: "greeting", diff: 2 },
  { arabic: "صَبَاحُ الْخَيْرِ", tr: "ṣabāḥu al-khayri", bn: "শুভ সকাল", en: "good morning", pos: "phrase", cat: "greeting", diff: 1 },
  { arabic: "مَسَاءُ الْخَيْرِ", tr: "masāʾu al-khayri", bn: "শুভ সন্ধ্যা", en: "good evening", pos: "phrase", cat: "greeting", diff: 1 },

  // === Family (expanded) ===
  { arabic: "جَدٌّ", tr: "jadd", bn: "দাদা/নানা", en: "grandfather", pos: "noun", cat: "family", diff: 2 },
  { arabic: "جَدَّةٌ", tr: "jadda", bn: "দাদি/নানি", en: "grandmother", pos: "noun", cat: "family", diff: 2 },
  { arabic: "أَخٌ", tr: "akh", bn: "ভাই", en: "brother", pos: "noun", cat: "family", diff: 1 },
  { arabic: "أُخْتٌ", tr: "ukht", bn: "বোন", en: "sister", pos: "noun", cat: "family", diff: 1 },
  { arabic: "زَوْجٌ", tr: "zawj", bn: "স্বামী", en: "husband", pos: "noun", cat: "family", diff: 2 },
  { arabic: "زَوْجَةٌ", tr: "zawja", bn: "স্ত্রী", en: "wife", pos: "noun", cat: "family", diff: 2 },
  { arabic: "ابْنٌ", tr: "ibn", bn: "পুত্র", en: "son", pos: "noun", cat: "family", diff: 2 },
  { arabic: "بِنْتٌ", tr: "bint", bn: "কন্যা", en: "daughter", pos: "noun", cat: "family", diff: 2 },
  { arabic: "صَدِيقٌ", tr: "ṣadīq", bn: "বন্ধু", en: "friend", pos: "noun", cat: "family", diff: 1 },
  { arabic: "جَارٌ", tr: "jār", bn: "প্রতিবেশী", en: "neighbor", pos: "noun", cat: "family", diff: 2 },
  { arabic: "أُسْرَةٌ", tr: "usra", bn: "পরিবার", en: "family", pos: "noun", cat: "family", diff: 2 },
  { arabic: "وَلَدٌ", tr: "walad", bn: "ছেলে", en: "boy/child", pos: "noun", cat: "family", diff: 1 },

  // === Food & Drink (expanded) ===
  { arabic: "مَاءٌ", tr: "māʾ", bn: "পানি", en: "water", pos: "noun", cat: "food", diff: 1 },
  { arabic: "حَلِيبٌ", tr: "ḥalīb", bn: "দুধ", en: "milk", pos: "noun", cat: "food", diff: 2 },
  { arabic: "خُبْزٌ", tr: "khubz", bn: "রুটি", en: "bread", pos: "noun", cat: "food", diff: 1 },
  { arabic: "لَحْمٌ", tr: "laḥm", bn: "মাংস", en: "meat", pos: "noun", cat: "food", diff: 2 },
  { arabic: "سَمَكٌ", tr: "samak", bn: "মাছ", en: "fish", pos: "noun", cat: "food", diff: 2 },
  { arabic: "تُفَّاحٌ", tr: "tuffāḥ", bn: "আপেল", en: "apple", pos: "noun", cat: "food", diff: 2 },
  { arabic: "تَمْرٌ", tr: "tamr", bn: "খেজুর", en: "dates", pos: "noun", cat: "food", diff: 2 },
  { arabic: "عَسَلٌ", tr: "ʿasal", bn: "মধু", en: "honey", pos: "noun", cat: "food", diff: 2 },
  { arabic: "أَرُزٌّ", tr: "aruzz", bn: "চাল", en: "rice", pos: "noun", cat: "food", diff: 2 },
  { arabic: "شَايٌ", tr: "shāy", bn: "চা", en: "tea", pos: "noun", cat: "food", diff: 1 },
  { arabic: "قَهْوَةٌ", tr: "qahwa", bn: "কফি", en: "coffee", pos: "noun", cat: "food", diff: 2 },
  { arabic: "سُكَّرٌ", tr: "sukkar", bn: "চিনি", en: "sugar", pos: "noun", cat: "food", diff: 2 },
  { arabic: "مِلْحٌ", tr: "milḥ", bn: "লবণ", en: "salt", pos: "noun", cat: "food", diff: 2 },
  { arabic: "فَاكِهَةٌ", tr: "fākiha", bn: "ফল", en: "fruit", pos: "noun", cat: "food", diff: 2 },

  // === Numbers ===
  { arabic: "وَاحِدٌ", tr: "wāḥid", bn: "এক", en: "one", pos: "number", cat: "numbers", diff: 1 },
  { arabic: "اثْنَانِ", tr: "ithnān", bn: "দুই", en: "two", pos: "number", cat: "numbers", diff: 1 },
  { arabic: "ثَلَاثَةٌ", tr: "thalātha", bn: "তিন", en: "three", pos: "number", cat: "numbers", diff: 1 },
  { arabic: "أَرْبَعَةٌ", tr: "arbaʿa", bn: "চার", en: "four", pos: "number", cat: "numbers", diff: 1 },
  { arabic: "خَمْسَةٌ", tr: "khamsa", bn: "পাঁচ", en: "five", pos: "number", cat: "numbers", diff: 1 },
  { arabic: "سِتَّةٌ", tr: "sitta", bn: "ছয়", en: "six", pos: "number", cat: "numbers", diff: 2 },
  { arabic: "سَبْعَةٌ", tr: "sabʿa", bn: "সাত", en: "seven", pos: "number", cat: "numbers", diff: 2 },
  { arabic: "ثَمَانِيَةٌ", tr: "thamāniya", bn: "আট", en: "eight", pos: "number", cat: "numbers", diff: 2 },
  { arabic: "تِسْعَةٌ", tr: "tisʿa", bn: "নয়", en: "nine", pos: "number", cat: "numbers", diff: 2 },
  { arabic: "عَشَرَةٌ", tr: "ʿashara", bn: "দশ", en: "ten", pos: "number", cat: "numbers", diff: 2 },
  { arabic: "مِائَةٌ", tr: "miʾa", bn: "একশত", en: "hundred", pos: "number", cat: "numbers", diff: 3 },
  { arabic: "أَلْفٌ", tr: "alf", bn: "এক হাজার", en: "thousand", pos: "number", cat: "numbers", diff: 3 },

  // === Colors ===
  { arabic: "أَحْمَرُ", tr: "aḥmar", bn: "লাল", en: "red", pos: "adjective", cat: "colors", diff: 2 },
  { arabic: "أَزْرَقُ", tr: "azraq", bn: "নীল", en: "blue", pos: "adjective", cat: "colors", diff: 2 },
  { arabic: "أَخْضَرُ", tr: "akhḍar", bn: "সবুজ", en: "green", pos: "adjective", cat: "colors", diff: 2 },
  { arabic: "أَصْفَرُ", tr: "aṣfar", bn: "হলুদ", en: "yellow", pos: "adjective", cat: "colors", diff: 2 },
  { arabic: "أَبْيَضُ", tr: "abyaḍ", bn: "সাদা", en: "white", pos: "adjective", cat: "colors", diff: 2 },
  { arabic: "أَسْوَدُ", tr: "aswad", bn: "কালো", en: "black", pos: "adjective", cat: "colors", diff: 2 },
  { arabic: "بُرْتُقَالِيٌّ", tr: "burtuqālī", bn: "কমলা", en: "orange", pos: "adjective", cat: "colors", diff: 3 },
  { arabic: "بُنِّيٌّ", tr: "bunnī", bn: "বাদামী", en: "brown", pos: "adjective", cat: "colors", diff: 3 },

  // === Nature (expanded) ===
  { arabic: "سَمَاءٌ", tr: "samāʾ", bn: "আকাশ", en: "sky", pos: "noun", cat: "nature", diff: 2 },
  { arabic: "أَرْضٌ", tr: "arḍ", bn: "পৃথিবী/মাটি", en: "earth/ground", pos: "noun", cat: "nature", diff: 2 },
  { arabic: "جَبَلٌ", tr: "jabal", bn: "পাহাড়", en: "mountain", pos: "noun", cat: "nature", diff: 2 },
  { arabic: "بَحْرٌ", tr: "baḥr", bn: "সমুদ্র", en: "sea", pos: "noun", cat: "nature", diff: 2 },
  { arabic: "نَهْرٌ", tr: "nahr", bn: "নদী", en: "river", pos: "noun", cat: "nature", diff: 2 },
  { arabic: "شَجَرَةٌ", tr: "shajara", bn: "গাছ", en: "tree", pos: "noun", cat: "nature", diff: 2 },
  { arabic: "زَهْرَةٌ", tr: "zahra", bn: "ফুল", en: "flower", pos: "noun", cat: "nature", diff: 2 },
  { arabic: "مَطَرٌ", tr: "maṭar", bn: "বৃষ্টি", en: "rain", pos: "noun", cat: "nature", diff: 2 },
  { arabic: "رِيحٌ", tr: "rīḥ", bn: "বাতাস", en: "wind", pos: "noun", cat: "nature", diff: 2 },
  { arabic: "ثَلْجٌ", tr: "thalj", bn: "বরফ", en: "snow", pos: "noun", cat: "nature", diff: 3 },
  { arabic: "نَارٌ", tr: "nār", bn: "আগুন", en: "fire", pos: "noun", cat: "nature", diff: 2 },
  { arabic: "حَجَرٌ", tr: "ḥajar", bn: "পাথর", en: "stone", pos: "noun", cat: "nature", diff: 2 },
  { arabic: "رَمْلٌ", tr: "raml", bn: "বালি", en: "sand", pos: "noun", cat: "nature", diff: 2 },
  { arabic: "بَحْرٌ", tr: "baḥr", bn: "সমুদ্র", en: "sea", pos: "noun", cat: "nature", diff: 2 },

  // === Animals ===
  { arabic: "أَسَدٌ", tr: "asad", bn: "সিংহ", en: "lion", pos: "noun", cat: "animals", diff: 2 },
  { arabic: "قِطٌّ", tr: "qiṭṭ", bn: "বিড়াল", en: "cat", pos: "noun", cat: "animals", diff: 1 },
  { arabic: "كَلْبٌ", tr: "kalb", bn: "কুকুর", en: "dog", pos: "noun", cat: "animals", diff: 1 },
  { arabic: "حِصَانٌ", tr: "ḥiṣān", bn: "ঘোড়া", en: "horse", pos: "noun", cat: "animals", diff: 2 },
  { arabic: "جَمَلٌ", tr: "jamal", bn: "উট", en: "camel", pos: "noun", cat: "animals", diff: 2 },
  { arabic: "بَقَرَةٌ", tr: "baqara", bn: "গরু", en: "cow", pos: "noun", cat: "animals", diff: 2 },
  { arabic: "شَاةٌ", tr: "shāt", bn: "ভেড়া", en: "sheep", pos: "noun", cat: "animals", diff: 2 },
  { arabic: "دَجَاجَةٌ", tr: "dajāja", bn: "মুরগি", en: "chicken", pos: "noun", cat: "animals", diff: 2 },
  { arabic: "عُصْفُورٌ", tr: "ʿuṣfūr", bn: "পাখি", en: "bird/sparrow", pos: "noun", cat: "animals", diff: 3 },
  { arabic: "سَمَكَةٌ", tr: "samaka", bn: "মাছ", en: "fish", pos: "noun", cat: "animals", diff: 2 },
  { arabic: "فِيلٌ", tr: "fīl", bn: "হাতি", en: "elephant", pos: "noun", cat: "animals", diff: 3 },

  // === Body parts ===
  { arabic: "رَأْسٌ", tr: "raʾs", bn: "মাথা", en: "head", pos: "noun", cat: "body", diff: 2 },
  { arabic: "عَيْنٌ", tr: "ʿayn", bn: "চোখ", en: "eye", pos: "noun", cat: "body", diff: 2 },
  { arabic: "أُذُنٌ", tr: "udhun", bn: "কান", en: "ear", pos: "noun", cat: "body", diff: 2 },
  { arabic: "أَنْفٌ", tr: "anf", bn: "নাক", en: "nose", pos: "noun", cat: "body", diff: 2 },
  { arabic: "فَمٌ", tr: "fam", bn: "মুখ", en: "mouth", pos: "noun", cat: "body", diff: 2 },
  { arabic: "يَدٌ", tr: "yad", bn: "হাত", en: "hand", pos: "noun", cat: "body", diff: 1 },
  { arabic: "رِجْلٌ", tr: "rijl", bn: "পা", en: "foot/leg", pos: "noun", cat: "body", diff: 2 },
  { arabic: "قَلْبٌ", tr: "qalb", bn: "হৃদয়", en: "heart", pos: "noun", cat: "body", diff: 2 },
  { arabic: "بَطْنٌ", tr: "baṭn", bn: "পেট", en: "stomach", pos: "noun", cat: "body", diff: 2 },
  { arabic: "شَعْرٌ", tr: "shaʿr", bn: "চুল", en: "hair", pos: "noun", cat: "body", diff: 2 },
  { arabic: "أَسْنَانٌ", tr: "asnān", bn: "দাঁত", en: "teeth", pos: "noun", cat: "body", diff: 3 },

  // === Common verbs ===
  { arabic: "كَتَبَ", tr: "kataba", bn: "সে লিখেছে", en: "he wrote", pos: "verb", cat: "verbs", diff: 3 },
  { arabic: "قَرَأَ", tr: "qaraʾa", bn: "সে পড়েছে", en: "he read", pos: "verb", cat: "verbs", diff: 3 },
  { arabic: "ذَهَبَ", tr: "dhahaba", bn: "সে গিয়েছে", en: "he went", pos: "verb", cat: "verbs", diff: 3 },
  { arabic: "أَكَلَ", tr: "akala", bn: "সে খেয়েছে", en: "he ate", pos: "verb", cat: "verbs", diff: 2 },
  { arabic: "شَرِبَ", tr: "shariba", bn: "সে পান করেছে", en: "he drank", pos: "verb", cat: "verbs", diff: 2 },
  { arabic: "نَامَ", tr: "nāma", bn: "সে ঘুমিয়েছে", en: "he slept", pos: "verb", cat: "verbs", diff: 2 },
  { arabic: "قَامَ", tr: "qāma", bn: "সে দাঁড়িয়েছে", en: "he stood up", pos: "verb", cat: "verbs", diff: 3 },
  { arabic: "جَلَسَ", tr: "jalasa", bn: "সে বসেছে", en: "he sat", pos: "verb", cat: "verbs", diff: 3 },
  { arabic: "رَأَى", tr: "raʾā", bn: "সে দেখেছে", en: "he saw", pos: "verb", cat: "verbs", diff: 3 },
  { arabic: "سَمِعَ", tr: "samiʿa", bn: "সে শুনেছে", en: "he heard", pos: "verb", cat: "verbs", diff: 3 },
  { arabic: "تَكَلَّمَ", tr: "takallama", bn: "সে কথা বলেছে", en: "he spoke", pos: "verb", cat: "verbs", diff: 3 },
  { arabic: "فَهِمَ", tr: "fahima", bn: "সে বুঝেছে", en: "he understood", pos: "verb", cat: "verbs", diff: 3 },
  { arabic: "دَخَلَ", tr: "dakhala", bn: "সে প্রবেশ করেছে", en: "he entered", pos: "verb", cat: "verbs", diff: 3 },
  { arabic: "خَرَجَ", tr: "kharaja", bn: "সে বের হয়েছে", en: "he exited", pos: "verb", cat: "verbs", diff: 3 },
  { arabic: "فَتَحَ", tr: "fataḥa", bn: "সে খুলেছে", en: "he opened", pos: "verb", cat: "verbs", diff: 3 },
  { arabic: "أَغْلَقَ", tr: "aghlāqa", bn: "সে বন্ধ করেছে", en: "he closed", pos: "verb", cat: "verbs", diff: 3 },

  // === Adjectives (expanded) ===
  { arabic: "جَدِيدٌ", tr: "jadīd", bn: "নতুন", en: "new", pos: "adjective", cat: "adjectives", diff: 2 },
  { arabic: "قَدِيمٌ", tr: "qadīm", bn: "পুরোনো", en: "old", pos: "adjective", cat: "adjectives", diff: 2 },
  { arabic: "طَوِيلٌ", tr: "ṭawīl", bn: "লম্বা", en: "tall/long", pos: "adjective", cat: "adjectives", diff: 2 },
  { arabic: "قَصِيرٌ", tr: "qaṣīr", bn: "ছোট/খাটো", en: "short", pos: "adjective", cat: "adjectives", diff: 2 },
  { arabic: "وَاسِعٌ", tr: "wāsiʿ", bn: "প্রশস্ত", en: "wide/spacious", pos: "adjective", cat: "adjectives", diff: 3 },
  { arabic: "ضَيِّقٌ", tr: "ḍayyiq", bn: "সংকীর্ণ", en: "narrow", pos: "adjective", cat: "adjectives", diff: 3 },
  { arabic: "سَرِيعٌ", tr: "sarīʿ", bn: "দ্রুত", en: "fast", pos: "adjective", cat: "adjectives", diff: 2 },
  { arabic: "بَطِيءٌ", tr: "baṭīʾ", bn: "ধীর", en: "slow", pos: "adjective", cat: "adjectives", diff: 3 },
  { arabic: "سَهْلٌ", tr: "sahl", bn: "সহজ", en: "easy", pos: "adjective", cat: "adjectives", diff: 2 },
  { arabic: "صَعْبٌ", tr: "ṣaʿb", bn: "কঠিন", en: "difficult", pos: "adjective", cat: "adjectives", diff: 2 },
  { arabic: "نَظِيفٌ", tr: "naḍīf", bn: "পরিচ্ছন্ন", en: "clean", pos: "adjective", cat: "adjectives", diff: 3 },
  { arabic: "مُتَّسِخٌ", tr: "muttakhikh", bn: "নোংরা", en: "dirty", pos: "adjective", cat: "adjectives", diff: 3 },
  { arabic: "غَنِيٌّ", tr: "ghanī", bn: "ধনী", en: "rich", pos: "adjective", cat: "adjectives", diff: 3 },
  { arabic: "فَقِيرٌ", tr: "faqīr", bn: "গরিব", en: "poor", pos: "adjective", cat: "adjectives", diff: 3 },
  { arabic: "قَوِيٌّ", tr: "qawī", bn: "শক্তিশালী", en: "strong", pos: "adjective", cat: "adjectives", diff: 3 },
  { arabic: "ضَعِيفٌ", tr: "ḍaʿīf", bn: "দুর্বল", en: "weak", pos: "adjective", cat: "adjectives", diff: 3 },

  // === Places ===
  { arabic: "الْمَسْجِدُ", tr: "al-masjid", bn: "মসজিদ", en: "the mosque", pos: "noun", cat: "places", diff: 1 },
  { arabic: "الْبَيْتُ", tr: "al-bayt", bn: "ঘর", en: "the house", pos: "noun", cat: "places", diff: 1 },
  { arabic: "الْمَدْرَسَةُ", tr: "al-madrasa", bn: "স্কুল", en: "the school", pos: "noun", cat: "places", diff: 2 },
  { arabic: "الْمَدِينَةُ", tr: "al-madīna", bn: "শহর", en: "the city", pos: "noun", cat: "places", diff: 2 },
  { arabic: "الْقَرْيَةُ", tr: "al-qarya", bn: "গ্রাম", en: "the village", pos: "noun", cat: "places", diff: 2 },
  { arabic: "السُّوقُ", tr: "as-sūq", bn: "বাজার", en: "the market", pos: "noun", cat: "places", diff: 2 },
  { arabic: "الْمُسْتَشْفَى", tr: "al-mustashfā", bn: "হাসপাতাল", en: "the hospital", pos: "noun", cat: "places", diff: 3 },
  { arabic: "الْمَكْتَبَةُ", tr: "al-maktaba", bn: "গ্রন্থাগার", en: "the library", pos: "noun", cat: "places", diff: 3 },
  { arabic: "الْحَدِيقَةُ", tr: "al-ḥadīqa", bn: "বাগান", en: "the garden", pos: "noun", cat: "places", diff: 3 },
  { arabic: "الْمَطْعَمُ", tr: "al-maṭʿam", bn: "রেস্তোরাঁ", en: "the restaurant", pos: "noun", cat: "places", diff: 3 },

  // === Time (expanded) ===
  { arabic: "الْيَوْمُ", tr: "al-yawm", bn: "আজ", en: "today", pos: "noun", cat: "time", diff: 1 },
  { arabic: "غَدًا", tr: "ghadan", bn: "আগামীকাল", en: "tomorrow", pos: "noun", cat: "time", diff: 2 },
  { arabic: "أَمْسِ", tr: "amsi", bn: "গতকাল", en: "yesterday", pos: "noun", cat: "time", diff: 2 },
  { arabic: "الصَّبَاحُ", tr: "aṣ-ṣabāḥ", bn: "সকাল", en: "morning", pos: "noun", cat: "time", diff: 2 },
  { arabic: "الْمَسَاءُ", tr: "al-masāʾ", bn: "সন্ধ্যা", en: "evening", pos: "noun", cat: "time", diff: 2 },
  { arabic: "اللَّيْلُ", tr: "al-layl", bn: "রাত", en: "night", pos: "noun", cat: "time", diff: 1 },
  { arabic: "النَّهَارُ", tr: "an-nahār", bn: "দিন", en: "daytime", pos: "noun", cat: "time", diff: 2 },
  { arabic: "الْأُسْبُوعُ", tr: "al-usbūʿ", bn: "সপ্তাহ", en: "week", pos: "noun", cat: "time", diff: 3 },
  { arabic: "الشَّهْرُ", tr: "ash-shahr", bn: "মাস", en: "month", pos: "noun", cat: "time", diff: 3 },
  { arabic: "السَّنَةُ", tr: "as-sana", bn: "বছর", en: "year", pos: "noun", cat: "time", diff: 3 },
  { arabic: "السَّاعَةُ", tr: "as-sāʿa", bn: "ঘণ্টা/সময়", en: "hour/clock", pos: "noun", cat: "time", diff: 3 },

  // === Deen / Religion (expanded Quranic) ===
  { arabic: "اللَّهُ", tr: "Allāh", bn: "আল্লাহ", en: "Allah", pos: "noun", cat: "deen", diff: 1 },
  { arabic: "رَبٌّ", tr: "rabb", bn: "প্রভু", en: "Lord", pos: "noun", cat: "deen", diff: 2 },
  { arabic: "إِيمَانٌ", tr: "īmān", bn: "ঈমান/বিশ্বাস", en: "faith", pos: "noun", cat: "deen", diff: 3 },
  { arabic: "إِسْلَامٌ", tr: "islām", bn: "ইসলাম", en: "Islam", pos: "noun", cat: "deen", diff: 2 },
  { arabic: "مُسْلِمٌ", tr: "muslim", bn: "মুসলিম", en: "Muslim", pos: "noun", cat: "deen", diff: 2 },
  { arabic: "قُرْآنٌ", tr: "qurʾān", bn: "কুরআন", en: "Quran", pos: "noun", cat: "deen", diff: 2 },
  { arabic: "نَبِيٌّ", tr: "nabī", bn: "নবী", en: "prophet", pos: "noun", cat: "deen", diff: 3 },
  { arabic: "رَسُولٌ", tr: "rasūl", bn: "রাসূল", en: "messenger", pos: "noun", cat: "deen", diff: 3 },
  { arabic: "صَلَاةٌ", tr: "ṣalāt", bn: "সালাত/নামাজ", en: "prayer", pos: "noun", cat: "deen", diff: 3 },
  { arabic: "زَكَاةٌ", tr: "zakāt", bn: "যাকাত", en: "charity/alms", pos: "noun", cat: "deen", diff: 3 },
  { arabic: "صَوْمٌ", tr: "ṣawm", bn: "রোজা/সিয়াম", en: "fasting", pos: "noun", cat: "deen", diff: 3 },
  { arabic: "حَجٌّ", tr: "ḥajj", bn: "হজ", en: "pilgrimage", pos: "noun", cat: "deen", diff: 3 },
  { arabic: "مَسْجِدٌ", tr: "masjid", bn: "মসজিদ", en: "mosque", pos: "noun", cat: "deen", diff: 2 },
  { arabic: "جَنَّةٌ", tr: "janna", bn: "জান্নাত", en: "paradise", pos: "noun", cat: "deen", diff: 3 },
  { arabic: "جَهَنَّمُ", tr: "jahannam", bn: "জাহান্নাম", en: "hell", pos: "noun", cat: "deen", diff: 4 },
  { arabic: "ذَنْبٌ", tr: "dhanb", bn: "পাপ", en: "sin", pos: "noun", cat: "deen", diff: 3 },
  { arabic: "تَوْبَةٌ", tr: "tawba", bn: "তওবা", en: "repentance", pos: "noun", cat: "deen", diff: 4 },
  { arabic: "رَحْمَةٌ", tr: "raḥma", bn: "রহমত/করুণা", en: "mercy", pos: "noun", cat: "deen", diff: 3 },
  { arabic: "بَرَكَةٌ", tr: "baraka", bn: "বরকত", en: "blessing", pos: "noun", cat: "deen", diff: 3 },
  { arabic: "دُعَاءٌ", tr: "duʿāʾ", bn: "দোয়া", en: "supplication", pos: "noun", cat: "deen", diff: 3 },
  { arabic: "أَذَانٌ", tr: "adhān", bn: "আজান", en: "call to prayer", pos: "noun", cat: "deen", diff: 3 },
  { arabic: "وُضُوءٌ", tr: "wuḍūʾ", bn: "ওযু", en: "ablution", pos: "noun", cat: "deen", diff: 4 },

  // === Objects (expanded) ===
  { arabic: "كِتَابٌ", tr: "kitāb", bn: "বই", en: "book", pos: "noun", cat: "objects", diff: 1, exA: "هَذَا كِتَابٌ", exB: "এটি একটি বই" },
  { arabic: "قَلَمٌ", tr: "qalam", bn: "কলম", en: "pen", pos: "noun", cat: "objects", diff: 1 },
  { arabic: "مِفْتَاحٌ", tr: "miftāḥ", bn: "চাবি", en: "key", pos: "noun", cat: "objects", diff: 3 },
  { arabic: "كُرْسِيٌّ", tr: "kursī", bn: "চেয়ার", en: "chair", pos: "noun", cat: "objects", diff: 2 },
  { arabic: "طَاوِلَةٌ", tr: "ṭāwila", bn: "টেবিল", en: "table", pos: "noun", cat: "objects", diff: 2 },
  { arabic: "بَابٌ", tr: "bāb", bn: "দরজা", en: "door", pos: "noun", cat: "objects", diff: 2 },
  { arabic: "شُبَّاكٌ", tr: "shubbāk", bn: "জানালা", en: "window", pos: "noun", cat: "objects", diff: 3 },
  { arabic: "سَاعَةٌ", tr: "sāʿa", bn: "ঘড়ি", en: "watch/clock", pos: "noun", cat: "objects", diff: 2 },
  { arabic: "تِلِفَازٌ", tr: "tilifāz", bn: "টেলিভিশন", en: "television", pos: "noun", cat: "objects", diff: 3 },
  { arabic: "هَاتِفٌ", tr: "hātif", bn: "ফোন", en: "phone", pos: "noun", cat: "objects", diff: 2 },
  { arabic: "سَيَّارَةٌ", tr: "sayyāra", bn: "গাড়ি", en: "car", pos: "noun", cat: "objects", diff: 2 },
  { arabic: "مِرْوَحَةٌ", tr: "mirwaḥa", bn: "পাখা", en: "fan", pos: "noun", cat: "objects", diff: 3 },
  { arabic: "مِصْبَاحٌ", tr: "miṣbāḥ", bn: "বাতি", en: "lamp", pos: "noun", cat: "objects", diff: 3 },

  // === People / Professions ===
  { arabic: "رَجُلٌ", tr: "rajul", bn: "পুরুষ", en: "man", pos: "noun", cat: "people", diff: 1 },
  { arabic: "امْرَأَةٌ", tr: "imraʾa", bn: "নারী", en: "woman", pos: "noun", cat: "people", diff: 2 },
  { arabic: "وَلَدٌ", tr: "walad", bn: "ছেলে", en: "boy", pos: "noun", cat: "people", diff: 1 },
  { arabic: "بِنْتٌ", tr: "bint", bn: "মেয়ে", en: "girl", pos: "noun", cat: "people", diff: 1 },
  { arabic: "مُعَلِّمٌ", tr: "muʿallim", bn: "শিক্ষক", en: "teacher", pos: "noun", cat: "people", diff: 2 },
  { arabic: "طَالِبٌ", tr: "ṭālib", bn: "ছাত্র", en: "student", pos: "noun", cat: "people", diff: 2 },
  { arabic: "طَبِيبٌ", tr: "ṭabīb", bn: "ডাক্তার", en: "doctor", pos: "noun", cat: "people", diff: 3 },
  { arabic: "مُهَنْدِسٌ", tr: "muhandis", bn: "প্রকৌশলী", en: "engineer", pos: "noun", cat: "people", diff: 3 },
  { arabic: "تَاجِرٌ", tr: "tājir", bn: "ব্যবসায়ী", en: "merchant", pos: "noun", cat: "people", diff: 3 },
  { arabic: "خَبَّازٌ", tr: "khabbāz", bn: "রুটি বিক্রেতা", en: "baker", pos: "noun", cat: "people", diff: 4 },

  // === Common phrases / question words ===
  { arabic: "مَا هَذَا؟", tr: "mā hādhā", bn: "এটি কী?", en: "what is this?", pos: "phrase", cat: "phrases", diff: 1 },
  { arabic: "مَنْ أَنْتَ؟", tr: "man anta", bn: "আপনি কে?", en: "who are you?", pos: "phrase", cat: "phrases", diff: 2 },
  { arabic: "أَيْنَ؟", tr: "ayna", bn: "কোথায়?", en: "where?", pos: "particle", cat: "phrases", diff: 2 },
  { arabic: "مَتَى؟", tr: "matā", bn: "কখন?", en: "when?", pos: "particle", cat: "phrases", diff: 2 },
  { arabic: "لِمَاذَا؟", tr: "limādhā", bn: "কেন?", en: "why?", pos: "particle", cat: "phrases", diff: 3 },
  { arabic: "كَمْ؟", tr: "kam", bn: "কত?", en: "how much/how many?", pos: "particle", cat: "phrases", diff: 2 },
  { arabic: "هَلْ؟", tr: "hal", bn: "(হ্যাঁ/না প্রশ্ন)", en: "is/are? (question)", pos: "particle", cat: "phrases", diff: 3 },
  { arabic: "نَعَمْ", tr: "naʿam", bn: "হ্যাঁ", en: "yes", pos: "particle", cat: "phrases", diff: 1 },
  { arabic: "لَا", tr: "lā", bn: "না", en: "no", pos: "particle", cat: "phrases", diff: 1 },
];

async function main() {
  console.log(`📚 Expanding vocabulary bank with ${newWords.length} words...`);

  // Get existing Arabic words to avoid duplicates
  const existing = await db.vocabulary.findMany({ select: { arabic: true } });
  const existingSet = new Set(existing.map((e) => e.arabic));
  console.log(`   Existing words in DB: ${existingSet.size}`);

  let inserted = 0;
  let skipped = 0;
  for (const w of newWords) {
    if (existingSet.has(w.arabic)) {
      skipped++;
      continue;
    }
    await db.vocabulary.create({
      data: {
        arabic: w.arabic,
        transliteration: w.tr,
        bangla: w.bn,
        english: w.en,
        partOfSpeech: w.pos,
        category: w.cat,
        difficulty: w.diff,
        exampleArabic: w.exA,
        exampleBangla: w.exB,
      },
    });
    inserted++;
  }

  const total = await db.vocabulary.count();
  const byCategory = await db.vocabulary.groupBy({ by: ["category"], _count: true, orderBy: { category: "asc" } });

  console.log(`\n✅ Inserted: ${inserted} | Skipped (duplicates): ${skipped}`);
  console.log(`📚 Total vocabulary now: ${total}`);
  console.log("\nBy category:");
  byCategory.forEach((c) => console.log(`   ${c.category}: ${c._count}`));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
