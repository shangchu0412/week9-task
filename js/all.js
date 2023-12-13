//初始化
function init() {
  getProductList();
  getCartList();
};
init();

//產品
const productList = document.querySelector('.productWrap');
let productData = [];
let cartData = [];


function getProductList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products
  `)
    .then(function (res) {
      productData = res.data.products;
      renderProductList(productData);
    })
}

//渲染產品列表
function renderProductList(data) {
  let list = ``;
  data.forEach((item) => {
    list += `<li class="productCard">
  <h4 class="productType">新品</h4>
  <img src="${item.images}" alt="">
  <a href="#" class="addCardBtn" data-id="${item.id}" data-product="${item.title}">加入購物車</a>
  <h3>${item.title}</h3>
  <del class="originPrice">NT$${new Intl.NumberFormat().format(item.origin_price)}</del>
  <p class="nowPrice">NT$${new Intl.NumberFormat().format(item.price)}</p>
</li>`;
  });
  productList.innerHTML = list;
}


const productSelect = document.querySelector('.productSelect');

//篩選
productSelect.addEventListener('change', function (e) {
  let ary = [];
  productData.filter((item) => {
    if (item.category === e.target.value) {
      ary.push(item);
    } else if (e.target.value === "全部") {
      ary.push(item);
    }
  })
  renderProductList(ary);
})

//加入購物車
productList.addEventListener('click', function (e) {
  e.preventDefault();

  //檢查是否點擊到按鈕
  const addCartClass = e.target.getAttribute("class");
  if (addCartClass !== "addCardBtn") {
    return;
  }
  const productId = e.target.getAttribute("data-id")
  const productTitle = e.target.getAttribute("data-product");
  numCheck = 1;
  cartData.forEach((item) => {
    if (item.product.id === productId) {
      numCheck = item.quantity += 1;
    }
  })
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
    "data": {
      "productId": productId,
      "quantity": numCheck
    }
  }).then(function (res) {
    alert(`加入「${productTitle}」產品成功`)
    getCartList();
  })

})

const shoppingCartTableList = document.querySelector('.shoppingCart-tableList');

function getCartList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (res) {
      //訂單總金額
      document.querySelector('.js-total').textContent = new Intl.NumberFormat().format(res.data.finalTotal);

      //取得購物車列表
      cartData = res.data.carts;
      let list = ``;
      cartData.forEach((item) => {
        list += `<tr>
      <td>
        <div class="cardItem-title">
          <img src="${item.product.images}" alt="">
          <p>${item.product.title}</p>
        </div>
      </td>
      <td>NT$${new Intl.NumberFormat().format(item.product.price)}</td>
      <td>${item.quantity}</td>
      <td>NT$${new Intl.NumberFormat().format(item.product.price * item.quantity)}</td>
      <td class="discardBtn">
        <a href="#" class="material-icons" data-id="${item.id}" data-product="${item.product.title}">
          clear
        </a>
      </td>
    </tr>`;
      })
      shoppingCartTableList.innerHTML = list;
    })
}

//刪除品項
shoppingCartTableList.addEventListener('click', function (e) {
  e.preventDefault();
  const cartId = e.target.getAttribute("data-id");
  const cartTitle = e.target.getAttribute("data-product");
  if (cartId === null) {
    return;
  }
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function (res) {
      alert(`刪除「${cartTitle}」產品成功`);
      getCartList();
    })
})

//刪除所有品項
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener('click', function (e) {
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (res) {
      alert("已刪除所有品項！");
      getCartList();
    })
    .catch(function (res) {
      alert("目前購物車是空的！");
    })
})

//填寫資料
const form = document.querySelector('form');
//監聽送出按鈕
const orderInfoBtn = document.querySelector('.orderInfo-btn').addEventListener('click', function (e) {
  e.preventDefault();
  if (cartData.length === 0) {
    alert("購物車是空的！請先加入預購買商品");
    return
  }
  //取得欄位資料
  const customerName = document.querySelector('#customerName').value;
  const customerPhone = document.querySelector('#customerPhone').value;
  const customerEmail = document.querySelector('#customerEmail').value;
  const customerAddress = document.querySelector('#customerAddress').value;
  const tradeWay = document.querySelector('#tradeWay').value;
  if (customerName === "" || customerPhone === "" || customerEmail === "" || customerAddress === "" || tradeWay === "") {
    alert("有欄位尚未填寫");
    return;
  }
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
    "data": {
      "user": {
        "name": customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": tradeWay
      }
    }
  })
  .then(function(res){
    alert('訂單已送出！');
    getCartList();
    form.reset();
  })
  .catch(function(err){
    alert(err);
  })
})
