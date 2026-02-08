const checkbox = document.getElementById("agree");
const submitBtn = document.getElementById("submitBtn");
const form = document.getElementById("Customer");
const paymentConfirm = document.getElementById("paymentConfirm");
const amountDisplay = document.getElementById("amountDisplay");

/* BUY NOTICE */
function showBuyNotice() {
    alert("✅ Please check Discord for further instructions!\n\nYour request will be processed by our team.");
}

/* PAYMENT MODAL */
function openPaymentModal() {
    const priceField = document.getElementById("price");
    const amount = priceField ? priceField.value : "0";

    if (amount === "0" || amount === "") {
        alert("⚠️ Please select a valid amount first");
        return;
    }

    const modal = document.getElementById("paymentModal");
    const modalAmount = document.getElementById("modalAmount");
    const modalAmountNum = document.getElementById("modalAmountNum");

    modalAmount.textContent = "₹" + amount;
    modalAmountNum.textContent = amount;

    generateQRCode(amount);
    modal.style.display = "flex";
}

function closePaymentModal() {
    document.getElementById("paymentModal").style.display = "none";
}

/* QR CODE */
function generateQRCode(amount) {
    const upiID = "gajaraj1628@okhdfcbank";
    const qrContainer = document.getElementById("qrCode");
    qrContainer.innerHTML = "";

    const upiString = `upi://pay?pa=${upiID}&pn=ASCEND&am=${amount}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;

    const img = document.createElement('img');
    img.src = qrUrl;
    img.style.maxWidth = '200px';
    qrContainer.appendChild(img);
}

/* CLOSE MODAL OUTSIDE CLICK */
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("paymentModal");
    if (modal) {
        window.addEventListener("click", function (event) {
            if (event.target === modal) closePaymentModal();
        });
    }
});

/* GPAY */
function initiateGpayPayment() {
    const priceField = document.getElementById("price");
    const amount = priceField ? priceField.value : "0";

    if (amount === "0" || amount === "") {
        alert("⚠️ Select amount first");
        return;
    }

    const upiID = "gajaraj1628@okhdfcbank";
    const payeeName = "ASCEND STORE";
    const upiLink = `upi://pay?pa=${upiID}&pn=${payeeName}&am=${amount}`;

    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());

    if (isMobile) {
        window.location.href = upiLink;

        setTimeout(() => {
            const done = confirm("✅ Payment successful?\nClick OK after payment");
            if (done) {
                paymentConfirm.checked = true;
                checkbox.checked = true;
                checkSubmitConditions();
                showSuccessScreen();
            }
        }, 3000);

        closePaymentModal();
    } else {
        alert(`Send manually via UPI\n\nUPI: ${upiID}\nAmount: ₹${amount}`);
        closePaymentModal();
    }
}

/* SUCCESS SCREEN */
function showSuccessScreen() {
    const itemField = document.getElementById("item");
    const itemName = itemField ? itemField.value : "Pack";

    const successModal = document.createElement("div");
    successModal.id = "successModal";
    successModal.style.cssText = `
        position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.9);z-index:20000;
        display:flex;align-items:center;justify-content:center;
    `;

    successModal.innerHTML = `
        <div style="background:#0f2027;border-radius:20px;padding:40px;
        max-width:600px;width:90%;border:2px solid cyan;text-align:center">
            <h1 style="color:cyan">SUCCESSFUL BUY</h1>
            <h2 style="color:magenta">THANK YOU</h2>
            <p style="color:#aaa">Package: <b>${itemName}</b></p>
            <button onclick="completeAndSubmitForm()"
            style="padding:15px 40px;background:cyan;border:none;border-radius:30px;font-weight:bold">
            SUBMIT PURCHASE</button>
        </div>
    `;
    document.body.appendChild(successModal);
}

function completeAndSubmitForm() {
    const modal = document.getElementById("successModal");
    if (modal) modal.remove();
    form.dispatchEvent(new Event("submit"));
}

/* AMOUNT DISPLAY */
function updateAmountDisplay() {
    const priceField = document.getElementById("price");
    const amount = priceField ? priceField.value : "0";
    amountDisplay.textContent = `Amount: ₹${amount}`;
}

/* SUBMIT CONDITIONS */
function checkSubmitConditions() {
    submitBtn.disabled = !(checkbox.checked && paymentConfirm.checked);
}

checkbox.addEventListener("change", checkSubmitConditions);
paymentConfirm.addEventListener("change", checkSubmitConditions);

/* URL PARAMS */
const params = new URLSearchParams(window.location.search);
const vehicle = params.get("vehicle");
const pack = params.get("pack");
const price = params.get("price");

function ensurePriceField(priceValue) {
    let priceField = document.getElementById("price");
    if (!priceField) {
        priceField = document.createElement("input");
        priceField.type = "hidden";
        priceField.id = "price";
        form.appendChild(priceField);
    }
    priceField.value = priceValue;
    updateAmountDisplay();
}

if (vehicle || pack) {
    let itemField = document.getElementById("item");
    if (!itemField) {
        itemField = document.createElement("input");
        itemField.type = "hidden";
        itemField.id = "item";
        form.appendChild(itemField);
    }
    itemField.value = vehicle || pack;
}

ensurePriceField(price || "0");

/* SUBMIT FORM */
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const itemValue = document.getElementById("item")?.value || "Not specified";
    const priceValue = document.getElementById("price")?.value || "0";
    const fileInput = document.querySelector('input[name="payment_proof"]');

    if (!fileInput.files.length) {
        alert("Upload payment proof");
        return;
    }

    const file = fileInput.files[0];
    const fileName = file.name;
    const fileSize = (file.size / 1024).toFixed(2);
    const fileExtension = fileName.split('.').pop().toUpperCase();

    const payload = {
        content: "<@&1461606860372316377> <@&1461606866810437702>",
        username: "ASCEND STORE",
        embeds: [{
            title: "🛒 New Purchase",
            color: 8311585,
            fields: [
                { name: "IC Name", value: form.pname.value, inline: true },
                { name: "Discord", value: form.dname.value, inline: true },
                { name: "GPay", value: form.gpay_name.value, inline: true },
                { name: "Item", value: itemValue, inline: true },
                { name: "Amount", value: "₹" + priceValue, inline: true },
                { name: "Payment", value: "✅ Paid", inline: true },
                { name: "Proof", value: `${fileName} | ${fileSize} KB`, inline: false }
            ],
            footer: { text: "ASCEND ROLEPLAY" },
            timestamp: new Date().toISOString()
        }]
    };

    // MULTIPLE WEBHOOKS
    const WEBHOOKS = [
        "https://discord.com/api/webhooks/1470090123080106156/3AqTyeYpozL26bebIpjkgaFaXXtvl2JI2hMyjx34FzLr7k_vMimCexkmY4h4ClutJZvB",
        "https://discord.com/api/webhooks/1469756792908152883/bYlDZ5hHPPDeN_wdd1HLOCUqSGeXPC-PWNyJHOIv_zEiA99tXEzCMDWRA46Cc24NEdKH"
    ];

    Promise.all(
        WEBHOOKS.map(url => {
            const formData = new FormData();
            formData.append('payload_json', JSON.stringify(payload));
            formData.append('file', file, fileName);

            return fetch(url, {
                method: "POST",
                body: formData
            });
        })
    )
    .then(() => {
        alert("✅ Sent to all admins!");
        form.reset();
        submitBtn.disabled = true;
    })
    .catch(err => {
        alert("❌ Error: " + err.message);
    });
});
