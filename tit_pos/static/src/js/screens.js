odoo.define('tit_pos.screens', function(require) {
    'use strict';

    const ClientDetailsEdit = require('point_of_sale.ClientDetailsEdit');
    const Registries = require('point_of_sale.Registries');
    var { Gui } = require('point_of_sale.Gui');
    var models = require('point_of_sale.models');
    const { useState } = owl.hooks;
    var rpc = require('web.rpc');
    
    models.load_fields('res.partner',[ 'property_account_position_id', 'company_type', 'child_ids', 'type', 'website', 'siren_company', 'nic_company','credit_limit', 'avoir_client']);

    const POSSaveClientOverride = ClientDetailsEdit =>
        class extends ClientDetailsEdit {
            constructor() {
            super(...arguments);
            this.intFields = [ 'country_id', 'state_id', 'property_product_pricelist'];
            this.changes = {};
            var child = false;
            if (this.props.partner && this.props.partner.child_ids) {
                for (var i=0; i<this.props.partner.child_ids.length;i++) {
                    var child_id = this.env.pos.db.get_partner_by_id(this.props.partner.child_ids[i])
                    if (child_id.type === 'contact') {
                        child = child_id
                    }
                }
            }
            if (child){
                this.contact_associe = useState({id : child.id , name: child.name, phone: child_id.phone, email: child_id.email});
                }
            }

            /**
             * Save to field `changes` all input changes from the form fields.
             */
            captureChange(event) {
                this.changes[event.target.name] = event.target.value;
                var contents = $('.client-details-contents');
                var val = $('input[name=company_type]:checked').val();
                if (val === 'person') {
                    contents.find(".client-details-box-contact-left").addClass('oe_hidden');
                    contents.find(".client-details-box-contact-right").addClass('oe_hidden');
                    contents.find(".client-detail-siren").addClass('oe_hidden');
                    contents.find(".client-detail-nic").addClass('oe_hidden');

                } else if (val === 'company') {
                    contents.find(".client-details-box-contact-left").removeClass('oe_hidden');
                    contents.find(".client-details-box-contact-right").removeClass('oe_hidden');
                    contents.find(".client-detail-siren").removeClass('oe_hidden');
                    contents.find(".client-detail-nic").removeClass('oe_hidden');
                }
            }
            /**
            * @override
            */
            async saveChanges(event) {
            try {

                let processedChanges = {};
                
                if (this.contact_associe){
                    
                    processedChanges['contact_id'] = this.contact_associe.id
                }
                else{
                    processedChanges['contact_id'] = 0
                }

                for (let [key, value] of Object.entries(this.changes)) {
                    if (this.intFields.includes(key)) {
                        if((key == 'contact_name') || (key == 'contact_phone') || (key == 'contact_email')){
                            processedChanges[key] = parseInt(value) || false;
                        }
                        else{
                            processedChanges[key] = parseInt(value) || false;
                        }
                    } else {
                        if((key == 'contact_name') || (key == 'contact_phone') || (key == 'contact_email')){
                            processedChanges[key] = value;
                        }
                        else{
                            processedChanges[key] = value;
                        }
                    }
                }
                var company_type_checked = $('input[name="company_type"]');
                var company_type_checked_value = company_type_checked.filter(':checked').val();
                if(!company_type_checked_value){
                    return this.showPopup('ErrorPopup', {
                      title:('Le type d\'un client est requis'),
                    });
                }
                else {

                if ((!this.props.partner.name && !processedChanges.name) ||
                    processedChanges.name === '' ){
                    return this.showPopup('ErrorPopup', {
                      title: ('Le nom et prénom du client est requis'),
                    });
                }

                if (processedChanges.property_account_position_id > 0){
                    processedChanges['property_account_position_id'] = parseInt(processedChanges.property_account_position_id) || 0
                }

                processedChanges['company_type'] = company_type_checked_value
                if (company_type_checked_value === 'company') {
                    //Le cas d'une société

                    if ((!this.props.partner.phone && !processedChanges.phone) ||
                        processedChanges.phone === '' ){
                        return this.showPopup('ErrorPopup', {
                          title:('Le numéro de téléphone du client est requis'),
                        });
                    }
                    if ((!this.props.partner.country_id && !processedChanges.country_id) ||
                        (processedChanges.country_id == 0)){
                        return this.showPopup('ErrorPopup', {
                          title:('Le pays est requis'),
                        });
                    }
                    if ((!this.props.partner.siren_company && !processedChanges.siren_company) ||
                    processedChanges.siren_company === '' ){
                    return this.showPopup('ErrorPopup', {
                      title: ('SIREN est requis'),
                        });
                    }
                    }
                  if(!processedChanges.hasOwnProperty('contact_name')){
                     processedChanges['contact_name']='';
                 }
                processedChanges.id = this.props.partner.id || false;
                
                this.trigger('save-changes', { processedChanges });
                
            }
            } catch (error) {
                throw error;
            }
            }               
        };
    Registries.Component.extend(ClientDetailsEdit, POSSaveClientOverride);
    return ClientDetailsEdit;
});
