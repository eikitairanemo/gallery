const gallery = document.getElementById("gallery");

fetch("./images.json")
  .then(response => {

    if (!response.ok) {
      throw new Error("images.json の読み込みに失敗しました");
    }

    return response.json();

  })
  .then(images => {

    // 最新順
    images.sort((a, b) => new Date(b.created) - new Date(a.created));

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
      <div style="
        text-align:center;
        padding:60px;
        color:#888;
      ">
        <h3>画像を読み込めませんでした</h3>
        <p>${error.message}</p>
      </div>
    `;

    console.error(error);

  });