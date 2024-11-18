const app = Vue.createApp({
  data(){
    return {
      current_store: '',
      store_code: '',
      message: '',
      selected: '',
      Orders: [],
      message_orders: '',
      Order: '',
      message_order: ''
    }
  },

  async mounted(){
    const code = sessionStorage.getItem("code");
    if (code) {
      this.store_code = code;
      await this.getStore(this.store_code);
    }
  },

  watch: {
    async selected(newVal, oldVal) {
      if (newVal) {
        await this.getOrders();
      }
    }
  },

  methods: {
    async getStore(code){
      try{
        this.message = '';
        let data = await fetch('http://localhost:3000/api/v1/stores/'+code)
        let result = await data.json();

        if(result.error_message){
          this.message = result.error_message;
        }else{
          let store = result.store
          var store_data = new Object();
          store_data.trade_name = store.trade_name;
          store_data.corporate_name = store.corporate_name;
          store_data.register_number = store.register_number;
          store_data.code = store.code;
          sessionStorage.setItem("code", store.code);
          this.current_store = store_data;
          this.message = 'Acesso realizado com sucesso'
        }
      }catch{
        this.message = 'Não foi possível conectar ao servidor'
      }
    },

    logoutStore(){
      current_store = '';
      sessionStorage.removeItem("code");
      window.location.reload();
    },

    async getOrders(){
      try{
        this.Orders = [];
        this.orders = '';
        let params = new URLSearchParams({
          status: this.selected,
        });

        let data = await fetch(`http://localhost:3000/api/v1/stores/${this.current_store.code}/orders/status?${params}`);
        let results = await data.json();
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
      }catch{
        this.message_orders = 'Não foi possível conectar ao servidor'
      }
    },

    async showModal(order_code){
      this.message_order = '';
      const modal = document.querySelector(`#order_details`);
      Order = await this.getDetailsOrder(order_code);
      modal.showModal();
    },

    closeModal(){
      const modal = document.querySelector(`#order_details`);
      modal.close();
    },

    async getDetailsOrder(order_code){
      let data = await fetch(`http://localhost:3000/api/v1/stores/${this.current_store.code}/orders/${order_code}`);
      let result = await data.json();
      if(result.error_message){
        this.message_order = result.error_message;
      }else{
        this.orderDetails(result);
      }
    },

    orderDetails(result){
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
    },

    async patchPreparing(order_code) {
      try {
        let response = await fetch(`http://localhost:3000/api/v1/stores/${this.current_store.code}/orders/${order_code}/confirmed`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'preparing' }),
        });
        if (!response.ok) throw new Error('Erro ao confirmar o pedido.');
    
        this.message_order = 'Pedido confirmado com sucesso!'
        let result = await response.json();
        this.Order = this.orderDetails(result);
      } catch (error) {
        console.error(error);
      }
    },  
    
    async patchDone(order_code) {
      try {
        let response = await fetch(`http://localhost:3000/api/v1/stores/${this.current_store.code}/orders/${order_code}/done`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'done' }),
        });
        if (!response.ok) throw new Error('Erro ao confirmar o pedido.');
    
        this.message_order = 'Pedido concluído com sucesso!'
        let result = await response.json();
        this.Order = this.orderDetails(result);
      } catch (error) {
        console.error(error);
      }
    }
  }
})

app.mount('#app');