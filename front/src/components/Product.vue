<template>
  <div class="col-lg-4 col-md-6 mb-4">
    <div class="card h-100">
      <a href="#"><img class="card-img-top" :src="product.urlImage" alt=""></a>
      <div class="card-body">
        <h4 class="card-title">
          <a href="#">{{ product.title }}</a>
        </h4>
        <h5>{{ product.price }}€</h5>
        <p class="card-text">{{ product.description }}</p>
      </div>
      <div class="card-footer">
        <star-rating
            :max-rating="5"
            :rating="product.note"
            :read-only="true"
            :star-size="20"
            :inline="true"
            :show-rating="false"/>
      </div>
      <div class="card-footer">
        <p>
          <label> Commande : </label>
          <input v-model="comande"/>
          <button v-on:click="requestCommande"> Commander </button>
        </p>
        <h4 v-if="error" style="color:red"> {{this.errors}} </h4>
      </div>
    </div>
  </div>
</template>

<script>
import StarRating from "vue-star-rating"
import axios from "axios";
const apiURLBook = "http://localhost:3000/books"
const apiURLMagazine = "http://localhost:3001/magazines"
let apiURLProduct = ""
export default {
  name: "Product",
  props : ["obj","src"],
  components: {StarRating},
  data() {
    return {
      product : {},
      comande : 0,
      errors: "",
      error : false
    }
  },
  created: function() {
    this.product = this.obj;
    switch (this.src) {
      case "mag" :
        apiURLProduct = apiURLMagazine;
        console.log(apiURLProduct);
        break;
      case "book" :
        apiURLProduct = apiURLBook;
        console.log(apiURLProduct);
        break;
    }
  },
  methods: {
    requestCommande: function (){
      try {
        axios.get(apiURLProduct + "/" + this.product.id)
            .then(res => {
              this.product = (res.data)
              if(this.product.stock >= this.comande) {
                this.error = false
                axios.patch(apiURLProduct + "/" + this.product.id,
                    {stock: this.product.stock - this.comande})
                    .then(res => {
                      this.product = (res.data)
                    })
              }else{
                this.errors= "Commande refuser, pas plus de " + this.product.stock
                this.error = true
              }
            })
      } catch (error) {
        console.log(error);
      }

    }
  }
}

</script>

<style scoped>

</style>