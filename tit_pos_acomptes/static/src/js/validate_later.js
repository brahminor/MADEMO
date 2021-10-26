odoo.define('tit_pos_acomptes.validate_later', function(require) {
'use strict';
    const { Gui } = require('point_of_sale.Gui');
    const PosComponent = require('point_of_sale.PosComponent');
    const { posbus } = require('point_of_sale.utils');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const {useListener } = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');
    const PaymentScreen = require('point_of_sale.PaymentScreen');
    var rpc = require('web.rpc');
    
    class validate_later2 extends PosComponent {
        constructor() {
           super(...arguments);
           console.log("constructor of validate later -------------------")
           useListener('click', this.onClick);
        }
        is_available() {
           const order = this.env.pos.get_order();
           
           return order
        }

        async onClick() {       
           this.enregistrer_cmd_acompte();
        }

        reload_cmd_vendeur(){
            
                        /// tester  actualisation de la page de cmd en attente////
                        var self = this; 
                        rpc.query({
                            model: 'pos.cmd_vendeur',
                            method: 'search_read',
                            args: [[['state','=','en_attente'],['config_id','=',self.env.pos.config_id]], []],
                        })
                        .then(function (orders){
                            self.env.pos.cmd_vendeur = orders;
                            rpc.query({
                            model: 'pos.cmd_vendeur.line',
                            method: 'search_read'
                            })
                        .then(function (orders_lines){
                            self.env.pos.cmd_vendeur_lines = orders_lines;
                            self.showScreen('TicketScreenEnAttente');
                        }); }); 
                        /// tester  actualisation de la page de cmd en attente////
        }     

        reload_cmd_en_attente(commande_ancienne){
                    
                        /*
                        cette fonction permet d'actualiser la page des acomptes
                        et faire appel à la fct d'actualisation de la page des cmd
                        validées par vendeur
                        @param: commande_ancienne : id de la commande qu'elle était coura,te
                        */
                        var self = this; 
                        rpc.query({
                            model: 'pos.cmd_vendeur',
                            method: 'delete_ancienne_cmd',
                            args: [{
                            'commande_ancienne': commande_ancienne, 
                                                }]
                           }).then(function(u){
                           
                        rpc.query({
                            model: 'pos.commande',
                            method: 'search_read',
                            args: [[['state','=','en_attente']], []],
                        })
                        .then(function (orders){
                            self.env.pos.commandes = orders;
                            rpc.query({
                            model: 'pos.payment_cmd',
                            method: 'search_read',
                            args: [[['pos_commande_id.state', '=', 'en_attente']], []],
                        })
                        .then(function (payment_cmd_lines_result){
                            self.env.pos.payment_cmd_lines = payment_cmd_lines_result;
                        rpc.query({
                            model: 'pos.commande.line',
                            method: 'search_read'
                            })
                        .then(function (orders_lines){
                            self.env.pos.commandes_lines = orders_lines;
                            self.reload_cmd_vendeur(); 
                        }); }); });});
                        /// tester  actualisation de la page de cmd en attente////
        } 
        async enregistrer_cmd_acompte(){
            console.log("enregistrer la commande acompte")
            var commande_ancienne = this.env.pos.get_order();
           /*
           Fonction pour créer la commande en attente
           */

                const order = this.env.pos.get_order();
           if (order.attributes.client == null){
                return this.showPopup('ErrorPopup', {
                      title:('Le choix du client est requis'),
                      body:('Veuillez définir le client s.v.p ! ')
                    });
            }
            else{
                var l =this;
                var self =this;
                var qtes_indisponibles = 0;
                var commande_ancienne = order.commande_id
                if (order.orderlines.models.length <= 0){
                    return this.showPopup('ErrorPopup', {
                      title:('Produit monquant'),
                      body:('Veuillez définir au  moins un produit s.v.p ! ')
                    });
                }
                else{
                    for (let i=0; i<order.orderlines.models.length ; i++){
                        console.log("qte dispo ", order.orderlines.models[i].product.virtual_available)
                            console.log("qte commandé ",order.orderlines.models[i].quantity)
                            
                        if (order.orderlines.models[i].quantity > order.orderlines.models[i].product.virtual_available){
                            qtes_indisponibles += 1
                            return l.showPopup('ErrorPopup', {
                                title:('Vous ne pouvez pas vendre plus que la quantitée dispnible'),
                                body:(order.orderlines.models[i].product.name+' a que '+order.orderlines.models[i].product.virtual_available + ' comme quantitée disponible')
                            });
                        }
                    }
                }
                if (qtes_indisponibles == 0) {
                //traitement associé à la confirmation de l'alerte de dépassement de la limite
                        let fields = {}
                        fields['id'] = order.attributes.client.id
                        fields['partner_id'] = order.attributes.client.id
                        fields['session_id'] = order.pos_session_id
                        var montant_acompte = 0.0
                        
                        fields['acompte'] = montant_acompte
                        //création de la commande en attente
                        let commandeId = await this.rpc({
                            model: 'pos.commande',
                            method: 'create_commande',
                            args: [fields],
                        }).then(function (commande_id) {
                            let stock_picking_id = rpc.query({
                                model: 'stock.picking',
                                method: 'create_stock_picking',
                                args: [{
                                    'order_id' : commande_id,
                                    'partner_id': fields['partner_id'],
                                }]}).then(function (picking_id){/////////////////////////
                                    //création des lignes de commandes associé à la cmd en attente crée
                                    var cpt = 0;
                                    for (let i=0; i<order.orderlines.models.length ; i++){
                                        cpt++;  
                                        let commandeLineId = rpc.query({
                                        model: 'pos.commande.line',
                                        method: 'create_commande_line',
                                        args: [{
                                            'order_id' : commande_id,
                                            'qty' : order.orderlines.models[i].quantity,
                                            'product_id' : order.orderlines.models[i].product.id,
                                            'price_unit' : order.orderlines.models[i].price,
                                            'discount' : order.orderlines.models[i].discount,
                                            'tax_ids' : order.orderlines.models[i].product.taxes_id,
                                        }] }) .then(function (commande_id) {
                                            let stock_move_id = rpc.query({
                                                model: 'stock.move',
                                                method: 'create_stock_move',
                                                args: [{
                                                    'picking_id' : picking_id,
                                                    'qty' : order.orderlines.models[i].quantity,
                                                    'product_id' : order.orderlines.models[i].product.id,
                                                    'partner_id': fields['partner_id'],
                                                    'index': i,
                                                    'nbr_total_products': order.orderlines.models.length-1,
                                                }]
                                            }).then(function(ui){
                                                if(cpt == order.orderlines.models.length){
                                                    //ie on a créer les stock move pour tt les produits à vendre
                                                    let commandeLineId = rpc.query({
                                                    model: 'stock.picking',
                                                    method: 'confirm_stock_picking_from_pos',
                                                    args: [{
                                                        'picking_id' : picking_id,
                                                    }] }).then(function(ty){

                                                        /////
                                                        self.reload_cmd_en_attente(commande_ancienne);
                                                        ////
                                                    })
                                                }
                                            })
                                        })

                                }


                        Gui.showPopup("ValidationCommandeSucces", {
                           title : l.env._t("La commande à régler partiellementenregistrée"),
                               confirmText: l.env._t("OK"),
                        });
                        /*créer une nouvelle commande (pour etre redirigé vers une nouvelle
                        interface de commande et le tous soit à 0)
                        */ 
                        l.env.pos.delete_current_order();
                        // var v = l.env.pos.add_new_order();
                        //l.env.pos.delete_current_order();
                        // l.env.pos.set_order(v);

                        })});
                }}
        }                
   }
    validate_later2.template = 'validate_later2';
    ProductScreen.addControlButton({
        component: validate_later2,
        condition: function() {
           return this.env.pos;
       },
   });
   Registries.Component.add(validate_later2);
   return validate_later2;
});