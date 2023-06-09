from flask import Blueprint
from controllers.OCRController import OCR_from_template_controller,add_validated_text_controller

OCRBP = Blueprint('OCRBP', __name__)

OCRBP.route('/OCRFromTemplate', methods=['POST'])(OCR_from_template_controller)

OCRBP.route('/addValidatedAnswer', methods=['POST'])(add_validated_text_controller)