// Firebase is now available globally through the compat version
document.addEventListener("DOMContentLoaded", async () => {
  // Wait for Firebase Auth to initialize
  await new Promise((resolve) => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      unsubscribe();
      resolve();
    });
  });

  // Ensure admin account exists
  try {
    const signInMethods = await firebase
      .auth()
      .fetchSignInMethodsForEmail("admin@gmail.com");
    if (signInMethods.length === 0) {
      const userCredential = await firebase
        .auth()
        .createUserWithEmailAndPassword("admin@gmail.com", "admin123");

      const adminData = {
        email: "admin@gmail.com",
        role: "admin",
        createdAt: new Date().toISOString(),
      };

      await firebase
        .firestore()
        .collection("users")
        .doc(userCredential.user.uid)
        .set(adminData);
      await firebase
        .database()
        .ref("users/" + userCredential.user.uid)
        .set(adminData);

      console.log("✅ Admin account created");
    }
  } catch (error) {
    console.error("⚠️ Error handling admin account:", error);
  }

  // Typing animation
  setTimeout(() => {
    const line2 = document.querySelector(".hero h1 .line2");
    if (line2) line2.classList.add("typing");
  }, 1000);

  // Domain → Skill mapping event listener
  document
    .getElementById("registerDomain")
    ?.addEventListener("change", function () {
      const skillSelect = document.getElementById("registerSkill");
      const selectedDomain = this.value;

      if (!skillSelect) {
        console.error("Skill select element not found");
        return;
      }

      skillSelect.innerHTML = '<option value="">Select Skill</option>';

      if (selectedDomain && skillsByDomain[selectedDomain]) {
        skillSelect.removeAttribute("disabled");
        skillsByDomain[selectedDomain].forEach((skill) => {
          const option = document.createElement("option");
          option.value = skill.toLowerCase().replace(/\s+/g, "-");
          option.textContent = skill;
          skillSelect.appendChild(option);
        });
      } else {
        skillSelect.setAttribute("disabled", true);
      }
    });
});

// Get Started button functionality
const ctaButton = document.querySelector(".cta-button");
if (ctaButton) {
  ctaButton.addEventListener("click", (e) => {
    e.preventDefault();
    const loginModal = document.querySelector("#login");
    const overlay = document.querySelector(".modal-overlay");

    if (loginModal) {
      loginModal.style.display = "block";
      if (overlay) overlay.style.display = "block";
    }
  });
}

// Theme toggle
document.getElementById("themeToggle")?.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  document.body.classList.toggle("dark-mode");
});

// Modal functionality
document.querySelectorAll(".modal").forEach((modal) => {
  const closeBtn = modal.querySelector(".close");
  const overlay = document.querySelector(".modal-overlay");

  // Close on X
  closeBtn?.addEventListener("click", () => {
    modal.style.display = "none";
    if (overlay) overlay.style.display = "none";
  });

  // Click outside to close
  window.addEventListener("click", (e) => {
    if (e.target === modal || e.target === overlay) {
      modal.style.display = "none";
      if (overlay) overlay.style.display = "none";
    }
  });
});

// LOGIN form
document.querySelector(".login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;
  const password = e.target.querySelector('input[type="password"]').value;
  const submitButton = e.target.querySelector('button[type="submit"]');

  submitButton.disabled = true;
  submitButton.textContent = "Logging in...";

  try {
    const userCredential = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    console.log("Login successful");

    if (email === "admin@gmail.com" && password === "admin123") {
      window.location.href = "admin.html";
      return;
    }

    // Redirect all users to dashboard after login
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed: " + error.message);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Login";
  }
});

// REGISTER form
document
  .querySelector(".register-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = {
      email: e.target.querySelector('input[name="email"]').value,
      password: e.target.querySelector('input[name="password"]').value,
      domain: document.getElementById("registerDomain").value,
      skill: document.getElementById("registerSkill").value,
      proficiency: e.target.querySelector('input[name="proficiency"]:checked')
        ?.value,
      projectLinks: e.target.querySelector('input[name="projectLinks"]').value,
      monthsExperience: e.target.querySelector('input[name="monthsExperience"]')
        .value,
    };

    if (
      !formData.email ||
      !formData.password ||
      !formData.domain ||
      !formData.skill ||
      !formData.proficiency
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Creating account...";

    try {
      const userCredential = await firebase
        .auth()
        .createUserWithEmailAndPassword(formData.email, formData.password);

      const userData = {
        email: formData.email,
        domain: formData.domain,
        skill: formData.skill,
        proficiency: formData.proficiency,
        projectLinks: formData.projectLinks,
        monthsExperience: parseInt(formData.monthsExperience),
        createdAt: new Date().toISOString(),
      };

      await firebase
        .database()
        .ref("users/" + userCredential.user.uid)
        .set(userData);
      await firebase
        .firestore()
        .collection("users")
        .doc(userCredential.user.uid)
        .set(userData);

      console.log("User registered, redirecting...");
      window.location.href = "http://localhost:8501";
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed: " + error.message);
      document.querySelector("#register").style.display = "block";
      document.querySelector("#login").style.display = "none";
      submitButton.textContent = "Create Account";
    } finally {
      submitButton.disabled = false;
    }
  });

// Scroll & Modal Links
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const modalId = link.getAttribute("href");

    if (["#features", "#about", "#resources", "#contact"].includes(modalId)) {
      const section = document.querySelector(modalId);
      if (section) section.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const modal = document.querySelector(modalId);
    const overlay = document.querySelector(".modal-overlay");
    if (modal && modal.classList.contains("modal")) {
      modal.style.display = "block";
      if (overlay) overlay.style.display = "block";
    }
  });
});

// Domain → Skill mapping
const skillsByDomain = {
  tech: [
    "DSA (Data Structures & Algorithms)",
    "Full Stack Development",
    "Cybersecurity",
    "Machine Learning",
    "DevOps & Cloud",
    "Android/iOS Development",
    "Game Development",
  ],
  business: [
    "Project Management",
    "Business Analysis",
    "Marketing Strategy",
    "Sales",
    "Operations",
  ],
  design: [
    "UI/UX Design",
    "Graphic Design",
    "Motion Design",
    "Product Design",
    "Brand Design",
  ],
  finance: [
    "Investment Analysis",
    "Risk Management",
    "Financial Planning",
    "Trading",
    "Accounting",
  ],
};

// Newsletter subscription
document
  .querySelector(".newsletter-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;

    try {
      const subscriptionData = {
        email: email,
        subscribedAt: new Date().toISOString(),
      };

      await Promise.all([
        firebase
          .database()
          .ref("newsletter_subscribers/" + email.replace(/[.#$[\]]/g, "_"))
          .set(subscriptionData),
        firebase
          .firestore()
          .collection("newsletter_subscribers")
          .doc(email)
          .set(subscriptionData),
      ]);

      alert("✅ Thank you for subscribing!");
      e.target.reset();
    } catch (error) {
      alert("❌ Subscription failed: " + error.message);
    }
  });
