odoo.define('tit_pos_order.RewardButton2', function(require) {
'use strict';
    const { Gui } = require('point_of_sale.Gui');
    const PosComponent = require('point_of_sale.PosComponent');
    const { posbus } = require('point_of_sale.utils');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const {useListener } = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');
    const PaymentScreen = require('point_of_sale.PaymentScreen');
    const {update_css}= require('tit_pos_order.CustomCashierScreen')
    const {verif_groupe} = require('tit_pos_order.verif_group_user')

    var rpc = require('web.rpc');
    class CustomRewardButtons2 extends PosComponent {
        constructor() {
           super(...arguments);
           verif_groupe()//vérifier groupe de l'utilisateur connecté sur pos
           useListener('click', this.onClick);
        }

        is_available() {
           const order = this.env.pos.get_order();
           
           return order
        }

        async onClick() {
            const order = this.env.pos.get_order();
            if (order.attributes.client == null){
                return this.showPopup('ErrorPopup', {
                      title:('Le choix du client est requis'),
                      body:('Veuillez définir le client s.v.p ! ')
                    });
            }
            else{
                try {
                    let fields = {}
                    fields['id'] = order.attributes.client.id
                    // vérifier si le client a atteind déjà la limite de crédit ou pas
                    let limite_atteind = await this.rpc({
                        model: 'res.partner',
                        method: 'utilsateur_atteind_limite',
                        args: [fields],
                    });
                    
                    if(limite_atteind > 0){
                        // le cas ou la limite de crédit est atteind
                        const { confirmed } = await this.showPopup('ValidationCommandePopup', {
                            title : this.env._t("Limite de crédit "),
                            body : this.env._t('La limite de crédit est dépassée pour ce client'),
                            confirmText: this.env._t("OK"),
                            cancelText: this.env._t("Annuler"),
                        });
                        if (confirmed) {
                            //traitement associé à la confirmation de l'alerte de dépassement de la limite
                            
                            Gui.showPopup("ValidationCommandeSucces", {
                               title : this.env._t("La commande est validée avec succès"),
                               confirmText: this.env._t("OK"),
                            });
                                /*créer une nouvelle commande (pour etre redirigé vers une nouvelle
                                interface de commande et le tous soit à 0)
                                */
                                this.env.pos.add_new_order();
                            
                        }        
                    }
                    else{
                        // le cas ou la limite de crédit n'est pas atteind
                         
                            
                            Gui.showPopup("ValidationCommandeSucces", {
                               title : this.env._t("La commande est validée avec succès"),
                               confirmText: this.env._t("OK"),
                            });
                            this.env.pos.add_new_order();   
                          
                    }

                } catch (error) {
                    if (error.message.code < 0) {
                        await this.showPopup('OfflineErrorPopup', {
                            title: this.env._t('Offline'),
                            body: this.env._t('Unable to save changes.'),
                        });
                    } else {
                        throw error;
                    }
                }
            }
       }
   }
    CustomRewardButtons2.template = 'CustomRewardButtons2';
    ProductScreen.addControlButton({
        component: CustomRewardButtons2,
        condition: function() {
           return this.env.pos;
       },
   });
   Registries.Component.add(CustomRewardButtons2);
   return CustomRewardButtons2;
});