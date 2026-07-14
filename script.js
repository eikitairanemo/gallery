const gallery = document.getElementById("gallery");

/**
 * ファイル名から固定の数値を作る
 * 再読み込みしても配置が大きく変わらないようにする
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
 * 配列をランダムに並び替える
 */
function shuffleArray(array) {
  const copiedArray = [...array];

  for (let i = copiedArray.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [copiedArray[i], copiedArray[randomIndex]] = [
      copiedArray[randomIndex],
      copiedArray[i]
    ];
  }

  return copiedArray;
}

/**
 * スクロール表示アニメーション
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
    threshold: 0.12,
    rootMargin: "0px 0px -60px 0px"
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

    shuffledImages.forEach((image, index) => {
      const hash = createHash(image.name);

      const item = document.createElement("div");
      item.className = "item reveal";

      /*
       * 画像ごとに縦方向の余白を変える
       * 0px / 25px / 50px / 75px
       */
      const offset = (hash % 4) * 25;
      item.style.setProperty("--offset", `${offset}px`);

      /*
       * 表示アニメーションを少しずつずらす
       */
      const delay = (index % 6) * 70;
      item.style.setProperty("--delay", `${delay}ms`);

      const img = document.createElement("img");

      img.src = image.path;
      img.alt = image.name;
      img.loading = "lazy";
      img.decoding = "async";

      item.appendChild(img);
      gallery.appendChild(item);

      observer.observe(item);
    });
  })
  .catch(error => {
    gallery.innerHTML = `
      <div class="gallery-error">
        <p>${error.message}</p>
      </div>
    `;

    console.error(error);
  });