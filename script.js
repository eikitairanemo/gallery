const gallery = document.getElementById("gallery");

fetch("./images.json?v=" + Date.now())
  .then(response => {
    if (!response.ok) {
      throw new Error("images.json の読み込みに失敗しました");
    }

    return response.json();
  })
  .then(images => {
    if (!Array.isArray(images) || images.length === 0) {
      throw new Error("images.json に画像が登録されていません");
    }

    images.forEach(image => {
      const item = document.createElement("div");
      item.className = "item";

      const img = document.createElement("img");
      img.src = image.path;
      img.alt = image.name;
      img.loading = "lazy";

      item.appendChild(img);
      gallery.appendChild(item);
    });
  })
  .catch(error => {
    gallery.innerHTML = `
      <div style="padding:60px;text-align:center;color:#888;">
        <p>${error.message}</p>
      </div>
    `;

    console.error(error);
  });