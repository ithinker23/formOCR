from models.db_init import create_cursor, commit
import json

def create_OCR_table():
    cur = create_cursor()
    query = """CREATE TABLE IF NOT EXISTS ocr_templates (
   id SERIAL PRIMARY KEY,
   name text not null,
   fields jsonb not null );"""

    cur.execute(query)

    commit()
    cur.close()

def save_template(name, fields):
    cur = create_cursor()

    query = """INSERT INTO ocr_templates(name, fields) VALUES ('{}', '{}');""".format(name, json.dumps(fields))
    cur.execute(query)

    commit()
    cur.close()

def load_template(name):
    cur = create_cursor()

    query = """SELECT fields FROM ocr_templates WHERE name = '{}'""".format(name)
    cur.execute(query)
    res = cur.fetchone()

    commit()
    cur.close()

    return res[0]