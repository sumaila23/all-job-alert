const form = document.querySelector("form");

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const flyerFile = document.getElementById("flyer").files[0];
  let imageUrl = null;

  if (flyerFile) {
    const fileName = Date.now() + "-" + flyerFile.name;

    const { error: uploadError } = await supabaseClient
      .storage
      .from("job-flyers")
      .upload(fileName, flyerFile);

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
    type: document.getElementById("type").value,
    deadline: document.getElementById("deadline").value,
    description: document.getElementById("description").value,
    how_to_apply: document.getElementById("apply").value,
    image_url: imageUrl
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