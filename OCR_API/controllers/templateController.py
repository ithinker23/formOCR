import json
from flask import request
from models.templates import save_template

def save_template_controller():
    templateInfo = json.loads(request.data.decode('utf8'))

    save_template(templateInfo.get('name'), templateInfo.get('fields'))

    return {"success": True}