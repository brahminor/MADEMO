# -*- coding: utf-8 -*-

from odoo import models, fields, api, _

class pos_session(models.Model):
	_inherit = "pos.session"

	def action_pos_session_validate(self):
		result = super(pos_session, self).action_pos_session_validate()
		pos_order = self.env['pos.order'].search([('session_id','=',self.id)])
		for record in pos_order:
			if record.commande_principale:
				if record.commande_principale.bon_livraison:
					if record.commande_principale.bon_livraison.state != 'cancel':
						record.commande_principale.bon_livraison.action_cancel()
		return result