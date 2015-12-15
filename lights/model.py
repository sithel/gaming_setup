"""Models and database functions for Class Finder"""

from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


##############################################################################
# Model definitions


class Light(db.Model):

    __tablename__ = "lights"

    combo_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    tag_id = db.Column(db.Integer, nullable=False)
    light_id = db.Column(db.Integer, nullable=False)
    x = db.Column(db.Float, nullable=False)
    y = db.Column(db.Float, nullable=False)
    status = db.Column(db.Boolean, default=0)
    brightness = db.Column(db.Integer, nullable=False)
    transition_time = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        """Provide helpful representation when printed."""

        return "<Light tag_id={} combo_id={}>".format(self.tag_id, self.combo_id)



##############################################################################
# Helper functions

def connect_to_db(app):
    """Connect the database to our Flask app."""

    # Configure to use our SQLite database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lights.db'
    db.app = app
    db.init_app(app)


if __name__ == "__main__":
    # As a convenience, if we run this module interactively, it will leave
    # you in a state of being able to work with the database directly.

    from server import app
    connect_to_db(app)
    print "Connected to DB."