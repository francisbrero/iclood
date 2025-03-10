from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/test')
def test():
    return jsonify({
        'status': 'success',
        'message': 'Test Flask app is running!'
    })

if __name__ == '__main__':
    app.run(debug=True) 