import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();
const supabase = createClient(
  "https://jxvbbyoxduggundoajka.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dmJieW94ZHVnZ3VuZG9hamthIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg5NTU3OCwiZXhwIjoyMDc0NDcxNTc4fQ.pRoptUhaf0JL5m4Gt7k00sUot-UELvkf1hwh9MCCInw"
);

const ROOT_DIR = "E:/store-1200-back/Селхоз";
const BUCKET_NAME = "publicc";

// Транслитерация кириллицы
const translit = {
  "А":"A","Б":"B","В":"V","Г":"G","Д":"D","Е":"E","Ё":"E","Ж":"ZH",
  "З":"Z","И":"I","Й":"I","К":"K","Л":"L","М":"M","Н":"N","О":"O",
  "П":"P","Р":"R","С":"S","Т":"T","У":"U","Ф":"F","Х":"KH","Ц":"TS",
  "Ч":"CH","Ш":"SH","Щ":"SHCH","Ъ":"","Ы":"Y","Ь":"","Э":"E","Ю":"YU","Я":"YA",
  "а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"e","ж":"zh",
  "з":"z","и":"i","й":"i","к":"k","л":"l","м":"m","н":"n","о":"o",
  "п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"kh","ц":"ts",
  "ч":"ch","ш":"sh","щ":"shch","ъ":"","ы":"y","ь":"","э":"e","ю":"yu","я":"ya",
};

// Преобразует сегмент пути (БЕЗ расширения!)
function sanitizeSegment(segment) {
  return segment
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[а-яёА-ЯЁ]/g, (c) => translit[c] || "_")
    .replace(/[^a-zA-Z0-9-_.]/g, "_");
}

// Безопасный путь с сохранением расширения
function getSafeStoragePath(category, product, fileName) {
  const ext = path.extname(fileName); // .jpg
  const nameWithoutExt = path.basename(fileName, ext); // 10
  const safeName = sanitizeSegment(nameWithoutExt) + ext; // 10.jpg
  
  return [
    sanitizeSegment(category),
    sanitizeSegment(product),
    safeName
  ].join("/");
}

// Загрузка в Supabase
async function uploadImageToSupabase(filePath, destPath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(destPath, fileBuffer, { upsert: true });

    if (error) {
      console.error(`❌ Supabase error for ${destPath}:`, error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(destPath);

    return publicUrl;
  } catch (err) {
    console.log(`❌ Ошибка загрузки ${filePath}:`, err.message || err);
    return null;
  }
}

async function main() {
  const categories = fs.readdirSync(ROOT_DIR);

  for (const categoryName of categories) {
    const categoryPath = path.join(ROOT_DIR, categoryName);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    let category = await prisma.category.findFirst({ where: { name: categoryName } });
    if (!category) {
      category = await prisma.category.create({ data: { name: categoryName } });
      console.log(`🆕 Категория ${categoryName} создана`);
    } else {
      console.log(`📂 Обрабатываю категорию: ${categoryName}`);
    }

    const products = fs.readdirSync(categoryPath);

    for (const productFolder of products) {
      const productPath = path.join(categoryPath, productFolder);
      if (!fs.statSync(productPath).isDirectory()) continue;
    
      // Ищем файл описания (может быть "Опис" или "Опис.txt")
      let descFilePath = path.join(productPath, "опис");
      if (!fs.existsSync(descFilePath)) {
        descFilePath = path.join(productPath, "опис.txt");
      }
    
      let productName = productFolder; // По умолчанию берём имя папки
      let description = "";
      let price = 0;
    
      if (fs.existsSync(descFilePath)) {
        const text = fs.readFileSync(descFilePath, "utf-8");
      
        // 💰 Ищем цену только по явному ключевому слову "Ціна:"
        const priceMatch = text.match(/Ціна\s*[:\-]\s*([\d\s.,]+)\s*грн/i);
  if (priceMatch) {
    price = parseFloat(priceMatch[1].replace(/[\s,.\u00A0]/g, ""));
  }

        // 🧹 Убираем только строку с ценой (не трогаем похожие в названии)
        description = text.replace(
          /^.*?Ціна[\s:—\-]*[\d\s.,]+[\s]*грн?[^\n]*\n?/gim,
          ""
        ).trim();
      
        // ✂️ Если есть слово "Опис" — отрезаем всё до него
        const opisIndex = description.search(/Опис/i);
        if (opisIndex !== -1) {
          description = description.slice(opisIndex);
        }
      
        // 🧽 Убираем саму строку "Опис", "Опис:", "Опис —" и т.д.
        description = description.replace(/^Опис[:\s—\-]*\n?/im, "").trim();
      
        // 🏷️ Определяем название
        const firstLine = description.split("\n")[0].trim();
        if (
          firstLine.length > 0 &&
          firstLine.length < 120 &&
          productFolder.match(/^\d+$/)
        ) {
          // Только если имя папки — цифра, берём первую строку как имя
          productName = firstLine;
          description = description.split("\n").slice(1).join("\n").trim();
        }
      
        console.log(`📝 ${productName} | Цена: ${price}`);
      }
      
      
    
      // Проверяем, есть ли товар
      const existing = await prisma.product.findFirst({
        where: { name: productName, categoryId: category.id },
      });
    
      if (existing) {
        console.log(`🔁 ${productName} уже есть, пропускаю`);
        continue;
      }
    
      // Создаём товар
      const product = await prisma.product.create({
        data: {
          name: productName,
          description: description || "",
          price: price || 0,
          categoryId: category.id
        },
      });
    
      // Загружаем фото
      const images = fs.readdirSync(productPath).filter((f) => /\.(jpg|jpeg|png)$/i.test(f));
      let uploadedCount = 0;
    
      for (const img of images) {
        const filePath = path.join(productPath, img);
        const destPath = getSafeStoragePath(categoryName, productFolder, img);
        const publicUrl = await uploadImageToSupabase(filePath, destPath);
    
        if (!publicUrl) {
          console.log(`❌ Не удалось загрузить ${filePath}`);
          continue;
        }
    
        await prisma.productImage.create({
          data: { url: publicUrl, productId: product.id },
        });
        uploadedCount++;
      }
    
      console.log(`✅ ${productName} | Фото: ${uploadedCount}/${images.length}\n`);
    }
  }

  console.log("🎉 Импорт завершён!");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
});