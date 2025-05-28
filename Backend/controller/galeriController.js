const galleryModel = require("../model/galeriModel"); // sesuaikan path-nya

async function createGallery(req, res) {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });

    const startDate = new Date(req.body.startDate);
    if (isNaN(startDate)) {
      return res.status(400).json({ error: "startDate is invalid" });
    }

    // cek file gambar dari multer
    const imageFile = req.file;
    if (!imageFile) {
      return res.status(400).json({ error: "Image is required" });
    }

    const newGallery = await galleryModel.createGallery({
      title,
      description,
      image: imageFile.filename,
      startDate,
    });

    res.status(201).json(newGallery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAllGalleries(req, res) {
  try {
    const galleries = await galleryModel.getAllGalleries();
    res.json(galleries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getGalleryById(req, res) {
  try {
    const { id } = req.params;
    const gallery = await galleryModel.getGalleryById(id);
    if (!gallery) return res.status(404).json({ error: "Gallery not found" });
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateGallery(req, res) {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const startDate = new Date(req.body.startDate);
    if (isNaN(startDate)) {
      return res.status(400).json({ error: "startDate is invalid" });
    }

    const imageFile = req.file;

    const updatedData = {
      title,
      description,
      image: imageFile.filename,
      startDate,
    };

    if (imageFile) {
      updatedData.image = imageFile.filename;
    }

    const updatedGallery = await galleryModel.updateGallery(id, updatedData);

    if (!updatedGallery) {
      return res.status(404).json({ error: "Gallery not found" });
    }

    res.json(updatedGallery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteGallery(req, res) {
  try {
    const { id } = req.params;
    await galleryModel.deleteGallery(id);
    res.json({ message: "Gallery deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function searchGalleries(req, res) {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ error: "q is required for search" });
    }

    const results = await galleryModel.searchGalleries(q);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createGallery,
  getAllGalleries,
  getGalleryById,
  updateGallery,
  deleteGallery,
  searchGalleries,
};
