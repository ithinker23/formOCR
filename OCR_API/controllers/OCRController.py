import json
from flask import request
from models.templates import load_template
from services.sceneTextService import OCR_from_template
from models.validateOCR import save_training_data, add_validation

def OCR_from_template_controller():

    template_info = json.loads(request.data.decode('utf8'))

    fields = load_template(template_info.get('name'))

    training_data, updated_fields = OCR_from_template(template_info.get('name'), fields).values()

    save_training_data(training_data)
    
    return {'success': True, 'fields':updated_fields}

def add_validated_text_controller():
    validation_info = json.loads(request.data.decode('utf8'))
    
    add_validation(validation_info.get('name'), validation_info.get('field_name'), validation_info.get('validation'))
    return {'success': True}