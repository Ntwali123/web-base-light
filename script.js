document.addEventListener("DOMContentLoaded", () => {
  // Particles setup
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speedX = Math.random() * 2 - 1;
      this.speedY = Math.random() * 2 - 1;
      this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > canvas.width) this.reset();
      if (this.y < 0 || this.y > canvas.height) this.reset();
    }

    draw() {
      const isDark = document.body.classList.contains("dark-mode");
      ctx.fillStyle = isDark
        ? `rgba(255, 255, 255, ${this.opacity})`
        : `rgba(0, 0, 0, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    const numberOfParticles = Math.floor(
      (canvas.width * canvas.height) / 10000
    );
    for (let i = 0; i < numberOfParticles; i++) {
      particles.push(new Particle());
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });
    requestAnimationFrame(animateParticles);
  }

  initParticles();
  animateParticles();

  const ws = new WebSocket("ws://localhost:8767");
  const submitBtn = document.getElementById("submitBtn");
  const onTimeInput = document.getElementById("onTime");
  const offTimeInput = document.getElementById("offTime");
  const statusDiv = document.getElementById("status");
  const themeToggle = document.getElementById("themeToggle");
  const bulb = document.querySelector(".bulb i");
  const lightStatus = document.getElementById("lightStatus");
  const nextEvent = document.getElementById("nextEvent");
  const currentTime = document.getElementById("currentTime");
  const historyList = document.getElementById("historyList");

  // Theme handling
  const theme = localStorage.getItem("theme") || "light";
  document.body.className = `${theme}-mode`;
  themeToggle.innerHTML = `<i class="fas fa-${
    theme === "light" ? "moon" : "sun"
  }"></i>`;

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.body.className.includes("light")
      ? "light"
      : "dark";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.body.className = `${newTheme}-mode`;
    themeToggle.innerHTML = `<i class="fas fa-${
      newTheme === "light" ? "moon" : "sun"
    }"></i>`;
    localStorage.setItem("theme", newTheme);
  });

  // Clock update
  function updateClock() {
    const now = new Date();
    currentTime.textContent = now.toLocaleTimeString();
    requestAnimationFrame(updateClock);
  }
  updateClock();

  // WebSocket handling
  ws.onopen = () => {
    console.log("Connected to WebSocket server");
    showNotification("Connected to server", "success");
    animateBulb();
    addHistoryItem("System connected");
  };

  ws.onclose = () => {
    console.log("Disconnected from WebSocket server");
    showNotification("Disconnected from server", "error");
    submitBtn.disabled = true;
    bulb.style.color = "#666";
    addHistoryItem("System disconnected");
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    showNotification("Connection error", "error");
    addHistoryItem("Connection error occurred");
  };

  ws.onmessage = (event) => {
    const response = JSON.parse(event.data);
    showNotification(response.message, response.status);
    if (response.status === "success") {
      animateSuccess();
      updateNextEvent();
      addHistoryItem("Schedule updated successfully");
    } else {
      addHistoryItem("Failed to update schedule");
    }
  };

  // Form handling
  submitBtn.addEventListener("click", () => {
    const onTime = onTimeInput.value;
    const offTime = offTimeInput.value;

    if (!onTime || !offTime) {
      showNotification("Please set both ON and OFF times");
      shakeButton();
      return;
    }

    const schedule = {
      onTime: onTime,
      offTime: offTime,
    };

    submitBtn.classList.add("sending");
    ws.send(JSON.stringify(schedule));
    showNotification("Sending schedule...", "");
  });

  // History handling
  function addHistoryItem(message) {
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <i class="fas fa-clock"></i>
      <span>${new Date().toLocaleTimeString()} - ${message}</span>
    `;
    historyList.insertBefore(item, historyList.firstChild);
    if (historyList.children.length > 5) {
      historyList.removeChild(historyList.lastChild);
    }
  }

  // Update next scheduled event
  function updateNextEvent() {
    const onTime = onTimeInput.value;
    const offTime = offTimeInput.value;
    if (onTime && offTime) {
      nextEvent.textContent = `Next: ON at ${onTime}, OFF at ${offTime}`;
    }
  }

  // Animation functions
  function showNotification(message, type = "error") {
    statusDiv.className = `status-message ${type}`;
    statusDiv.textContent = message;
    statusDiv.style.animation = "slideIn 0.3s ease forwards";

    // Auto-hide after 3 seconds
    setTimeout(() => {
      statusDiv.style.animation = "slideOut 0.3s ease forwards";
      setTimeout(() => {
        statusDiv.textContent = "";
        statusDiv.className = "status-message";
      }, 300);
    }, 3000);
  }

  function shakeButton() {
    submitBtn.style.animation = "none";
    submitBtn.offsetHeight; // Trigger reflow
    submitBtn.style.animation = "shake 0.5s ease-in-out";
  }

  function animateSuccess() {
    submitBtn.classList.remove("sending");
    submitBtn.classList.add("success");
    setTimeout(() => {
      submitBtn.classList.remove("success");
    }, 1500);
  }

  function animateBulb() {
    bulb.style.animation = "none";
    bulb.offsetHeight; // Trigger reflow
    bulb.style.animation = "float 3s ease-in-out infinite";
  }

  // Add these CSS animations
  const style = document.createElement("style");
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    .submit-btn.sending {
      position: relative;
      overflow: hidden;
    }

    .submit-btn.sending::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 200%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.2),
        transparent
      );
      animation: loading 1.5s infinite;
    }

    .submit-btn.success {
      background: linear-gradient(135deg, #2e7d32, #4caf50) !important;
    }

    @keyframes loading {
      from { transform: translateX(0); }
      to { transform: translateX(50%); }
    }
  `;
  document.head.appendChild(style);
});
