"""Lights Routes"""

from jinja2 import StrictUndefined

from model import connect_to_db, db, Light

from flask import Flask, render_template, redirect, url_for, request, session, jsonify
from flask_debugtoolbar import DebugToolbarExtension

import urllib2

# This is how Flask knows what module to scan for things like routes
app = Flask(__name__)

app.secret_key = "a_big_secret"

app.jinja_env.undefined = StrictUndefined




@app.route('/tag/<tag_id>', methods=["GET"])
def process_tag(tag_id):

    print "TAG ID: ", tag_id 
    entry = Light.query.filter_by(tag_id = tag_id).first()

    opener = urllib2.build_opener(urllib2.HTTPHandler)
    request = urllib2.Request('http://')

    print "ENTRY: ", entry
    return "Rebecca makes amazing monsters"


@app.route('/')
def testing():
    print "BLAH"
    return render_template('home.html')

# needs to look up all entries in db with tag_id
# url holds the tag_id
 

# Light.query.filter(tag_id==)




if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = True

    connect_to_db(app)

    # Use the DebugToolbar
    DebugToolbarExtension(app)

    app.run(host='0.0.0.0')