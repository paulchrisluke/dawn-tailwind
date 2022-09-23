let $slb_popup = document.querySelector(".lookbook-popup-wrapper");
let $slb_popup_slide = $slb_popup.querySelector(".slide");

let slb_gallery_item_sample = document.querySelector(
  ".social-lookbook-media-container"
);
let $slb_gallery_item = slb_gallery_item_sample.cloneNode(true);
slb_gallery_item_sample.parentNode.removeChild(slb_gallery_item_sample);

let slb_gallery_colors = [
  "#F7268A",
  "#B07DC7",
  "#73DAF0",
  "#9CDB6C",
  "#F9D333",
];

let slb_slider_step = 0; //slide step in % of the slider
let slb_active_slide_index = 0;
let slb_approved_items = 0;
let ugc_gallery_items_per_row = 5;

/* Popup open/close functions */
document.querySelectorAll(".rc-popup .closePopup").forEach((item) => {
  item.addEventListener("click", (e) => {
    rc_close_popup();
  });
});

document.querySelectorAll(".rc-popup").forEach((item) => {
  item.addEventListener("click", (e) => {
    if (e.target.isSameNode(item)) {
      rc_close_popup();
    }
  });
});

function rc_show_popup(element) {
  document.body.style.width = document.body.offsetWidth + "px";
  document.body.style.top = "-" + window.scrollY + "px";
  document.body.backgroundPositionY = "-" + window.scrollY + "px";
  document.body.classList.add("active-popup");
  element.classList.add("rc-popup-active");
  setTimeout(function () {
    element.classList.add("building");
    document
      .getElementById("SiteHeader")
      .classList.add(
        "site-header",
        "site-header--heading-style",
        "site-header--stuck",
        "site-header--opening"
      );
  }, 1);
}

function rc_close_popup() {
  let popup = document.querySelector(".rc-popup-active");
  popup.classList.remove("building");
  setTimeout(function () {
    let current_scroll = Math.abs(parseFloat(document.body.style.top));
    document.body.classList.remove("active-popup");
    popup.classList.remove("rc-popup-active");
    document.body.style.width = "auto";
    document.body.style.top = "auto";
    document.body.backgroundPositionY = "initial";
    window.scrollTo(0, current_scroll);
  }, 1);
}
/* END Popup open/close function */

//Slider Arrows
$slb_popup.querySelectorAll(".control-arrow").forEach((item) => {
  item.addEventListener("click", function () {
    if (this.classList.contains("disabled")) {
      return false;
    }

    let $slider = $slb_popup.querySelector(".slider");

    if ($slider.classList.contains("move")) {
      return false;
    }

    let $old_active_slide =
      $slb_popup.querySelectorAll(".slide")[slb_active_slide_index];

    if ($old_active_slide.classList.contains("with-video")) {
      $old_active_slide.querySelector("video.content-main").pause();
    }

    let need_preload = this.classList.contains("right-arrow");

    slb_active_slide_index += this.classList.contains("right-arrow") ? 1 : -1;

    let new_position = -slb_active_slide_index * slb_slider_step;
    document.documentElement.style.setProperty(
      "--slider-new-position",
      new_position + "%"
    );

    $slider.classList.add("move");
    check_controls_disable($slb_popup);

    let $new_active_slide =
      $slb_popup.querySelectorAll(".slide")[slb_active_slide_index];

    $slider.addEventListener(
      "animationend",
      function () {
        this.style.transform = "translate(" + new_position + "%)";
        this.classList.remove("move");

        if (need_preload) {
          slide_load_ucg_media_content(slb_active_slide_index + 1, $slb_popup);
        }

        if (
          window.matchMedia("(max-width:650px)").matches &&
          $new_active_slide.classList.contains("with-video")
        ) {
          $new_active_slide.querySelector("video.content-main").play();
        }
      },
      { once: true }
    );

    recalculate_slide_height();
  });
});

//Calculate the slide height for the mobile devices
function recalculate_slide_height() {
  //Recalculate popup size (slides may have different height
  if (window.matchMedia("(max-width:830px)").matches) {
    let $slide = $slb_popup.querySelectorAll(".slide")[slb_active_slide_index];
    let needed_height =
      slb_height_with_margins($slide.querySelector(".image-block-wrapper")) +
      slb_height_with_margins($slide.querySelector(".info"));
    $slb_popup.querySelector(".slider").style.height = needed_height + "px";
  }
}

//Calculate an element height with margins
function slb_height_with_margins(el) {
  return (
    el.offsetHeight +
    parseFloat(getComputedStyle(el)["margin-top"]) +
    parseFloat(getComputedStyle(el)["margin-top"])
  );
}

/*
  Initial script
  Creates gallery and popup structure
*/
//Get data for the gallery
let ugc_all_data;

/*
$('.social-lookbook-section .show-more-lines').on('click', function(){
    
  slb_gallery_colors = slb_gallery_colors
  .map((value) => ({ value, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .map(({ value }) => value)
  
  let current_shift = Number($(this).data('shift'));
  let new_shift = current_shift + ugc_gallery_items_per_row
  
  ugc_create_gallery_item(ugc_all_data.slice(current_shift, new_shift));
  $(this).data('shift', new_shift);
  
  if(ugc_all_data.length <= new_shift){
    $(this).remove();
  }
  
  for(let i = current_shift; i<new_shift;i++){
    slide_load_ucg_media_content(i,$slb_popup);
  }
});
*/

function ugc_create_gallery_item(records) {
  records.forEach(function (item, index) {
    let $new_gallery_item = $slb_gallery_item.cloneNode(true);

    //Function, that responsilbe for open the popup with the needed slide =========================================================================================================================
    $new_gallery_item.addEventListener("click", function () {
      //Get needed slide index
      slb_active_slide_index = Array.prototype.indexOf.call(
        this.parentNode.children,
        this
      );

      //Try to load content for the next slide, in case the next slide placed on the next line and stil doesn't loaded
      slide_load_ucg_media_content(slb_active_slide_index + 1, $slb_popup);

      //Clear previos popup control settings
      check_controls_disable($slb_popup);

      //Calculation animation stuff
      let tranlaste_position = -slb_slider_step * slb_active_slide_index;
      $slb_popup.querySelector(".slider").style.transform =
        "translate(" + tranlaste_position + "%)";

      //Preload next slide if needed
      if (slb_active_slide_index == 4) {
        slide_load_ucg_media_content(5, $slb_popup);
      }

      //Create popup
      rc_show_popup($slb_popup);
      //Slide Height calculation for the mobile devices
      setTimeout(recalculate_slide_height, 100);

      /*
        $('#SiteHeader').css('width', $('#SiteHeader').width());
        ->
        $('#SiteHeader').removeAttr('style');
      */

      //Start autoplay
      if (window.matchMedia("(max-width:650px)").matches) {
        let $active_popup_slide =
          $slb_popup.querySelectorAll(".slide")[slb_active_slide_index];
        if ($active_popup_slide.classList.contains("with-video")) {
          $active_popup_slide.querySelector("video.content-main").play();
        }
      }

      //unmute video
      $slb_popup.querySelectorAll("video.content-main").forEach((item) => {
        item.addEventListener("volumechange", function () {
          let muted_status = this.muted;
          $slb_popup.querySelectorAll("video.content-main").forEach((item) => {
            item.muted = muted_status;
          });
        });
      });
    });

    //Set background color
    if (index % 5 == 0) {
      slb_gallery_colors = slb_gallery_colors
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
    }

    let random_bg_color = slb_gallery_colors[index % 5];
    $new_gallery_item.querySelector(".image-block-wrapper").style.background =
      random_bg_color;

    let element_to_delete;
    if (item["type"] !== "image") {
      $new_gallery_item
        .querySelector("video")
        .setAttribute("src", item["content_url"]);
      element_to_delete = "img";
    } else {
      $new_gallery_item
        .querySelector("img")
        .setAttribute("src", item["thumbnail_url"]);
      element_to_delete = "video";
    }
    //The block has video or image, so we delete unnecessary element
    element_to_delete = $new_gallery_item.querySelector(element_to_delete);
    element_to_delete.parentNode.removeChild(element_to_delete);

    // Add products info
    if (!item.products?.length) {
      $new_gallery_item
        .querySelector(".product-info-container")
        .classList.add("hidden");
    } else {
      let product = item.products[0];
      let productTextWrapper = $new_gallery_item.querySelector(
        ".product-text-wrapper"
      );
      let productImage = $new_gallery_item.querySelector(".product-image");
      productImage.setAttribute("src", product.product_image);
      productTextWrapper.style.background = random_bg_color;
      $new_gallery_item.querySelector(".product-title").innerText =
        product.product_name;
      $new_gallery_item.querySelector(".product-price").innerText =
        "$" + product.product_price;
    }

    // Adds hashtags
    if (!item.hashtags?.length) {
      $new_gallery_item.querySelector(".hashtags").classList.add("hidden");
    } else {
      $new_gallery_item.querySelector(".hashtags").innerText = item?.hashtags
        .map((tag) => "#" + tag.label)
        .join(" ")
        .replace(/,/g, "");
    }

    // user details
    if (!item.avatar.thumbnail_url) {
      $new_gallery_item.querySelector(".user-image").classList.add("hidden");
    } else {
      $new_gallery_item
        .querySelector(".user-image")
        .setAttribute("src", item.avatar.thumbnail_url);
    }
    $new_gallery_item
      .querySelector(".user-profile-link")
      .setAttribute("href", item.url);
    $new_gallery_item.querySelector(".user-name").innerText = item.name;
    $new_gallery_item.querySelector(".user-handle").innerText = item.username;

    // Adds new item to DOM
    document
      .querySelector(".social-lookbook-galley")
      .appendChild($new_gallery_item);
  });
}

/* Initial content loading */
fetch("https://app.iloveugc.com/api/v1/feed/3")
  .then((response) => {
    return response.json();
  })
  .then((response) => {
    let data = response.data;
    /* Hom many items should be shown */
    let how_many_show = 5;

    //Check if we should show all items
    if (typeof slb_config != "undefined" && slb_config.show_all) {
      document.querySelector(
        ".social-lookbook-section .show-more"
      ).style.display = "none";
      how_many_show = data.length;
    }
    /* END How many items should be shown */

    ugc_all_data = data;
    ugc_create_gallery_item(data.slice(0, how_many_show));

    //Process returned data
    data.forEach(function (item, index) {
      let $new_slide = $slb_popup_slide.cloneNode(true);
      $new_slide.setAttribute("data-src", item["content_url"]);

      if (item.products?.[0]?.product_url) {
        $new_slide
          .querySelector(".buy-button")
          .setAttribute(
            "href",
            item.products?.[0]?.product_url +
              "?utm_source=iloveugc&utm_medium=buy-button&utm_campaign=home-widget"
          );
      } else {
        $new_slide.querySelector(".buy-button").classList.add("hidden");
      }

      if (item["type"] !== "image") {
        $new_slide.classList.add("with-video");
        let item_for_delete = $new_slide.querySelector(
          ".image-block-wrapper img"
        );
        item_for_delete.parentNode.removeChild(item_for_delete);
      } else {
        $new_slide
          .querySelector(".image-block-wrapper")
          .querySelectorAll(".video-switcher, video")
          .forEach((item) => {
            item.parentNode.removeChild(item);
          });
      }

      $slb_popup.querySelector(".slider").appendChild($new_slide);

      //Get data from instargam post
      $new_slide
        .querySelector(".user-link")
        .setAttribute(
          "href",
          "https://www.instagram.com/" + item["username"] + "/"
        );
      $new_slide
        .querySelector(".user-image")
        .setAttribute("src", item["avatar"]?.thumbnail_url);
      $new_slide.querySelector(".user-name").innerHTML = item["username"];

      if (item["description"]) {
        $new_slide.querySelector(".user-info .text").innerHTML =
          item["description"];
      }

      //Get data about connected products
      let product = item?.products?.[0];
      let price = $new_slide.querySelector(".product-price");
      product?.product_price
        ? (price.innerHTML = "$ " + product?.product_price)
        : (price.innerHTML = "");
      $new_slide.querySelector(".product-name").innerHTML =
        product?.product_name || "";

      let productImage = $new_slide.querySelector(".product-image");
      if (product?.product_image) {
        productImage.setAttribute("data-src", product?.product_image);
      } else {
        productImage.classList.add("hidden");
      }

      slb_approved_items++;
    });

    //Popup set up final steps
    slb_slider_step = 100 / slb_approved_items;
    $slb_popup.querySelector(".slider").style.width =
      slb_approved_items * 100 + "%";
    $slb_popup.querySelectorAll(".slide").forEach((item) => {
      item.style.width = slb_slider_step + "%";
    });

    $slb_popup_slide.parentNode.removeChild($slb_popup_slide);

    /* Pre load slides based on a scroll position */
    let ugc_gallery_elements = document.querySelectorAll(
      ".social-lookbook-galley .image-block-wrapper"
    );

    window.addEventListener("resize", resize_slider_preload);
    function resize_slider_preload() {
      ugc_gallery_elements.forEach((item) => {
        item.dataset.position =
          item.getBoundingClientRect().top + window.scrollY;
      });
    }
    resize_slider_preload();

    window.addEventListener("scroll", (e) => {
      let current_position = window.scrollY + window.innerHeight;
      let new_ugc_elements = [];
      ugc_gallery_elements.forEach((item) => {
        if (current_position > Number(item.dataset.position)) {
          item.classList.add("slide-loaded");
          slide_load_ucg_media_content(
            Array.prototype.indexOf.call(item.parentNode.children, item),
            $slb_popup
          );
        } else {
          new_ugc_elements.push(item);
        }
      });
      ugc_gallery_elements = new_ugc_elements;
    });

    /* END Preload slides base on a scroll position */

    //Add stop/play function to videos
    $slb_popup.querySelectorAll(".video-switcher").forEach((item) => {
      item.addEventListener("click", function () {
        let video = this.parentNode.querySelector("video.content-main");
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      });
    });

    //Swipe functions for the slider
    let slb_slider_drag_x = 0;
    let slb_slider_drag_y = 0;
    $slb_popup.querySelectorAll(".slide").forEach((item) => {
      item.addEventListener("touchstart", (e) => {
        aaa = e;
        slb_slider_drag_x = e.changedTouches[0].clientX;
        slb_slider_drag_y = e.changedTouches[0].clientY;
      });
    });
    $slb_popup.querySelectorAll(".slide").forEach((item) => {
      item.addEventListener("touchend", (e) => {
        let delta_x = e.changedTouches[0].clientX - slb_slider_drag_x;
        let delta_y = e.changedTouches[0].clientY - slb_slider_drag_y;

        if (Math.abs(delta_x) > Math.abs(delta_y) && Math.abs(delta_x) > 10) {
          console.log(delta_x);
          if (delta_x > 0) {
            //left
            $slb_popup
              .querySelector(".left-arrow")
              .dispatchEvent(new Event("click"));
          } else {
            $slb_popup
              .querySelector(".right-arrow")
              .dispatchEvent(new Event("click"));
          }
        }
      });
    });
  })
  .catch((e) => {
    console.log(
      "%csocial-lookbook-functions.js line:444 Error from fetch",
      "color: #007acc;",
      e
    );
  });

/* 
  Load content for the slide
    If the content was already loaded will just return FALSE
*/
function slide_load_ucg_media_content(index, $popup) {
  let $slide = $popup.querySelectorAll(".slide")[index];

  if ($slide.classList.contains("loaded")) {
    return false;
  }
  $slide.classList.add("loaded");

  $items = $slide
    .querySelectorAll(".content-main, .content-background")
    .forEach((item) => {
      item.setAttribute("src", $slide.dataset.src);
    });

  let $product_image = $slide.querySelector(".product-image");
  $product_image.setAttribute("src", $product_image.dataset.src);
}

function check_controls_disable($popup) {
  $popup.querySelectorAll(".control-arrow").forEach((item) => {
    item.classList.remove("disabled");
  });
  if (slb_active_slide_index == 0) {
    $popup.querySelector(".left-arrow").classList.add("disabled");
  }
  if (slb_active_slide_index + 1 == slb_approved_items) {
    $popup.querySelector(".right-arrow").classList.add("disabled");
  }
}

/* Get featured on our hompage block */
document
  .querySelector(".social-lookbook-section .involvement-info")
  .addEventListener("click", (e) => {
    rc_show_popup(document.getElementById("involment-popup"));
  });
/* END */
