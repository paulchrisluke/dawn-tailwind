let pagination_url = "";

const initialFetch = async () => {
  // add &per_page=10 for pagination
  let response = await fetch(
    "https://app.iloveugc.com/api/v1/feed/3?page=3&filter[is_active]=true"
  );
  let feedItems = await response.json();
  await addNewItemsToFeed(feedItems.data);
  // pagination_url = feedItems.next_page_url;
};

const paginateNextPage = async () => {
  let response = await fetch(pagination_url);
  let newFeedItems = await response.json();
  await addNewItemsToFeed(newFeedItems.data);
};

function addNewItemsToFeed(feed) {
  if (feed.length) {
    let swiper_wrapper = document.querySelector(".swiper-wrapper");
    feed
      .sort(function (a, b) {
        return a.created_at > b.created_at
          ? -1
          : a.created_at < b.created_at
          ? 1
          : 0;
      })
      .forEach((item) => {
        swiper_wrapper.appendChild(createImageCard(item));
      });
  }
}

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
    new_gallery_item.innerHTML = `<img data-src="${item.thumbnail_url}" class="xw-full xh-full xobject-cover xobject-center">`;
  } else {
    new_gallery_item.innerHTML = `<video data-src="${item.content_url}" class="xw-full xh-full xobject-cover xobject-center" autoplay muted loop playsinline></video>`;
  }
  return new_gallery_item;
}

window.addEventListener("load", async () => {
  await initialFetch();
  if (!!window.IntersectionObserver) {
    // let slides = document.querySelectorAll(".swiper-slide");
    let observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          let media = entry.target.firstChild;

          // update media src with data-src
          media.src = media.dataset.src;

          // if video, play or pause
          if (media.tagName === "VIDEO") {
            let isPaused = false;
            if (entry.intersectionRatio != 1 && !media.paused) {
              media.pause();
              isPaused = true;
            } else if (isPaused) {
              media.play();
              isPaused = false;
            }
          }

          console.log(
            "%csocial-lookbook-feed.js line:86 media",
            "color: #007acc;",
            entry
          );

          // pagination check
          // if (entry.target === slides[slides.length - 1]) {
          //   observer.disconnect();
          //   paginateNextPage();
          //   document.querySelectorAll(".swiper-slide").forEach((item) => {
          //     observer.observe(item);
          //   });
          // }

          observer.unobserve(entry.target);
        }
      });
    }, {});
    document.querySelectorAll(".swiper-slide").forEach((item) => {
      observer.observe(item);
    });
  }
});
