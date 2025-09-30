const router = require("express").Router();

// Rutas
router.post("/api/upload", upload.single("ebook"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se subió ningún archivo" });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      uploadDate: new Date(),
    };

    // Procesar el ebook según su tipo
    const ebookData = await processEbook(
      req.file.path,
      path.extname(req.file.originalname)
    );

    res.json({
      success: true,
      file: fileInfo,
      ebook: ebookData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/ebooks", (req, res) => {
  // Listar ebooks disponibles
  const ebooksDir = "uploads/";
  fs.readdir(ebooksDir, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const ebookFiles = files.filter((file) =>
      [".epub", ".pdf", ".mobi", ".txt"].includes(
        path.extname(file).toLowerCase()
      )
    );

    res.json(ebookFiles);
  });
});

router.get("/api/ebook/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join("uploads", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Ebook no encontrado" });
  }

  res.sendFile(path.resolve(filePath));
});

// Procesador de ebooks
async function processEbook(filePath, extension) {
  switch (extension.toLowerCase()) {
    case ".epub":
      return await processEPUB(filePath);
    case ".pdf":
      return await processPDF(filePath);
    case ".mobi":
      return await processMOBI(filePath);
    case ".txt":
      return await processTXT(filePath);
    default:
      throw new Error("Formato no soportado");
  }
}

async function processEPUB(filePath) {
  const EPub = require("epub");

  return new Promise((resolve, reject) => {
    const epub = new EPub(filePath);

    epub.on("end", () => {
      resolve({
        metadata: epub.metadata,
        toc: epub.flow,
        spine: epub.spine,
      });
    });

    epub.on("error", reject);
    epub.parse();
  });
}

async function processPDF(filePath) {
  const pdf = require("pdf-parse");
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);

  return {
    text: data.text,
    numPages: data.numpages,
    info: data.info,
  };
}

async function processTXT(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  return {
    content: content,
    lines: content.split("\n").length,
  };
}
