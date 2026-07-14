const gallery = document.getElementById("gallery");

function createHash(text) {
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

function shuffleArray(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [result[i], result[randomIndex]] = [
      result[randomIndex],
      result[i]
    ];
  }

  return result;
}

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.08,
    rootMargin: "0px 0px -40px 0px"
  }
);

fetch("./images.json?v=" + Date.now())
  .then(response => {
    if (!response.ok) {
      throw new Error("images.jsonの読み込みに失敗しました");
    }

    return response.json();
  })
  .then(images => {
    if (!Array.isArray(images) || images.length === 0) {
      throw new Error("表示する画像がありません");
    }

    const shuffledImages = shuffleArray(images);

    let currentIndex = 0;
    let rowIndex = 0;

    while (currentIndex < shuffledImages.length) {
      /*
       * PCではランダムに2枚または3枚
       * 3枚になる確率を少し高くしています
       */
      const remaining = shuffledImages.length - currentIndex;
      let itemCount = Math.random() < 0.58 ? 3 : 2;

      if (remaining < itemCount) {
        itemCount = remaining;
      }

      const row = document.createElement("div");
      row.className = `gallery-row gallery-row-${itemCount}`;

      /*
       * 行全体を少し左右にずらす
       */
      const rowShiftPattern = [-4, 1, 4, -2, 2];
      const rowShift = rowShiftPattern[rowIndex % rowShiftPattern.length];

      row.style.setProperty("--row-shift", `${rowShift}%`);

      for (let i = 0; i < itemCount; i++) {
        const image = shuffledImages[currentIndex];
        const hash = createHash(image.name);

        const item = document.createElement("div");
        item.className = "item reveal";

        /*
         * 画像ごとの上下位置をランダム風に変更
         */
        const offsetPatterns = [0, 60, 120, 180, 240];
        const offset = offsetPatterns[hash % offsetPatterns.length];

        item.style.setProperty("--offset", `${offset}px`);
        item.style.setProperty(
          "--delay",
          `${((currentIndex + i) % 5) * 90}ms`
        );

        /*
         * 横幅も少しだけ変える
         */
        const widthScalePatterns = [0.92, 0.97, 1, 1.04];
        const widthScale =
          widthScalePatterns[(hash + rowIndex) % widthScalePatterns.length];

        item.style.setProperty("--width-scale", widthScale);

        const img = document.createElement("img");
        img.src = image.path;
        img.alt = image.name;
        img.loading = "lazy";
        img.decoding = "async";

        item.appendChild(img);
        row.appendChild(item);

        observer.observe(item);

        currentIndex++;
      }

      gallery.appendChild(row);
      rowIndex++;
    }
  })
  .catch(error => {
    gallery.innerHTML = `
      <div class="gallery-error">
        <p>${error.message}</p>
      </div>
    `;

    console.error(error);
  });