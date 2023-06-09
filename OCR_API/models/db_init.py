import psycopg2
import config

db = psycopg2.connect(
        host=config.db_host,
        database=config.db_name,
        user=config.db_user,
        password=config.db_pass)

def create_cursor():

    cur = db.cursor()

    return cur

def commit():
    db.commit()