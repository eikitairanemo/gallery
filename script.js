const gallery = document.getElementById("gallery");

/**
 * ファイル名から固定の数値を作る
 */
function createHash(text) {
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

/**
 * 画像順をランダム化
 */
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

/**
 * 2枚・3枚・4枚をランダムに選ぶ
 */
function getRandomItemCount(remaining) {
  const random = Math.random();

  let count;

  /*
   * 4枚：約45%
   * 3枚：約30%
   * 2枚：約25%
   */
  if (random < 0.45) {
    count = 4;
  } else if (random < 0.75) {
    count = 3;
  } else {
    count = 2;
  }

  return Math.min(count, remaining);
}

/**
 * スクロール表示
 */
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

/**
 * images.jsonを読み込む
 */
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
      const remaining = shuffledImages.length - currentIndex;
      const itemCount = getRandomItemCount(remaining);

      const row = document.createElement("div");

      row.className = [
        "gallery-row",
        `gallery-row-${itemCount}`,
        `row-pattern-${rowIndex % 6}`
      ].join(" ");

      /**
       * 行全体を少し左右に移動
       */
      const rowShiftPatterns = [-3, 2, 0, 4, -2, 1];

      row.style.setProperty(
        "--row-shift",
        `${rowShiftPatterns[rowIndex % rowShiftPatterns.length]}%`
      );

      for (let position = 0; position < itemCount; position++) {
        const image = shuffledImages[currentIndex];
        const hash = createHash(image.name || image.path);

        const item = document.createElement("div");

        item.className = [
          "item",
          "reveal",
          `item-position-${position + 1}`
        ].join(" ");

        /**
         * 上下位置をランダム風にばらけさせる
         */
        const offsetPatterns = [
          0,
          70,
          130,
          190,
          250,
          310,
          110,
          220
        ];

        const offset =
          offsetPatterns[
            (hash + position + rowIndex) % offsetPatterns.length
          ];

        item.style.setProperty("--offset", `${offset}px`);

        /**
         * 画像サイズを少しずつ変える
         */
        const widthPatterns = [
          0.76,
          0.82,
          0.88,
          0.94,
          1,
          0.85
        ];

        const widthScale =
          widthPatterns[
            (hash + rowIndex + position) % widthPatterns.length
          ];

        item.style.setProperty("--width-scale", widthScale);

        /**
         * 画像同士の重なり
         */
        const overlapPatterns = [
          { x: -24, y: 0, z: 6 },
          { x: 20, y: -75, z: 4 },
          { x: -18, y: 90, z: 3 },
          { x: 22, y: -135, z: 7 },
          { x: -27, y: -45, z: 8 },
          { x: 15, y: 105, z: 2 },
          { x: -10, y: -95, z: 5 },
          { x: 8, y: 40, z: 4 }
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

        /**
         * フェード表示の時間差
         */
        item.style.setProperty(
          "--delay",
          `${((currentIndex + position) % 6) * 80}ms`
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