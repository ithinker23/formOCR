from models.db_init import create_cursor, commit
import json
import io

def create_validation_table():
    cur = create_cursor()
    query = """CREATE TABLE IF NOT EXISTS ocr_results (
    id SERIAL PRIMARY KEY,
    template_name text not null,
    field_image bytea not null,
    field_name text not null,
    predicted_answer text not null,
    validated_answer text
    );"""

    cur.execute(query)

    commit()
    cur.close()

def save_training_data(training_data):
    cur = create_cursor()

    for field in training_data:
        img_byte_arr = io.BytesIO()
        field.get('field_image').save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        cur.execute('''INSERT INTO ocr_results (template_name, field_image, predicted_answer, field_name) VALUES (%s,%s,%s, %s)''', (field.get('template_name'), img_byte_arr, field.get("prediction"), field.get('field_name')))

    commit()
    cur.close()

def add_validation(name, field_name, validation):
    cur = create_cursor()
    query = "UPDATE ocr_results SET validated_answer = '{}' WHERE template_name = '{}' AND field_name = '{}'".format(validation, name, field_name)
    print(query)
    cur.execute(query)

    commit()
    cur.close()