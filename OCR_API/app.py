from flask import Flask
from routes.templateRoutes import templateBP
from routes.OCRRoutes import OCRBP
from flask_cors import CORS
from models.templates import create_OCR_table
from models.validateOCR import create_validation_table

def create_app():
    app = Flask(__name__)  # flask app object
    app.config.from_object('config')  # Configuring from Python Files
    create_OCR_table() # create table if not exists
    create_validation_table() # create table if not exists
    return app


app = create_app()  # Creating the app

# Registering the blueprint
app.register_blueprint(templateBP, url_prefix='/templates')
app.register_blueprint(OCRBP, url_prefix='/OCR')

CORS(app) #add cors

if __name__ == '__main__':  # Running the app
    app.run(host='127.0.0.1', port=5000, debug=True)