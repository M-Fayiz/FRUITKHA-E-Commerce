document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const result = document.getElementById("result");

  // ================================
  // 🔥 CLEAR OLD ERRORS FIRST
  // ================================
  result.innerHTML = "";
  document.querySelectorAll(".error").forEach((el) => (el.innerHTML = ""));
  document.getElementById("firstNameerror").innerHTML = "";

  // ================================
  // GET VALUES
  // ================================
  const firstName = form.querySelector("#firstName").value.trim();
  const lastName = form.querySelector("#lastName").value.trim();
  const email = form.querySelector("#email").value.trim();
  const phone = form.querySelector("#phone").value.trim();
  const password = form.querySelector("#password").value.trim();
  const confirmPassword = form.querySelector("#confirmPassword").value.trim();
  console.log('phone number :',phone)
  let isValid = true;

  // ================================
  // EMPTY FIELD CHECK
  // ================================
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !confirmPassword
  ) {
    result.innerHTML = "Please fill out all required fields correctly";
    isValid = false;
  }

  // ================================
  // NAME VALIDATION
  // ================================
  if (firstName && !/^[A-Za-z ]+$/.test(firstName)) {
    document.getElementById("firstNameerror").innerHTML =
      "First Name should contain only letters";
    isValid = false;
  }

  if (lastName && !/^[A-Za-z ]+$/.test(lastName)) {
    document.getElementById("lasterror").innerHTML =
      "Last Name should contain only letters";
    isValid = false;
  }

  // ================================
  // EMAIL VALIDATION
  // ================================
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById("EMIALerror").innerHTML = "Enter a valid email";
    isValid = false;
  }

  // ================================
  // INDIAN PHONE VALIDATION
  // ================================
  if (phone && !/^[6-9]\d{9}$/.test(phone)) {
    document.getElementById("PHONEerror").innerHTML =
      "Enter valid 10 digit Indian number";
    isValid = false;
  }

  // ================================
  // PASSWORD VALIDATION (ONE CLEAN RULE)
  // ================================
  if (password && !/^(?=.*[0-9])(?=.*[!@#$%^&]).{8,}$/.test(password)) {
    document.getElementById("Passworderror").innerHTML =
      "Password must be 8+ characters with a number & special character";
    isValid = false;
  }

  // ================================
  // CONFIRM PASSWORD
  // ================================
  if (password !== confirmPassword) {
    document.getElementById("Confirmerror").innerHTML =
      "Passwords do not match";
    isValid = false;
  }

  // ================================
  // 🔥 STOP IF INVALID
  // ================================
  if (!isValid) {
    showToast("Please fix form errors", "error");
    return;
  }

  // ================================
  // API CALL
  // ================================
  try {
    const response = await fetch("/api/auth/otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        password,
      }),
    });

    const data = await response.json();

    if (data.success) {
      showToast(data.message, "success");
      window.location.href = `/getOTP`;
    } else {
      showToast(data.message || "Something went wrong", "error");
    }
  } catch (err) {
    console.log(err);
    showToast("Server error. Try again later.", "error");
  }
});
