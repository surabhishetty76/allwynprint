const uploadZone = document.getElementById("upload-zone");
const artworkInput = document.getElementById("artwork-file");
const fileNameDisplay = document.getElementById("file-name");

function showTab(id) {
  document
    .querySelectorAll(".pricing-table")
    .forEach((table) => table.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((button) => button.classList.remove("active"));
  document.getElementById(`tab-${id}`).classList.add("active");
  document.querySelector(`[data-tab="${id}"]`)?.classList.add("active");
}

function handleFileSelect(input) {
  const file = input.files?.[0];
  if (file) {
    const size = (file.size / 1024 / 1024).toFixed(1);
    fileNameDisplay.textContent = `✓ ${file.name} (${size} MB)`;
  } else {
    fileNameDisplay.textContent = "";
  }
}

function updateEstimate() {
  const printType = document.getElementById("print-type").value;
  const printSize = document.getElementById("print-size").value;
  const quantity = parseInt(document.getElementById("quantity").value, 10) || 0;
  const estimatePanel = document.getElementById("price-est");
  const estimateValue = document.getElementById("est-value");

  const basePrices = {
    digital: {
      "visiting-card": 9,
      a6: 6,
      a5: 8,
      a4: 12,
      a3: 22,
      a2: 45,
      a1: 80,
      custom: 15,
    },
    offset: {
      "visiting-card": 6,
      a6: 4,
      a5: 5,
      a4: 7,
      a3: 12,
      a2: 22,
      a1: 40,
      custom: 10,
    },
    largeformat: { a4: 85, a3: 150, a2: 250, a1: 450, custom: 300 },
    specialty: {
      "visiting-card": 15,
      a6: 12,
      a5: 16,
      a4: 25,
      a3: 45,
      custom: 30,
    },
  };

  if (
    printType &&
    printSize &&
    quantity > 0 &&
    basePrices[printType]?.[printSize]
  ) {
    const base = basePrices[printType][printSize];
    const total = Math.round(base * quantity * 0.85);
    estimateValue.textContent = `₹${total.toLocaleString("en-IN")}+`;
    estimatePanel.classList.add("visible");
  } else {
    estimatePanel.classList.remove("visible");
  }
}

if (uploadZone && artworkInput) {
  uploadZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    uploadZone.classList.add("dragover");
  });

  uploadZone.addEventListener("dragleave", () =>
    uploadZone.classList.remove("dragover"),
  );
  uploadZone.addEventListener("drop", (event) => {
    event.preventDefault();
    uploadZone.classList.remove("dragover");
    const files = event.dataTransfer?.files;
    if (files?.length) {
      artworkInput.files = files;
      handleFileSelect(artworkInput);
    }
  });
}

async function submitOrder() {
  const button = document.getElementById("submit-btn");
  const status = document.getElementById("form-status");

  const name = document.getElementById("cust-name").value.trim();
  const email = document.getElementById("cust-email").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const company = document.getElementById("cust-company").value.trim();
  const printType = document.getElementById("print-type").value;
  const printSize = document.getElementById("print-size").value;
  const paperType = document.getElementById("paper-type").value;
  const quantity = document.getElementById("quantity").value.trim();
  const finishing = document.getElementById("finishing").value;
  const notes = document.getElementById("notes").value.trim();
  const fileInput = document.getElementById("artwork-file");
  const fileName = fileInput.files?.[0]?.name ?? "No file uploaded";

  if (
    !name ||
    !email ||
    !phone ||
    !printType ||
    !printSize ||
    !paperType ||
    !quantity
  ) {
    status.className = "error";
    status.textContent = "Please fill in all required fields marked with *.";
    status.style.display = "block";
    return;
  }

  button.disabled = true;
  button.textContent = "Sending…";
  status.style.display = "none";

  const sizeLabel =
    document.getElementById("print-size").options[
      document.getElementById("print-size").selectedIndex
    ].text;
  const typeLabel =
    document.getElementById("print-type").options[
      document.getElementById("print-type").selectedIndex
    ].text;
  const paperLabel =
    document.getElementById("paper-type").options[
      document.getElementById("paper-type").selectedIndex
    ].text;
  const finishLabel =
    document.getElementById("finishing").options[
      document.getElementById("finishing").selectedIndex
    ].text;

  const messageBody = `
NEW PRINT ORDER REQUEST — Allwyn Print
=================================================

CUSTOMER DETAILS
----------------
Name:     ${name}
Email:    ${email}
Phone:    ${phone}
Company:  ${company || "—"}

PRINT SPECIFICATIONS
--------------------
Print Type:  ${typeLabel}
Size:        ${sizeLabel}
Paper/Media: ${paperLabel}
Quantity:    ${quantity}
Finishing:   ${finishLabel}

ARTWORK FILE
------------
${fileName}

ADDITIONAL NOTES
----------------
${notes || "—"}

=================================================
Request sent from allwyn website
  `.trim();

  try {
    const formData = new FormData();
    formData.append("access_key", "YOUR_WEB3FORMS_KEY");
    formData.append("subject", `New Print Order from ${name} — ${typeLabel}`);
    formData.append("from_name", "Allwyn Print Website");
    formData.append("email", "surabhishetty1@gmail.com");
    formData.append("message", messageBody);
    formData.append("replyto", email);

    if (fileInput.files?.[0]) {
      formData.append("attachment", fileInput.files[0]);
    }

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (data.success) {
      status.className = "success";
      status.textContent =
        "✓ Your order request has been received! We will confirm your quote within 2 business hours.";
      document.getElementById("cust-name").value = "";
      document.getElementById("cust-email").value = "";
      document.getElementById("cust-phone").value = "";
      document.getElementById("cust-company").value = "";
      document.getElementById("print-type").value = "";
      document.getElementById("print-size").value = "";
      document.getElementById("paper-type").value = "";
      document.getElementById("quantity").value = "";
      document.getElementById("finishing").value = "none";
      document.getElementById("notes").value = "";
      document.getElementById("file-name").textContent = "";
      document.getElementById("price-est").classList.remove("visible");
    } else {
      throw new Error(data.message || "Submission failed.");
    }
  } catch (error) {
    const mailto = `mailto:surabhishetty1@gmail.com?subject=${encodeURIComponent(`New Print Order from ${name}`)}&body=${encodeURIComponent(messageBody)}`;
    window.location.href = mailto;
    status.className = "success";
    status.textContent =
      "✓ Opening your email client to send the order. If nothing opens, email us directly at surabhishetty1@gmail.com.";
  }

  status.style.display = "block";
  button.disabled = false;
  button.textContent = "Send Order Request →";
}

window.showTab = showTab;
window.handleFileSelect = handleFileSelect;
window.updateEstimate = updateEstimate;
window.submitOrder = submitOrder;

// Portfolio: open PDF in new tab on click
document.querySelectorAll(".portfolio-item[data-pdf]").forEach((item) => {
  item.addEventListener("click", () => {
    const pdf = item.getAttribute("data-pdf");
    if (pdf) window.open(pdf, "_blank", "noopener");
  });
});
