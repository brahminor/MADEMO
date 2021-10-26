# -*- encoding: utf-8 -*-
# Copyright 2021
{
    'name': "Tit pos acomptes",

    "version": "1.0.1",
    "author": "Sogesi",
    "website": "https://www.sogesi-dz.com",
    "sequence": 0,
    "depends": [
            "point_of_sale", "tit_pos_order", "ks_pos_low_stock_alert"
    ],
    "category": "Point of Sale",
    'license': 'LGPL-3',
    "description": """
    Ce module permet de gérer les acomptes et leurs remboursement dans le pos
    """,
    "data": [
        
        'data/product.xml',
        'views/pos_commande_view.xml',
        'views/pos_order_view.xml',
        'templates/point_of_sale_assets.xml',
    ],
    'qweb': [
            'static/src/xml/Screens/validate_later.xml',
            
        ],
    'images': ['static/description/images/icon.png'],
    "auto_install": False,
    "installable": True,
    "application": False,
    
}