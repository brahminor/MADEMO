odoo.define('tit_pos_order.CustomTicketButtons', function(require) {
'use strict';
    const { Gui } = require('point_of_sale.Gui');
    const PosComponent = require('point_of_sale.PosComponent');
    const { posbus } = require('point_of_sale.utils');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const { useListener } = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');
    class CustomTicketButtons extends PosComponent {
        
        constructor () { 
           super (... arguments); 
           useListener ('click', this.onClick); 
        } 

        onClick() {
            this.showScreen('TicketScreenEnAttente');
            
        }
           
    }
    CustomTicketButtons.template = 'CustomTicketButtons';
    Registries.Component.add(CustomTicketButtons);
    return CustomTicketButtons;
});