const app = Vue.createApp({
  data(){
    return {
      current_store: '',
      store_code: '',
      message: '',
      selected: '',
      Orders: [],
      orders: ''
    }
  },

  async mounted(){
    const code = sessionStorage.getItem("code");
    if (code) {
      this.store_code = code;
      await this.getStore(this.store_code);
    }
  },

  computed:{

  },

  methods: {
    async getStore(code){
      this.message = '';
      data = await fetch('http://localhost:3000/api/v1/stores/'+code)
      result = await data.json();

      if(result.error_message){
        this.message = result.error_message;
      }else{
        store = result.store
        var store_data = new Object();
        store_data.trade_name = store.trade_name;
        store_data.corporate_name = store.corporate_name;
        store_data.register_number = store.register_number;
        store_data.code = store.code;
        sessionStorage.setItem("code", store.code);
        this.current_store = store_data;
        this.message = 'Acesso realizado com sucesso'
      }
    },

    logoutStore(){
      current_store = '';
      sessionStorage.removeItem("code");
      window.location.reload();
    },

    async getOrders(){
      this.orders = '';
      let params = new URLSearchParams({
        status: this.selected,
      });

      let data = await fetch(`http://localhost:3000/api/v1/stores/${this.current_store.code}/orders/status?${params}`);
      results = await data.json();
      console.log(results)
      if(results.message){
        this.orders = results.message
      }else{
        
      }
    }
  }
})

app.mount('#app');