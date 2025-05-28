const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Fungsi helper untuk format tanggal Indonesia
function formatIndoDate(date) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

async function createGallery(data) {
  const created = await prisma.galeri.create({
    data: {
      title: data.title,
      description: data.description,
      startDate: new Date(data.startDate),
      image: data.image,
    },
  });

  return {
    ...created,
    startDate: formatIndoDate(created.startDate),
  };
}

async function getAllGalleries() {
  const galleries = await prisma.galeri.findMany({
    orderBy: {
      startDate: 'desc'
    }
  });

  return galleries.map((g) => ({
    ...g,
    startDate: formatIndoDate(g.startDate),
  }));
}

async function getGalleryById(id) {
  const gallery = await prisma.galeri.findUnique({
    where: { id: Number(id) },
  });

  if (!gallery) return null;

  return {
    ...gallery,
    startDate: formatIndoDate(gallery.startDate),
  };
}

async function updateGallery(id, data) {
  const galleryId = Number(id);
  const existing = await prisma.galeri.findUnique({
    where: { id: galleryId },
  });

  if (!existing) return null;

  const updated = await prisma.galeri.update({
    where: { id: galleryId },
    data: {
      title: data.title,
      description: data.description,
      startDate: new Date(data.startDate),
      ...(data.image && { image: data.image }),
    },
  });

  return {
    ...updated,
    startDate: formatIndoDate(updated.startDate),
  };
}

async function deleteGallery(id) {
  const galleryId = Number(id);
  const existing = await prisma.galeri.findUnique({
    where: { id: galleryId },
  });

  if (!existing) return null;

  return await prisma.galeri.delete({
    where: { id: galleryId },
  });
}

async function searchGalleries(q) {
  const results = await prisma.galeri.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    },
    orderBy: {
      startDate: 'desc'
    }
  });

  return results.map((r) => ({
    ...r,
    startDate: formatIndoDate(r.startDate),
  }));
}

module.exports = {
  createGallery,
  getAllGalleries,
  getGalleryById,
  updateGallery,
  deleteGallery,
  searchGalleries,
};
