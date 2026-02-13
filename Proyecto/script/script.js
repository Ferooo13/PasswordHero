const input = document.getElementById("pass-input");
const fill = document.getElementById("meter-fill");
const statusLabel = document.getElementById("status-label");
const percentLabel = document.getElementById("percent-label");
const btnFetch = document.getElementById("btn-fetch");
const toggleBtn = document.getElementById("toggle-view");
const eyeIcon = document.getElementById("eye-icon");

const checks = {
  length: document.getElementById("c-length"),
  num: document.getElementById("c-num"),
  upper: document.getElementById("c-upper"),
  special: document.getElementById("c-special"),
};

// --- 1. Ver/Ocultar Contraseña ---
toggleBtn.addEventListener("click", () => {
  const isPass = input.type === "password";
  input.type = isPass ? "text" : "password";
  eyeIcon.className = isPass ? "fas fa-eye-slash" : "fas fa-eye";
});

// --- 2. Lógica de Evaluación ---
input.addEventListener("input", () => evaluate(input.value));

function evaluate(val) {
  let score = 0;
  const results = {
    length: val.length >= 8,
    num: /\d/.test(val),
    upper: /[A-Z]/.test(val),
    special: /[^A-Za-z0-9]/.test(val),
  };

  if (results.length) score += 25;
  if (results.num) score += 25;
  if (results.upper) score += 25;
  if (results.special) score += 25;

  // Actualizar visuales de la lista
  Object.keys(results).forEach((key) => {
    const el = checks[key];
    if (results[key]) {
      el.classList.add("active");
      el.querySelector("i").className = "fas fa-check-circle";
    } else {
      el.classList.remove("active");
      el.querySelector("i").className = "fas fa-circle";
    }
  });

  updateMeter(score);
}

function updateMeter(score) {
  fill.style.width = score + "%";
  percentLabel.textContent = score + "%";

  if (score <= 25) {
    statusLabel.textContent = "Poco segura";
    fill.style.backgroundColor = "var(--danger)";
  } else if (score <= 50) {
    statusLabel.textContent = "Mejorable";
    fill.style.backgroundColor = "var(--warning)";
  } else if (score <= 75) {
    statusLabel.textContent = "Segura";
    fill.style.backgroundColor = "var(--primary)";
  } else {
    statusLabel.textContent = "Óptima";
    fill.style.backgroundColor = "var(--success)";
  }
}

// --- 3. CONEXIÓN REAL A data/claves.json ---
btnFetch.addEventListener("click", () => {
  // A. Poner icono de carga
  const icon = btnFetch.querySelector("i");
  const originalIconClass = icon.className; // Guardamos la clase original (fa-wand-magic-sparkles)

  icon.className = "fas fa-spinner fa-spin"; // Ponemos el spinner
  btnFetch.disabled = true; // Desactivamos botón para evitar dobles clics

  // B. Petición al archivo real
  fetch("data/claves.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("No se pudo cargar el archivo data/claves.json");
      }
      return response.json();
    })
    .then((data) => {
      // C. Leer las sugerencias del JSON
      const lista = data.sugerencias;

      if (!lista || lista.length === 0) {
        throw new Error("El JSON está vacío o mal formado");
      }

      // D. Elegir una al azar
      const randomPass = lista[Math.floor(Math.random() * lista.length)];

      // E. Escribirla en el input y re-evaluar los colores
      input.value = randomPass;

      // Si la contraseña estaba oculta, la mostramos para que el usuario la vea
      if (input.type === "password") {
        input.type = "text";
        eyeIcon.className = "fas fa-eye-slash";
      }

      evaluate(randomPass); // Actualizar la barra de fuerza
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error: " + error.message);
    })
    .finally(() => {
      // F. Restaurar el botón a su estado normal
      icon.className = originalIconClass; // Volver al icono mágico
      btnFetch.disabled = false;
    });
});
