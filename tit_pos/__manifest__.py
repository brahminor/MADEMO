# -*- encoding: utf-8 -*-
# Copyright 2021
{
    'name': "Tit pos solution",

    "version": "1.0.1",
    "author": "Sogesi",
    "website": "https://www.sogesi-dz.com",
    "sequence": 0,
    "depends": [
            "point_of_sale", "tit_base","pos_hr"
    ],
    "category": "Point of Sale",
    'license': 'LGPL-3',
    "description": """
    """,
    "data": [
        'templates/point_of_sale_assets.xml',
        'views/accountFiscalPosition_view.xml'
    ],
    'qweb': [
            "static/src/xml/Screens/ClientDetailsEdit.xml",
        ],
    'images': ['static/description/images/icon.png'],
    "auto_install": False,
    "installable": True,
    "application": False,
    
}