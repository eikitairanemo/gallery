const gallery = document.getElementById("gallery");

for(let i=1;i<=20;i++){

    gallery.innerHTML += `
        <div class="item">
            <img src="https://picsum.photos/600/${500+i}" alt="">
        </div>
    `;

}