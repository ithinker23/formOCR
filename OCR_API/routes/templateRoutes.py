from flask import Blueprint
from controllers.templateController import save_template_controller

templateBP = Blueprint('templateBP', __name__)

templateBP.route('/saveTemplate', methods=['POST'])(save_template_controller)