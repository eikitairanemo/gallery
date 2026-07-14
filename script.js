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
    threshold: 0.06,
    rootMargin: "0px 0px -30px 0px"
  }
);

fetch(`./images.json?v=${Date.now()}`)
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
      const row = document.createElement("div");

      row.className = [
        "gallery-row",
        `row-pattern-${rowIndex % 6}`
      ].join(" ");

      /*
       * 行全体を左右へ少し移動
       */
      const rowShiftPatterns = [-3, 2, 0, 4, -2, 1];

      row.style.setProperty(
        "--row-shift",
        `${rowShiftPatterns[rowIndex % rowShiftPatterns.length]}%`
      );

      /*
       * PCでは基本4枚ずつ
       */
      const itemCount = Math.min(
        4,
        shuffledImages.length - currentIndex
      );

      for (let position = 0; position < itemCount; position++) {
        const image = shuffledImages[currentIndex];
        const hash = createHash(image.name);

        const item = document.createElement("div");

        item.className = [
          "item",
          "reveal",
          `item-position-${position + 1}`
        ].join(" ");

        /*
         * 上下位置をばらけさせる
         */
        const offsetPatterns = [
          0,
          80,
          150,
          230,
          310,
          120,
          270
        ];

        const offset =
          offsetPatterns[
            (hash + position + rowIndex) %
              offsetPatterns.length
          ];

        item.style.setProperty("--offset", `${offset}px`);

        /*
         * 横幅を画像ごとに変える
         */
        const widthPatterns = [
          0.76,
          0.82,
          0.88,
          0.94,
          1,
          0.86
        ];

        const widthScale =
          widthPatterns[
            (hash + rowIndex + position) %
              widthPatterns.length
          ];

        item.style.setProperty("--width-scale", widthScale);

        /*
         * 左右・上下の重なり
         * 空のパターンを少なくして重なりを増やす
         */
        const overlapPatterns = [
          { x: -22, y: 0, z: 5 },
          { x: 20, y: -70, z: 4 },
          { x: -16, y: 80, z: 3 },
          { x: 18, y: -130, z: 6 },
          { x: -25, y: -40, z: 7 },
          { x: 12, y: 100, z: 2 },
          { x: 0, y: -90, z: 5 }
        ];

        const overlap =
          overlapPatterns[
            (hash + position * 2 + rowIndex) %
              overlapPatterns.length
          ];

        item.style.setProperty(
          "--overlap-x",
          `${overlap.x}%`
        );

        item.style.setProperty(
          "--overlap-y",
          `${overlap.y}px`
        );

        item.style.setProperty(
          "--item-z",
          overlap.z
        );

        /*
         * フェード表示の時間差
         */
        item.style.setProperty(
          "--delay",
          `${((currentIndex + position) % 5) * 80}ms`
        );

        const img = document.createElement("img");

        img.src = image.path;
        img.alt = image.name || "";
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