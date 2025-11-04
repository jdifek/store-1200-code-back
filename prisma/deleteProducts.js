const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");

const prisma = new PrismaClient();
const supabase = createClient(
  "https://jxvbbyoxduggundoajka.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dmJieW94ZHVnZ3VuZG9hamthIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg5NTU3OCwiZXhwIjoyMDc0NDcxNTc4fQ.pRoptUhaf0JL5m4Gt7k00sUot-UELvkf1hwh9MCCInw"
);

async function main() {
  console.log("🗑 Начинаю очистку всех данных...");

  // 1️⃣ Получаем все фото продуктов
  const allImages = await prisma.productImage.findMany();

  // 2️⃣ Удаляем их из Supabase Storage
  for (const img of allImages) {
    const path = img.url.replace(`${supabase.storage.from("publicc").getPublicUrl("").publicUrl}`, "");
    const { error } = await supabase.storage.from("publicc").remove([path]);
    if (error) {
      console.log(`❌ Не удалось удалить ${img.url}:`, error.message);
    } else {
      console.log(`🗑 Удалено из Storage: ${img.url}`);
    }
  }

  // 3️⃣ Удаляем таблицы в БД
  await prisma.productImage.deleteMany();
  console.log("🗑 Все записи productImage удалены");

  await prisma.product.deleteMany();
  console.log("🗑 Все записи product удалены");

  await prisma.category.deleteMany();
  console.log("🗑 Все записи category удалены");

  console.log("🎉 Очистка завершена!");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
});
