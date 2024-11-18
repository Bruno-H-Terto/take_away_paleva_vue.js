const app = Vue.createApp({
  data(){
    return {
      current_store: '',
      store_code: '',
      message: '',
      selected: '',
      Orders: [],
      message_orders: '',
      Order: ''
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
      this.Orders = [];
      this.orders = '';
      let params = new URLSearchParams({
        status: this.selected,
      });

      let data = await fetch(`http://localhost:3000/api/v1/stores/${this.current_store.code}/orders/status?${params}`);
      results = await data.json();
      if(results.message){
        this.message_orders = results.message
      }else{
        this.message_orders = '';
        results.forEach(order => {
          var data_order = new Object();
          data_order.code = order.code;
          data_order.name = order.name;
          data_order.status = order.status;

          this.Orders.push(data_order);
        });
      }
    },

    async showModal(order_code){
      const modal = document.querySelector(`#order_details`);
      Order = await this.getDetailsOrder(order_code);
      modal.showModal();
    },

    async getDetailsOrder(order_code){
      let data = await fetch(`http://localhost:3000/api/v1/stores/${this.current_store.code}/orders/${order_code}`);
      result = await data.json();
      if(result.error_message){
        this.message_order = result.error_message;
      }else{
        var order = new Object();
        order.code = result.order.code;
        order.name = result.order.name;
        order.phone_number = result.order.phone_number || 'Sem registro';
        order.email = result.order.email || 'Sem registro';
        order.status = result.order.status;
        order.register_number = result.order.register_number || 'Sem registro';
        order.created_at = result.order.created_at_current;
        order.items = [];
        result.order_items.forEach(result_item => {
          var item = new Object();
          item.menu = result_item.menu;
          item.item = result_item.item;
          item.portion = result_item.portion;
          item.observation = result_item.observation;
          item.quantity = result_item.quantity;
          order.items.push(item);
        });
      this.Order = '';
      return this.Order = order;
      }
    }
  }
})

app.mount('#app');