from flask import Flask
from flask_cors import CORS
from .config import Config
from .db import db
from .routes.job_routes import job_bp

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])
app.config.from_object(Config)
db.init_app(app)

app.register_blueprint(job_bp)

if __name__ == '__main__':
    app.run(debug=True)