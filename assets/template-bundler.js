import {
  createContext,
  h,
  Component,
  render,
} from "https://cdn.skypack.dev/preact@10.5.14";
import { html } from "https://cdn.skypack.dev/htm@3.1.0/preact";
import {
  useContext,
  useState,
  useMemo,
  useEffect,
  useReducer,
} from "https://cdn.skypack.dev/preact@10.5.14/hooks";

const Theme = createContext("71280296056");
const bundleProductsNeededQuantity = 4;

const getProductsFromCollection = async (collectionID) => {
  // console.log(collectionID);

  const allProducts = await fetch(
    `https://sweet-rain-798e.refactorthis.workers.dev/collections/${collectionID}`
  );
  const data = await allProducts.json();
  return data;
};

// Gets the image src and adds a sizing tag within the src url
// I know this shou d be a switch
//TODO: Make this a switch statement
const reformatImageSrc = (src) => {
  if (src.includes(".jpeg")) {
    return src.replace(".jpeg", "_medium.jpeg");
  } else if (src.includes(".jpg")) {
    return src.replace(".jpg", "_medium.jpg");
  } else if (src.includes(".png")) {
    return src.replace(".png", "_medium.png");
  } else if (src.includes(".gif")) {
    return src.replace(".gif", "_medium.gif");
  } else {
    return src;
  }
};

const fetchProductData = async (productID) => {
  const product = await fetch(
    `https://sweet-rain-798e.refactorthis.workers.dev/products/${productID}`
  );
  const data = await product.json();
  return data.product;
};

// Send post request to Shopify Cart API to destructure and add products to cart
const postBundleToCart = (products) => {
  let formData = {
    items: [],
  };

  window.sessionStorage.setItem("bundleProducts", JSON.stringify(products));
  window.sessionStorage.setItem("addedBundle", true);

  products.forEach((product) => {
    //NOTE: this should check for the product already existing, if it does just add more quantity
    // console.log("post", product);
    let builtProduct = {
      id: product.variants[0].id,
      quantity: 1,
    };
    formData.items.push(builtProduct);
    // console.log(formData);
  });
  fetch("/cart/add.js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      // console.log(response);
      if (response.status === 200) {
        window.location = "/cart?discount=bundlebuilder";
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

const formatMoney = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

function ProductList(props) {
  const activeProducts = props.products.filter(
    (product) =>
      product.status === "active" &&
      product.product_type != "Bundle" &&
      product.product_type != "Gift Box" &&
      product.product_type != "Flocked Sticker"
  );
  // console.log(activeProducts);
  return html`
    <ul className="product_bundler-productlist-list">
      ${activeProducts.map(
        (product) =>
          html`
            <li
              key=${product.id}
              className="product_bundler-productlist-product"
            >
              <a href="#">
                <img
                  src="${reformatImageSrc(product.images[0].src)}"
                  alt="${product.title}"
                  data-product-id="${product.id}"
                  onClick=${(e) => {
                    e.preventDefault();
                    props.addProductToBundle(e.currentTarget.dataset.productId);
                  }}
                />
                <p className="product_bundler-productlist-product-name">
                  ${product.title}
                </p>
              </a>
            </li>
          `
      )}
    </ul>
  `;
}
/*
              <button
                data-product-id="${product.id}"
                className="product_bundler-productlist-button"
                onClick=${(e) => {
                  // console.log("clicked", e.currentTarget.dataset.productId);
                  props.addProductToBundle(e.currentTarget.dataset.productId);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-plus-lg"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
                  />
                </svg>
              </button>
*/

function CollectionSelector(props) {
  const changeCollection = (prodID) => {
    props.setSwitchingCollection(true);
    getProductsFromCollection(prodID)
      .then((response) => {
        if (response) {
          props.setProducts(response.products);
          props.setSelectedCollection(prodID);
        }
      })
      .then(() => props.setSwitchingCollection(false));
  };
  return html`
    <div className="product_bundler-hide-mobile">
      <div className="product_bundler-collection-selector">
        <div className="product_bundler-collection-selector-list">
          ${props.collections.map(
            (collection) =>
              html`
                <div
                  className=${props.selectedCollection == collection.id
                    ? "product_bundler-collection-selector-list-item-active"
                    : "product_bundler-collection-selector-list-item"}
                  onClick=${() => changeCollection(collection.id)}
                >
                  ${collection.title}
                </div>
              `
          )}
        </div>
      </div>
    </div>
  `;
}

function BundledProducts(props) {
  return html`
    <div className="product_bundler-bundled-products-wrapper">
      <div className="product_bundler-bundled-products-header">
        <h4>your bundle</h4>
        <div>
          ${props.totalPrice > 1
            ? html`
                <span className="product_bundler-pricing-total"
                  >$${props.totalPrice}</span
                >
                <span className="product_bundler-pricing-total-discounted"
                  >${formatMoney.format(
                    props.totalPrice - props.totalPrice * 0.05
                  )}</span
                >
              `
            : ""}
        </div>
      </div>
      <div className="product_bundler-bundled-products-container">
        <div className="product_bundler-bundled-products-container-inner">
          ${props.selectedProducts.map(
            (product, index) =>
              html`<${BundledProduct}
                key=${product.id}
                index=${index}
                product=${product}
                setSelectedProducts=${props.setSelectedProducts}
                selectedProducts=${props.selectedProducts}
                removeProductFromBundle=${props.removeProductFromBundle}
              />`
          )}
        </div>
      </div>
      <${AddToCartButton}
        bundleCount=${props.bundleCount}
        selectedProducts=${props.selectedProducts}
        onBundler=${true}
      />
    </div>
  `;
}

function BundledProduct(props) {
  // console.log(props.product);
  if (!props.product.title) {
    return html`<div className="product_bundler-product-none">
      <div className="product_bundler-product-image">
        <img
          src="https://cdn.shopify.com/s/files/1/0813/1345/files/empty-sock_2571a938-85f5-4b74-b6b3-82c95635c01b.png?v=1636739367"
          alt="Empty sock area, need to pick a sock"
        />
      </div>
    </div> `;
  }
  return html`
    <div className="product_bundler-product-active">
      <div
        onClick=${() => props.removeProductFromBundle(props.product.id)}
        className="product_bundler-product-active-svg"
      >
        <svg
          width="24"
          height="24"
          viewBox="5 6 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_d_327_590)">
            <rect
              x="17"
              y="0.786621"
              width="24"
              height="24"
              rx="12"
              transform="rotate(45 17 0.786621)"
              fill="#EB4869"
              shape-rendering="crispEdges"
            />
            <path
              d="M21.9502 12.8076L12.0507 22.7071"
              stroke="black"
              stroke-width="2"
              stroke-linecap="square"
            />
            <path
              d="M12.0498 12.8076L21.9493 22.7071"
              stroke="black"
              stroke-width="2"
              stroke-linecap="square"
            />
            <rect
              x="17"
              y="2.20083"
              width="22"
              height="22"
              rx="11"
              transform="rotate(45 17 2.20083)"
              stroke="black"
              stroke-width="2"
              shape-rendering="crispEdges"
            />
          </g>
          <defs>
            <filter
              id="filter0_d_327_590"
              x="0.0292969"
              y="0.786621"
              width="33.9414"
              height="33.9409"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_327_590"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_327_590"
                result="shape"
              />
            </filter>
          </defs>
        </svg>
      </div>
      <div className="product_bundler-product-image">
        <img
          src="${reformatImageSrc(props.product.image.src)}"
          alt="${props.product.title}"
        />
      </div>
    </div>
  `;
}

function AddToCartButton(props) {
  if (props.bundleCount >= bundleProductsNeededQuantity) {
    return html`
      <div class="bundle_button">
        <button
          className=${props.onBundler
            ? "product_bundler-add-to-cart-button product_bundler-add-to-cart-button-complete"
            : "product_bundler-add-to-cart-button-mobile product_bundler-add-to-cart-button-complete-mobile"}
          onClick=${() => postBundleToCart(props.selectedProducts)}
        >
          Add bundle to cart!
        </button>
      </div>
    `;
  }

  return html`
    <div class="bundle_button">
      <button
        disabled
        className=${props.onBundler
          ? "product_bundler-add-to-cart-button"
          : "product_bundler-add-to-cart-button-mobile"}
      >
        Add ${bundleProductsNeededQuantity - props.bundleCount} more to cart
      </button>
    </div>
  `;
}

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switchingCollection, setSwitchingCollection] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState("71280296056");
  const [selectedProducts, setSelectedProducts] = useState([{}, {}, {}, {}]);
  const [bundleCount, setBundleCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const collections = [
    {
      id: "71280296056",
      title: "Best Sellers",
    },
    {
      id: "245275558087",
      title: "Artist Collabs",
    },
    {
      id: "406037706",
      title: "Pride",
    },
    {
      id: "262872334535",
      title: "Butt Stuff",
    },
    {
      id: "273321590983",
      title: "Raunchy",
    },
    {
      id: "406037322",
      title: "Knee Socks",
    },
  ];

  const prodID = useContext(Theme);

  const addProductToBundle = async (productId) => {
    const productToAdd = await fetchProductData(productId);
    setSelectedProducts(selectedProducts.unshift(productToAdd));
    console.log(selectedProducts);
    if (selectedProducts.length >= 4) {
      selectedProducts.splice(selectedProducts.length - 1, 1);
      setSelectedProducts(selectedProducts);
      setBundleCount(bundleCount - 1);
    }

    setBundleCount(bundleCount + 1);
    console.log("bundleCount", bundleCount);

    let newPrice = 0;
    //NOTE: Calc new price each time. It shouldn't keep adding price to the totalPrice
    console.log("selectedProducts", selectedProducts);
    //  selectedProducts.forEach((product) => {
    //   console.log("thatproduct", product);
    //   if (product.variants[0].price) {
    //     newPrice = newPrice + parseInt(product.variants[0].price);
    //     console.log('added price', newPrice);
    //   }
    //   console.log('new price',newPrice);
    // });

    selectedProducts.forEach((product) => {
      if (product.variants[0].price) {
        newPrice = newPrice + parseInt(product.variants[0].price);
      }
    });
    let total = totalPrice + parseInt(productToAdd.variants[0].price);
    setTotalPrice(newPrice);
  };

  const removeProductFromBundle = (productId) => {
    const productIndex = selectedProducts.findIndex(
      (product) => product.id == productId
    );
    const findProduct = selectedProducts.find(
      (product) => product.id == productId
    );
    let total = totalPrice - parseInt(findProduct.variants[0].price);
    setTotalPrice(total);

    selectedProducts.splice(productIndex, 1);
    setSelectedProducts([...selectedProducts, {}]);
    let newBundleCount = bundleCount - 1;
    setBundleCount(newBundleCount);
  };

  useEffect(() => {
    getProductsFromCollection(prodID)
      .then((response) => {
        if (response) {
          setProducts(response.products);
        }
      })
      .then(() => setLoading(false));
  }, []);
  return html`
    ${loading
      ? html`
          <h2
            className="product_bundler-header product_bundler-hide-mobile"
            style="text-transform: uppercase; font-weight: bold;"
          >
            LOADING CUSTOM BUNDLE BUILDER...
          </h2>
        `
      : html`
          <${BundledProducts}
            selectedProducts=${selectedProducts}
            setSelectedProducts=${setSelectedProducts}
            removeProductFromBundle=${removeProductFromBundle}
            bundleCount=${bundleCount}
            totalPrice=${totalPrice}
          />
          <div className="product_bundler-product-area">
            <div className="product_bundler-product-area-header">
              <h4
                className="product_bundler-hide-mobile product_bundler-header"
                style="text-transform: uppercase; font-weight: bold; margin: 0; font-size: 35px;"
              >
                Better by the bundle
              </h4>
              <h6
                style="margin: 7px auto; text-align: center; font-size: 15px; font-weight: 500; line-height: 21px; max-width:721px;"
              >
                Make your custom Bundle O' Socks with 4 pairs of ANY STYLE and
                get 5% off!
                <br />
                Not only that, we’ll ship ‘em for free!
              </h6>
              <p
                style="margin: 0 0 5px 0; font-size: 13px; font-style: italic;"
              >
                Discount automatically applied at checkout
              </p>
              <${CollectionSelector}
                setProducts=${setProducts}
                setLoading=${setLoading}
                setSelectedCollection=${setSelectedCollection}
                selectedCollection=${selectedCollection}
                setSwitchingCollection=${setSwitchingCollection}
                collections=${collections}
              />
            </div>
            ${switchingCollection
              ? html` <h2
                  className="product_bundler-header product_bundler-hide-mobile"
                  style="text-transform: uppercase; font-weight: bold;"
                >
                  switching collections...
                </h2>`
              : html`<${ProductList}
                  products="${products}"
                  addProductToBundle=${addProductToBundle}
                />`}
          </div>
          <${AddToCartButton}
            bundleCount=${bundleCount}
            selectedProducts=${selectedProducts}
          />
        `}
  `;
}

render(html`<${App} />`, document.querySelector("#product-bundle__preact"));
