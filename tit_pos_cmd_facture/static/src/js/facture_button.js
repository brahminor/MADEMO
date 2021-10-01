odoo.define('tit_pos_cmd_facture.RewardButton2', function(require) {
'use strict';
    const { Gui } = require('point_of_sale.Gui');
    const PosComponent = require('point_of_sale.PosComponent');
    const { posbus } = require('point_of_sale.utils');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const {useListener } = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');
    const PaymentScreen = require('point_of_sale.PaymentScreen');
     
    class facturesNonPayee2 extends PosComponent {
        constructor() {
           super(...arguments);
           useListener('click', this.onClick);
        }
        is_available() {
           const order = this.env.pos.get_order();
           
           return order
        }

        async onClick() {
            this.showScreen('FacturesNonPayee');
            
            
       }
   }
    facturesNonPayee2.template = 'facturesNonPayee2';
    ProductScreen.addControlButton({
        component: facturesNonPayee2,
        condition: function() {
           return this.env.pos;
       },
   });
   Registries.Component.add(facturesNonPayee2);
   return facturesNonPayee2;
});