// ============================================================================
// 🧩 EDITOR DE CONFIGURACIÓN - TIENDA
// Archivo: editor.js
// Descripción: Editor visual para modificar config.json y descargar cambios.
// ============================================================================

// ============================================================================
// 🔹 VARIABLES GLOBALES
// ============================================================================
let originalConfig = {};
let configModificado = false;

// ============================================================================
// 🚀 INICIALIZACIÓN PRINCIPAL
// ============================================================================
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("editor-container");
  const btn = document.getElementById("btn-action");

  try {
    const res = await fetch("../config.json");
    if (!res.ok) throw new Error("No se pudo cargar config.json");
    originalConfig = await res.json();
  } catch (err) {
    container.innerHTML = `<p style="color:red;text-align:center;">❌ Error al cargar config.json: ${err.message}</p>`;
    return;
  }

  renderEditor(originalConfig);
  actualizarBoton(false);

  btn.addEventListener("click", () => {
    if (configModificado) {
      const updatedConfig = collectConfig();
      downloadJSON(updatedConfig);
    } else {
      alert("✅ Configuración aceptada sin cambios.");
    }
  });
});

// ============================================================================
// 🧱 RENDERIZAR EDITOR COMPLETO
// ============================================================================
function renderEditor(config) {
  const c = document.getElementById("editor-container");
  c.innerHTML = `
    <!-- 🏠 INFORMACIÓN GENERAL -->
    <div id="seccion-general" class="section">
      <h2>🏠 Información General</h2>
      ${renderInput("tituloPagina", config.tituloPagina, "Título de la pestaña")}
      ${renderInput("nombreRestaurante", config.nombreRestaurante, "Nombre del Restaurante")}
      ${renderInput("logo", config.logo, "Logo principal")}
      ${renderInput("footerLogo", config.footerLogo, "Logo del pie de página")}
      ${renderInput("footerQR", config.footerQR, "Código QR del footer")}
      ${renderInput("numeroWhatsAppMensajes", config.numeroWhatsAppMensajes, "WhatsApp de pedidos")}
      ${renderInput("crearTienda", config.crearTienda, "Enlace 'Crear Tienda'")}
    </div>
    
<!-- 🎨 COLORES -->
<div id="seccion-colores" class="section">
  <h2>🎨 Colores del Tema</h2>
  <div id="contenedor-colores" class="color-grid">
    ${Object.entries(config.colores || {}).map(([k, v]) =>
      renderColorInput(`color-${k}`, v, k, obtenerDescripcionColor(k))
    ).join('')}
  </div>
</div>


    <!-- 🍽️ CATEGORÍAS -->
    <div id="seccion-categorias" class="section">
      <h2>🍽️ Categorías del Menú</h2>
      <div id="categorias-container">
        ${(config.categorias || []).map((cat, i) => renderCategoria(cat, i)).join('')}
      </div>
      <button id="btn-agregar-categoria" onclick="addCategory()">➕ Agregar Categoría</button>
    </div>

    <!-- 🌐 REDES -->
    <div id="seccion-redes" class="section">
      <h2>🌐 Redes Sociales</h2>
      ${Object.entries(config.redes || {}).map(([k, v]) =>
        renderInput(`red-${k}`, v, k)
      ).join('')}
    </div>

    <!-- 🏢 SEDE -->
    <div id="seccion-sede" class="section">
      <h2>🏢 Información de la Sede</h2>
      ${renderInput("sede-nombre", config.sede?.nombre, "Nombre")}
      ${renderInput("sede-direccion", config.sede?.direccion, "Dirección")}
      ${renderInput("sede-telefono", config.sede?.telefono, "Teléfono")}
      ${renderInput("sede-lat", config.coordenadasSede?.[0], "Latitud")}
      ${renderInput("sede-lng", config.coordenadasSede?.[1], "Longitud")}
    </div>

    <!-- 🔗 APIs -->
    <div id="seccion-apis" class="section">
      <h2>🔗 Enlaces a APIs</h2>
      ${Object.entries(config.apiUrls || {}).map(([k, v]) =>
        renderInput(`api-${k}`, v, k)
      ).join('')}
    </div>
  `;

  c.querySelectorAll("input, textarea").forEach(el => {
    el.addEventListener("input", () => handleChange(el));
  });
}

// ============================================================================
// 🧩 CAMPOS
// ============================================================================
function renderInput(id, value = "", label = "") {
  return `
    <div class="campo">
      <label for="${id}">${label}</label>
      <input id="${id}" value="${value || ""}">
    </div>
  `;
}

function renderColorInput(id, value = "", label = "", descripcion = "") {
  const hexValue = parseColor(value);

  return `
    <div class="color-card">
      <label for="${id}" class="color-label">${label}</label>

      <div class="color-pair">
        <input type="color" id="${id}-picker" value="${hexValue}" onchange="syncColorInput('${id}', this.value)">
        <input type="text" id="${id}" value="${value}" oninput="syncColorPicker('${id}', this.value)">
        <div class="color-preview" id="${id}-preview" style="background:${value};"></div>
      </div>

      ${descripcion ? `<small>${descripcion}</small>` : ""}
    </div>
  `;
}

// 🔁 Cuando cambia el input de color (paleta)
function syncColorInput(id, color) {
  const textInput = document.getElementById(id);
  textInput.value = color;
  actualizarPreview(id, color);
}

// 🔁 Cuando se escribe manualmente el color
function syncColorPicker(id, value) {
  const picker = document.getElementById(id + "-picker");
  const parsed = parseColor(value);
  picker.value = parsed;
  actualizarPreview(id, value);
}

// 🎨 Convierte cualquier valor CSS de color a HEX si es posible
function parseColor(value) {
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = value;
  return ctx.fillStyle || "#000000";
}

// 👀 Actualiza la vista previa visual
function actualizarPreview(id, color) {
  const preview = document.getElementById(id + "-preview");
  if (preview) preview.style.background = color;
  configModificado = true;
  actualizarBoton(true);
}



// ============================================================================
// 🎨 UTILIDADES DE COLOR Y DESCRIPCIÓN
// ============================================================================
function parseColor(v) {
  const hex = v.match(/#([0-9A-Fa-f]{6})/);
  return hex ? hex[0] : "#ffffff";
}

function obtenerDescripcionColor(nombre) {
  const map = {
    "--bg-body": "Fondo principal del sitio (puede ser color o degradado).",
    "--header": "Encabezado con imagen o color. La imagen se ajusta sin repetirse.",
    "--accent": "Color de acento y botones.",
    "--card-bg": "Fondo de las tarjetas de producto (gris claro o blanco grisáceo).",
    "--bg-skeleton": "Color del fondo del efecto de carga (skeleton).",
    "--bg-start": "Inicio del degradado del shimmer.",
    "--bg-end": "Fin del degradado del shimmer.",
    "--muted": "Texto o elementos secundarios."
  };
  return map[nombre] || "Variable personalizada.";
}

// ============================================================================
// 🟩 CATEGORÍAS
// ============================================================================
function renderCategoria(cat, i) {
  return `
    <div class="category-row" data-index="${i}">
      <input placeholder="ID" value="${cat.id}">
      <input placeholder="Emoji" value="${cat.emoji}">
      <input placeholder="Nombre" value="${cat.nombre}">
      <button onclick="removeCategory(${i})">✖</button>
    </div>
  `;
}

function addCategory() {
  const c = document.getElementById("categorias-container");
  const div = document.createElement("div");
  div.className = "category-row";
  div.innerHTML = `
    <input placeholder="ID">
    <input placeholder="Emoji">
    <input placeholder="Nombre">
    <button onclick="this.parentElement.remove()">✖</button>
  `;
  c.appendChild(div);
  configModificado = true;
  actualizarBoton(true);
}

function removeCategory(i) {
  document.querySelector(`[data-index="${i}"]`)?.remove();
  configModificado = true;
  actualizarBoton(true);
}

// ============================================================================
// 💾 GUARDADO
// ============================================================================
function handleChange(el) {
  configModificado = true;
  actualizarBoton(true);
  const id = el.id;
  const preview = document.getElementById(id + "-preview");
  if (preview) preview.style.background = el.value;
}

function actualizarBoton(cambio) {
  const btn = document.getElementById("btn-action");
  if (cambio) {
    btn.textContent = "💾 Descargar JSON actualizado";
    btn.classList.add("cambios");
  } else {
    btn.textContent = "✅ Aceptar configuración";
    btn.classList.remove("cambios");
  }
}

function collectConfig() {
  const cfg = structuredClone(originalConfig);

  // General
  ["tituloPagina","nombreRestaurante","logo","footerLogo","footerQR","crearTienda","numeroWhatsAppMensajes"]
    .forEach(k => cfg[k] = document.getElementById(k)?.value || "");

  // Colores
  cfg.colores = {};
  document.querySelectorAll("[id^='color-']").forEach(el => {
    if (!el.id.endsWith("-picker")) cfg.colores[el.id.replace("color-", "")] = el.value;
  });

  // Redes
  cfg.redes = {};
  document.querySelectorAll("[id^='red-']").forEach(el => cfg.redes[el.id.replace("red-", "")] = el.value);

  // Categorías
  cfg.categorias = Array.from(document.querySelectorAll(".category-row")).map(r => {
    const [id, emoji, nombre] = r.querySelectorAll("input");
    return { id: id.value, emoji: emoji.value, nombre: nombre.value };
  });

  return cfg;
}

function downloadJSON(obj) {
  const dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj, null, 2));
  const a = document.createElement("a");
  a.href = dataStr;
  a.download = "config.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


// ============================================================================
// 🎨 PREVIEW EN VIVO DE COLORES (GENERAL)
// ============================================================================
document.addEventListener("input", e => {
  if (e.target.id?.startsWith("color-")) {
    const id = e.target.id;
    const preview = document.getElementById(id + "-preview");
    if (preview) preview.style.background = e.target.value;
  }
  if (e.target.id?.endsWith("-picker")) {
    const idBase = e.target.id.replace("-picker", "");
    const inputTexto = document.getElementById(idBase);
    const preview = document.getElementById(idBase + "-preview");
    if (inputTexto) inputTexto.value = e.target.value;
    if (preview) preview.style.background = e.target.value;
  }
});



