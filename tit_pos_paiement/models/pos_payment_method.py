# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.addons.base.models.res_partner import WARNING_MESSAGE, WARNING_HELP

class Pos_payment_method(models.Model):
    _inherit = "pos.payment.method"

    methode_avoir = fields.Boolean('Avoir',help="Cocher cette case si c'est un journal pour l'avoir'")
    deferred_check = fields.Boolean('Chèque différé',help="Cocher cette case si c'est un journal pour les chèques différé dans le pos")
    check= fields.Boolean('Chèque',help="Cocher cette case si c'est un journal pour les chèques dans le pos")
    check_kdo= fields.Boolean('Chèque KDO',help="Cocher cette case si c'est un journal pour les chèques KDO dans le pos")
    
    cash_journal_bank_id = fields.Many2one('account.journal',
        string='Cash Journal',
        domain=[('type', '=', 'bank')],
        ondelete='restrict',
        help='The payment method is of type bank. A bank statement will be automatically generated.')