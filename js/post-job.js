const form = document.querySelector("form");

const typeSelect = document.getElementById("type");
const typeOther = document.getElementById("type-other");

typeSelect.addEventListener("change", function () {
  if (typeSelect.value === "Other") {
    typeOther.style.display = "block";
    typeOther.setAttribute("required", "true");
  } else {
    typeOther.style.display = "none";
    typeOther.removeAttribute("required");
    typeOther.value = "";
  }
});


function addWatermark(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0);

      const text = "ALL JOB ALERT SL";
      const fontSize = Math.max(16, img.width * 0.03);
      ctx.font = `bold ${fontSize}px Arial`;
      const textWidth = ctx.measureText(text).width;

      const padding = fontSize * 0.6;
      const barHeight = fontSize + padding * 2;

      ctx.fillStyle = "rgba(15, 118, 110, 0.85)";
      ctx.fillRect(0, img.height - barHeight, img.width, barHeight);

      ctx.fillStyle = "white";
      ctx.fillText(text, (img.width - textWidth) / 2, img.height - barHeight / 2 + fontSize / 3);

      canvas.toBlob((blob) => resolve(blob), file.type);
    };
    img.src = URL.createObjectURL(file);
  });
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const flyerFile = document.getElementById("flyer").files[0];
  let imageUrl = null;

  if (flyerFile) {
    const watermarkedFile = await addWatermark(flyerFile);
    const fileName = Date.now() + "-" + flyerFile.name;

    const { error: uploadError } = await supabaseClient
      .storage
      .from("job-flyers")
      .upload(fileName, watermarkedFile);

    if (uploadError) {
      alert("Could not upload the flyer. Please try again.");
      console.error(uploadError);
      return;
    }

    const { data: urlData } = supabaseClient
      .storage
      .from("job-flyers")
      .getPublicUrl(fileName);

    imageUrl = urlData.publicUrl;
  }

  const newJob = {
    title: document.getElementById("title").value,
    company: document.getElementById("company").value,
    district: document.getElementById("district").value,
    city: document.getElementById("city").value,
    type: typeSelect.value === "Other" ? typeOther.value : typeSelect.value,
    deadline: document.getElementById("deadline").value || null,
    description: document.getElementById("description").value,
    how_to_apply: document.getElementById("apply").value,
    image_url: imageUrl,
    category: document.getElementById("category").value
  };

  const { error } = await supabaseClient.from("jobs").insert([newJob]);

  if (error) {
    alert("Something went wrong. Please try again.");
    console.error(error);
  } else {
    alert("Your job has been submitted for review. Thank you!");
    form.reset();
  }
});