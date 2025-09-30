class GestorArchivos {
  constructor() {
    this.baseURL = "http://localhost:3000/api";
    this.init();
  }

  init() {
    this.cargarCarpetas();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById("formCarpeta").addEventListener("submit", (e) => {
      e.preventDefault();
      this.agregarCarpeta();
    });
  }

  async cargarCarpetas() {
    try {
      const response = await fetch(`${this.baseURL}/carpetas`);
      const data = await response.json();
      this.mostrarCarpetas(data.carpetas);
    } catch (error) {
      console.error("Error cargando carpetas:", error);
    }
  }

  mostrarCarpetas(carpetas) {
    const contenedor = document.getElementById("listaCarpetas");
    contenedor.innerHTML = "<h2>Carpetas Guardadas</h2>";

    if (carpetas.length === 0) {
      contenedor.innerHTML += "<p>No hay carpetas guardadas</p>";
      return;
    }

    carpetas.forEach((carpeta) => {
      const div = document.createElement("div");
      div.className = "carpeta";
      div.innerHTML = `
                <h3>${carpeta.nombre}</h3>
                <p><strong>Ruta:</strong> ${carpeta.ruta}</p>
                <p><strong>Descripción:</strong> ${carpeta.descripcion}</p>
                <p><strong>Archivos:</strong> ${
                  carpeta.archivos ? carpeta.archivos.length : 0
                }</p>
                <button onclick="gestor.escanearArchivos('${
                  carpeta.id
                }')" class="btn">
                    Escanear Archivos
                </button>
                <button onclick="gestor.eliminarCarpeta('${
                  carpeta.id
                }')" class="btn">
                    Eliminar
                </button>
            `;
      contenedor.appendChild(div);
    });
  }

  async agregarCarpeta() {
    const nombre = document.getElementById("nombreCarpeta").value;
    const ruta = document.getElementById("rutaCarpeta").value;
    const descripcion = document.getElementById("descripcionCarpeta").value;

    try {
      const response = await fetch(`${this.baseURL}/carpetas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre, ruta, descripcion }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Carpeta agregada exitosamente");
        document.getElementById("formCarpeta").reset();
        this.cargarCarpetas();
      } else {
        alert("Error agregando carpeta");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  }

  async escanearArchivos(carpetaId) {
    try {
      const response = await fetch(
        `${this.baseURL}/carpetas/${carpetaId}/archivos`
      );
      const data = await response.json();
      this.mostrarArchivos(data.archivos, data.carpeta);
    } catch (error) {
      console.error("Error escaneando archivos:", error);
    }
  }

  mostrarArchivos(archivos, carpeta) {
    const contenedor = document.getElementById("listaArchivos");
    const detalles = document.getElementById("detallesArchivos");

    detalles.style.display = "block";
    contenedor.innerHTML = `<h3>Archivos en: ${carpeta.nombre}</h3>`;

    if (archivos.length === 0) {
      contenedor.innerHTML += "<p>No se encontraron archivos</p>";
      return;
    }

    archivos.forEach((archivo) => {
      const div = document.createElement("div");
      div.className = "archivo";
      div.innerHTML = `
                <p><strong>Nombre:</strong> ${archivo.nombre}</p>
                <p><strong>Tamaño:</strong> ${this.formatearTamaño(
                  archivo.tamaño
                )}</p>
                <p><strong>Modificado:</strong> ${new Date(
                  archivo.modificado
                ).toLocaleString()}</p>
                ${
                  !archivo.esDirectorio
                    ? `<a href="${archivo.url}" target="_blank" class="btn">Descargar</a>`
                    : "<em>Directorio</em>"
                }
            `;
      contenedor.appendChild(div);
    });
  }

  async eliminarCarpeta(carpetaId) {
    if (!confirm("¿Estás seguro de eliminar esta carpeta?")) return;

    try {
      const response = await fetch(`${this.baseURL}/carpetas/${carpetaId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        alert("Carpeta eliminada exitosamente");
        this.cargarCarpetas();
      } else {
        alert("Error eliminando carpeta");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  }

  formatearTamaño(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

// Inicializar la aplicación
const gestor = new GestorArchivos();
