import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Штабелеры" },
    { name: "Реф-контейнеры" },
    { name: "Резервуары" },
    { name: "Посты охраны" },
    { name: "Погрузчики" },
    { name: "Контейнеры" },
    { name: "Ёмкости" },
    { name: "Бытовки на колёсах" },
    { name: "Бытовки" },
    { name: "Асики" },
  ];

  for (const category of categories) {
    await prisma.category.create({
      data: {
        name: category.name,
      },
    });
  }

  console.log("10 категорий успешно созданы!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
