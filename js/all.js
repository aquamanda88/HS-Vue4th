import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.11/vue.esm-browser.js';
import pagination from './pagination.js';

// Defining the empty object that opening modal
let productModal = {};
let deleteProductModal = {};

const app = createApp({
  data(){
    return{
      apiUrl: 'https://vue3-course-api.hexschool.io/api',
      apiPath: 'aquamanda88',
      products: [],
      isNew: false,
      tempProduct: {
        // imagesUrl: [],
      },
      pagination: {}
    }
  },
  // Pagination
  components: {
    pagination
  },
  mounted(){
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, '$1');
    axios.defaults.headers.common['Authorization'] = token;

    // Open Modal (Create n Edit with Delete)
    productModal = new bootstrap.Modal(document.getElementById('productModal'));
    deleteProductModal = new bootstrap.Modal(document.getElementById('deleteProductModal'));
    
    this.getProducts();
  },
  methods: {
    getProducts(page){
      const url = `${this.apiUrl}/${this.apiPath}/admin/products?page=:page`;
      axios.get(url)
      .then((res) => {
          console.log(res);
          if(res.data.success){
            this.products = res.data.products;
            this.pagination = res.data.pagination;
          } else{
            alert("no!");
          }
      })
    },
    openModal(isNew, item) {
      this.isNew = isNew;
      // Opening Create Modal
      if (this.isNew === 'create') {
        this.tempProduct = {
          // imagesUrl: [],
        };
        productModal.show();
        // Opening Edit Modal
      } else if (this.isNew === 'edit'){
        this.tempProduct = {...item};
        productModal.show();
        // Opening Delete Modal
      } else if (this.isNew === 'delete'){
        this.tempProduct = {...item};
        deleteProductModal.show();
      }
    },
    updateProduct(tempProduct) {
      // create a product
      let url = `${this.apiUrl}/${this.apiPath}/admin/product`;
      let method = 'post';
      // When it is not crating a product, switch to edit product API
      if (!this.isNew) {
        url = `${this.apiUrl}/${this.apiPath}/admin/product/${tempProduct.id}`;
        method = 'put';
      }

      axios[method](url, {data: tempProduct})
        .then(res=> {
          if (res.data.success) {
            this.getProducts();
            this.$emit('updateProduct');
            productModal.hide();
          }
        })
    },
    deleteProduct() {
      // delete a product
      let url = `${this.apiUrl}/${this.apiPath}/admin/product/${this.tempProduct.id}`;
      let method = 'delete';
      if (!this.isNew) {
        url = `${this.apiUrl}/${this.apiPath}/admin/product/${this.tempProduct.id}`
        method = 'put';
      }

      axios[method](url)
        .then(res=> {
          if (res.data.success) {
            this.getProducts();
            // 於 "Delete Confirm" 上綁定觸發事件 ‘deleteProduct‘
            this.$emit('deleteProduct');
            deleteProductModal.hide();
          }
        })
    }
  }
});

app.component('productModal', {
  template: `
  <div id="productModal" ref="productModal" class="modal fade" tabindex="-1" aria-labelledby="productModalLabel">
    <div class="modal-dialog modal-xl">
        <div class="modal-content border-0">
            <div class="modal-header bg-dark text-white">
                <h5 id="productModalLabel" class="modal-title">
                    <span class="me-2">Create Product</span>
                    <span>Edit Product</span>
                </h5>
                <button type="button" class="btn-close text-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col-sm-4">
                        <div class="form-group">
                            <label>Main Picture</label>
                            <input type="text" class="form-control" placeholder="Entering Url of Picture">
                            <img class="img-fluid">
                        </div>
                        <div class="mb-1">Create Pictures</div>
                        <div v-if="Array.isArray(tempProduct.imagesUrl)">
                            <div class="mb-1" v-for="(image, key) in tempProduct.imagesUrl" :key="key">
                                <div class="form-group">
                                    <label for="imageUrl">Url of Picture</label>
                                    <input type="text" class="form-control" v-model="tempProduct.imagesUrl[key]" placeholder="Entering Url of Picture">
                                </div>
                                <img class="img-fluid" :src="image">
                            </div>
                            <div v-if="!tempProduct.imagesUrl.length || tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1]">
                                <button class="btn btn-outline-primary btn-sm d-block w-100" @click="tempProduct.imagesUrl.push('')">Create Picture</button>
                            </div>
                            <div v-else>
                                <button class="btn btn-outline-danger btn-sm d-block w-100" @click="tempProduct.imagesUrl.pop()">Delete Picture</button>
                            </div>
                        </div>
                        <div v-else>
                            <button class="btn btn-outline-primary btn-sm d-block w-100" @click="createImages">Create Picture</button>
                        </div>
                    </div>
                    <div class="col-sm-8">
                        <div class="form-group">
                            <label for="title">Title</label>
                            <input id="title" v-model="tempProduct.title" type="text" class="form-control" placeholder="Entering Title">
                        </div>
                        <div class="row">
                            <div class="form-group col-md-6">
                                <label for="category">Category</label>
                                <input id="category" v-model="tempProduct.category" type="text" class="form-control" placeholder="Entering Category">
                            </div>
                            <div class="form-group col-md-6">
                                <label for="price">Unit</label>
                                <input id="unit" v-model="tempProduct.unit" type="text" class="form-control" placeholder="Entering Unit">
                            </div>
                        </div>
                        <div class="row">
                            <div class="form-group col-md-6">
                                <label for="origin_price">Original Price</label>
                                <input id="origin_price" v-model="tempProduct.origin_price" type="number" min="0" class="form-control" placeholder="Entering Original Price">
                            </div>
                            <div class="form-group col-md-6">
                                <label for="price">Sale Price</label>
                                <input id="price" v-model="tempProduct.price" type="number" min="0" class="form-control" placeholder="Entering Sale Price">
                            </div>
                        </div>
                        <hr>
                        <div class="form-group">
                            <label for="description">Description of Product</label>
                            <textarea id="description" type="text" class="form-control" placeholder="Entering Description of Product">
                            </textarea>
                        </div>
                        <div class="form-group">
                            <label for="content">content</label>
                            <textarea id="description" type="text" class="form-control" placeholder="Entering content">
                            </textarea>
                        </div>
                        <div class="form-group">
                            <div class="form-check">
                                <input id="is_enabled" class="form-check-input" type="checkbox">
                                <label class="form-check-label" for="is_enabled">Want to Enabled</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" @click="$emit('update-product'. tempProduct)">Confirm</button>
            </div>
        </div>
    </div>
  </div>
  `,
  props: ['tempProduct'],
  methods: {
    createImages() {
      this.tempProduct.imagesUrl = [
        ''
      ]
    }
  }
})

app.mount('#app');