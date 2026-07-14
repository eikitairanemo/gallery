const gallery = document.getElementById("gallery");

/**
 * 文字列から固定値を作る
 * 同じ画像は、再読み込みしても同じ重なり方になります
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
 * 画像の順番をランダムにする
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
    threshold: 0.08,
    rootMargin: "0px 0px -40px 0px"
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

      /*
       * PCでは2枚または3枚の行をランダム生成
       * 約60％の確率で3枚になります
       */
      let itemCount = Math.random() < 0.6 ? 3 : 2;

      if (remaining < itemCount) {
        itemCount = remaining;
      }

      const row = document.createElement("div");

      row.className = [
        "gallery-row",
        `gallery-row-${itemCount}`,
        `row-pattern-${rowIndex % 5}`
      ].join(" ");

      /*
       * 行全体の左右移動
       */
      const rowShiftPatterns = [-4, 2, 4, -2, 1];

      row.style.setProperty(
        "--row-shift",
        `${rowShiftPatterns[rowIndex % rowShiftPatterns.length]}%`
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
         * 上下位置を画像ごとに変更
         */
        const offsetPatterns = [0, 70, 130, 190, 250];

        const offset =
          offsetPatterns[
            (hash + position + rowIndex) % offsetPatterns.length
          ];

        item.style.setProperty("--offset", `${offset}px`);

        /*
         * スクロールアニメーションの時間差
         */
        const delay = ((currentIndex + position) % 6) * 90;

        item.style.setProperty("--delay", `${delay}ms`);

        /*
         * 画像の大きさを少し変える
         */
        const widthScalePatterns = [0.88, 0.94, 1, 1.04];

        const widthScale =
          widthScalePatterns[
            (hash + rowIndex + position) %
              widthScalePatterns.length
          ];

        item.style.setProperty("--width-scale", widthScale);

        /*
         * 画像の重なり
         */
        const overlapPatterns = [
          {
            className: "",
            x: 0,
            y: 0,
            z: 1
          },
          {
            className: "overlap-left",
            x: -14,
            y: 0,
            z: 4
          },
          {
            className: "overlap-right",
            x: 14,
            y: 0,
            z: 3
          },
          {
            className: "overlap-up",
            x: 0,
            y: -110,
            z: 5
          },
          {
            className: "overlap-down",
            x: 0,
            y: 70,
            z: 2
          }
        ];

        const overlap =
          overlapPatterns[
            (hash + position * 2 + rowIndex) %
              overlapPatterns.length
          ];

        if (overlap.className) {
          item.classList.add(overlap.className);
        }

        item.style.setProperty("--overlap-x", `${overlap.x}%`);
        item.style.setProperty("--overlap-y", `${overlap.y}px`);
        item.style.setProperty("--item-z", overlap.z);

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