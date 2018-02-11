from flask import Flask, send_from_directory
app = Flask(__name__)

@app.route('/src/<path:path>')
def send_js(path):
    return send_from_directory('src', path)

if __name__ == "__main__":
    app.run()