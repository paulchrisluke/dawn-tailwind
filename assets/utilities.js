// Utility JS for Shopify


const getProducts = async () => {
  const allProducts = await fetch('https://lucky-shape-c83c.refactorthis.workers.dev/getAllProducts')
  const data = await allProducts.json()
  return data 
}


console.log('got utility')
