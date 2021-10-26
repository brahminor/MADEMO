# -*- coding: utf-8 -*-

from odoo import models, fields, api, _

class pos_order(models.Model):
	_inherit = "pos.order"

	commande_principale = fields.Many2one('pos.commande',string="Commande principale", help="Ce champ prmet d'indiquer la commande principale qu'on est entrains de payer leur acompte")

	@api.model
	def fill_commande_principale(self, pos_commande, num_recu):
		#associer pos order au pos commande
		pos_order = self.env['pos.order'].search([('pos_reference','=',num_recu)])
		if pos_order and pos_commande:
			pos_order.write({'commande_principale': pos_commande})

		#si montant du = 0 donc l'état de la pos commande sera terminé
		cmd_principale = self.env['pos.commande'].browse(pos_commande)
		if cmd_principale:
			if cmd_principale.montant_du <= 0:
				cmd_principale.state = 'done'
				#cmd_principale.bon_livraison.action_cancel()
			else:
				#ajouter le produit acompte au ligne des produits de pos commande
				is_product_acompte = self.env['product.product'].get_product_acompte()
				self.env['pos.commande.line'].create({
					'product_id':is_product_acompte,
					'qty':0,
					'price_unit': pos_order.amount_paid,
					'order_id': pos_commande,
					})