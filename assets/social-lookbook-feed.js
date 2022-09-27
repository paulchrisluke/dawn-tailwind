fetch("https://app.iloveugc.com/api/v1/feed/3?page=3&per_page=15")
  .then((response) => response.json())
  .then((results) => {
    const feed = results.data;
    if (feed.length) {
      let swiper_wrapper = document.querySelector(".swiper-wrapper");
      if (swiper_wrapper)
        feed
          .sort((a, b) => b.id - a.id)
          .filter((item) => item.is_active)
          .forEach((item) => {
            swiper_wrapper.appendChild(createImageCard(item));
          });
    }
  })
  .catch((e) => console.log(e));

function createImageCard(item) {
  let new_gallery_item;
  if (item.products?.length && item.products?.[0]?.product_url) {
    new_gallery_item = document.createElement("a");
    new_gallery_item.setAttribute("href", item.products?.[0]?.product_url);
  } else {
    new_gallery_item = document.createElement("div");
  }
  new_gallery_item.classList.add(
    "swiper-slide",
    "xh-[498px]",
    "xrounded-3xl",
    "xbg-black",
    "xoverflow-hidden"
  );
  new_gallery_item.style.cssText =
    "border:2px solid black;box-shadow:black 3px 3px 0 0;";

  if (item.type === "image") {
    new_gallery_item.innerHTML = `<img src="${item.thumbnail_url}" class="xw-full xh-full xobject-cover xobject-center">`;
  } else {
    new_gallery_item.innerHTML = `<video src="${item.content_url}" class="xw-full xh-full xobject-cover xobject-center" autoplay muted loop playsinline></video>`;
  }
  return new_gallery_item;
}
